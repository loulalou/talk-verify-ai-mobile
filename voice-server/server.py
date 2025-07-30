# server.py  ─ version monofichier fonctionnelle
import asyncio, contextlib, os, signal
from contextlib import asynccontextmanager
from typing import Optional, Set

import aiohttp
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from pydantic import BaseModel

from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.audio.vad.vad_analyzer import VADParams
from pipecat.frames.frames import EndFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.frameworks.rtvi import RTVIConfig, RTVIObserver, RTVIProcessor
from pipecat.services.gemini_multimodal_live.gemini import (
    GeminiMultimodalLiveLLMService,
    InputParams,
)
from pipecat.services.openai.llm import OpenAILLMContext
from pipecat.services.openai_realtime_beta import OpenAIRealtimeBetaLLMService
from pipecat.services.openai_realtime_beta.events import (
    InputAudioTranscription,
    SessionProperties,
)
from pipecat.transcriptions.language import Language
from pipecat.transports.services.daily import DailyParams, DailyTransport
from pipecat.transports.services.helpers.daily_rest import (
    DailyRESTHelper,
    DailyRoomParams,
)

# ───────────────────── Configuration ─────────────────────
load_dotenv()
CFG = {
    "bot_impl": os.getenv("BOT_IMPLEMENTATION", "gemini"),
    "daily_api_key": os.getenv("DAILY_API_KEY"),
    "gemini_api_key": os.getenv("GEMINI_API_KEY"),
    "openai_api_key": os.getenv("OPENAI_API_KEY"),
}
SHUTDOWN_TIMEOUT = int(os.getenv("SHUTDOWN_TIMEOUT", 10))

aiohttp_session: Optional[aiohttp.ClientSession] = None
daily_rest: Optional[DailyRESTHelper] = None


# ─────────────────── Pydantic DTOs ───────────────────────
class ConnectRequest(BaseModel):
    bot_implementation: Optional[str] = None
    category: Optional[str] = None
    periods: Optional[list[str]] = None


class ConnectResponse(BaseModel):
    room_url: str
    token: str
    bot_implementation: str


# ─────────────── FastAPI lifespan ────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    global aiohttp_session, daily_rest
    logger.info("🟢  Pipecat Voice‑Bot Server starting")
    aiohttp_session = aiohttp.ClientSession()
    daily_rest = DailyRESTHelper(
        daily_api_key=CFG["daily_api_key"],
        daily_api_url=os.getenv("DAILY_API_URL", "https://api.daily.co/v1"),
        aiohttp_session=aiohttp_session,
    )
    app.state.bot_tasks: Set[asyncio.Task] = set()
    yield
    logger.info("🟡  Server shutdown initiated")
    for t in list(app.state.bot_tasks):
        t.cancel()
    for t in list(app.state.bot_tasks):
        try:
            await asyncio.wait_for(t, SHUTDOWN_TIMEOUT)
        except (asyncio.CancelledError, asyncio.TimeoutError):
            logger.error("Bot task did not stop in time")
    if aiohttp_session and not aiohttp_session.closed:
        await aiohttp_session.close()
    logger.info("🔴  Server stopped")


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────── Daily helpers ───────────────────────────
async def create_room():
    try:
        room = await daily_rest.create_room(DailyRoomParams())
        logger.info(f"Daily room created → {room.url}")
        return room
    except Exception as e:
        raise HTTPException(500, f"Room creation failed: {e}")


async def create_token(room_url: str):
    try:
        return await daily_rest.get_token(room_url, expiry_time=86_400)
    except Exception as e:
        raise HTTPException(500, f"Token creation failed: {e}")


# ───────────── Builders Gemini / OpenAI ──────────────────
def _gemini(room_url: str, token: str, rtvi: RTVIProcessor, category: str = None, periods: list = None):
    transport = DailyTransport(
        room_url,
        token,
        "AI Assistant (Gemini)",
        DailyParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            vad_analyzer=SileroVADAnalyzer(params=VADParams(stop_secs=0.5)),
        ),
    )
    
    # Construire l'instruction système en fonction du contexte
    system_instruction = "Tu es un professeur particulier bienveillant et pédagogue."
    if category:
        system_instruction += f" Tu enseignes {category}."
    if periods:
        system_instruction += f" Les sujets d'étude sont: {', '.join(periods)}."
    
    llm = GeminiMultimodalLiveLLMService(
        api_key=CFG["gemini_api_key"],
        model="models/gemini-2.5-flash-live-preview",
        voice_id="Puck",
        system_instruction=system_instruction,
        params=InputParams(temperature=0.7, language=Language.FR_FR),
        transcribe_user_audio=True,
        transcribe_model_audio=True,
    )
    return _build_pipeline(transport, llm, rtvi)


def _openai(room_url: str, token: str, rtvi: RTVIProcessor, category: str = None, periods: list = None):
    transport = DailyTransport(
        room_url,
        token,
        "AI Assistant (OpenAI)",
        DailyParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            vad_analyzer=SileroVADAnalyzer(params=VADParams(stop_secs=0.5)),
        ),
    )
    
    # Construire l'instruction système en fonction du contexte
    instructions = "Tu es un professeur particulier bienveillant et pédagogue."
    if category:
        instructions += f" Tu enseignes {category}."
    if periods:
        instructions += f" Les sujets d'étude sont: {', '.join(periods)}."
    
    llm = OpenAIRealtimeBetaLLMService(
        api_key=CFG["openai_api_key"],
        model="gpt-4o-mini-realtime-preview",
        session_properties=SessionProperties(
            instructions=instructions,
            voice="alloy",
            input_audio_transcription=InputAudioTranscription(
                model="gpt-4o-mini-transcribe", language="fr"
            ),
            temperature=0.7,
        ),
    )
    return _build_pipeline(transport, llm, rtvi)


def _build_pipeline(transport, llm, rtvi):
    context = OpenAILLMContext(
        [
            {
                "role": "user",
                "content": "Tu es un assistant vocal intelligent et amical. Garde tes réponses concises et naturelles.",
            }
        ]
    )
    ctx_agg = llm.create_context_aggregator(context)
    pipe = Pipeline(
        [
            transport.input(),
            rtvi,
            ctx_agg.user(),
            llm,
            transport.output(),
            ctx_agg.assistant(),
        ]
    )
    task = PipelineTask(
        pipe,
        params=PipelineParams(
            allow_interruptions=True, enable_metrics=True, enable_usage_metrics=True
        ),
        observers=[RTVIObserver(rtvi)],
    )
    return transport, task, llm


# ─────────── Ctrl‑C : stop pipeline + stop boucle ─────────
def _chain_runner_signals(runner: PipelineRunner):
    loop = asyncio.get_event_loop()
    original = runner._sig_handler  # sans args

    def chained():
        original()  # annule le pipeline
        loop.stop()  # stoppe uvicorn

    runner._sig_handler = chained


# ─────────────── Bot runner ───────────────────────────────
async def run_bot(room_url: str, token: str, impl: str, category: str = None, periods: list = None):
    logger.info(f"▶️  Bot {impl} for room {room_url}")
    rtvi = RTVIProcessor(config=RTVIConfig(config=[]))
    transport, task, llm = (_gemini if impl == "gemini" else _openai)(
        room_url, token, rtvi, category, periods
    )

    runner = PipelineRunner()
    _chain_runner_signals(runner)

    @rtvi.event_handler("on_client_ready")
    async def _(rtvi):
        logger.info("Client ready")

    @transport.event_handler("on_first_participant_joined")
    async def _(_, p):
        logger.info(f"First participant: {p['id']}")
        await transport.capture_participant_transcription(p["id"])
        await task.queue_frames(
            [
                llm.create_context_aggregator(OpenAILLMContext())
                .user()
                .get_context_frame()
            ]
        )

    @transport.event_handler("on_participant_left")
    async def _(_, p, r):
        logger.info(f"Participant left {p['id']} ({r})")
        await task.queue_frames([EndFrame()])

    try:
        await runner.run(task)
    finally:
        with contextlib.suppress(Exception):
            await transport.close()
        if hasattr(llm, "close"):
            with contextlib.suppress(Exception):
                await llm.close()
        logger.info("⏹️  Bot finished")


# ─────────────── Endpoints ───────────────────────────────
@app.post("/connect", response_model=ConnectResponse)
async def connect(req: ConnectRequest):
    impl = req.bot_implementation or CFG["bot_impl"]
    if impl not in {"gemini", "openai"}:
        raise HTTPException(400, "impl must be gemini/openai")
    if impl == "gemini" and not CFG["gemini_api_key"]:
        raise HTTPException(500, "No Gemini key")
    if impl == "openai" and not CFG["openai_api_key"]:
        raise HTTPException(500, "No OpenAI key")

    room = await create_room()
    token = await create_token(room.url)
    task = asyncio.create_task(run_bot(room.url, token, impl, req.category, req.periods))
    app.state.bot_tasks.add(task)
    task.add_done_callback(app.state.bot_tasks.discard)
    return ConnectResponse(room_url=room.url, token=token, bot_implementation=impl)


@app.get("/health")
async def health():
    return JSONResponse({"status": "healthy"})


# ─────────────── Entrypoint ──────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "server:app",
        host=os.getenv("SERVER_HOST", "0.0.0.0"),
        port=int(os.getenv("SERVER_PORT", 7860)),
        reload=os.getenv("RELOAD", "false").lower() == "true",
        log_level="info",
    )