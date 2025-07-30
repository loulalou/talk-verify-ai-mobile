import React, { useCallback, useState } from 'react';
import { 
  usePipecatClient, 
  useRTVIClientEvent,
  PipecatClientAudio,
  PipecatClientMicToggle
} from '@pipecat-ai/client-react';
import { 
  RTVIEvent, 
  TransportState,
  TranscriptData,
  BotLLMTextData
} from '@pipecat-ai/client-js';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Phone, PhoneOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceChatProps {
  provider: 'gemini' | 'openai';
  category?: string;
  periods?: string[];
  onProviderChange: (provider: 'gemini' | 'openai') => void;
}

interface TranscriptEntry {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  final?: boolean;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ provider, category, periods, onProviderChange }) => {
  const client = usePipecatClient();
  const [connectionState, setConnectionState] = useState<TransportState>('disconnected');
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentUserTranscript, setCurrentUserTranscript] = useState<string>('');
  const [isMicActive, setIsMicActive] = useState(false);
  const [currentBotMessageId, setCurrentBotMessageId] = useState<string | null>(null);
  const { toast } = useToast();

  // Handle transport state changes
  useRTVIClientEvent(
    RTVIEvent.TransportStateChanged,
    useCallback((state: TransportState) => {
      console.log('Transport state changed:', state);
      setConnectionState(state);
      setIsConnecting(state === 'connecting' || state === 'initializing');
    }, [])
  );

  // Handle user transcripts
  useRTVIClientEvent(
    RTVIEvent.UserTranscript,
    useCallback((data: TranscriptData) => {
      if (data.final) {
        setTranscripts(prev => {
          const lastEntry = prev[prev.length - 1];
          if (lastEntry && lastEntry.role === 'user' && !lastEntry.final) {
            return [
              ...prev.slice(0, -1),
              { ...lastEntry, text: data.text, final: true }
            ];
          } else {
            return [...prev, {
              id: `user-${Date.now()}`,
              role: 'user',
              text: data.text,
              timestamp: new Date(),
              final: true,
            }];
          }
        });
        setCurrentUserTranscript('');
      } else {
        setCurrentUserTranscript(data.text);
        setTranscripts(prev => {
          const lastEntry = prev[prev.length - 1];
          if (lastEntry && lastEntry.role === 'user' && !lastEntry.final) {
            return [
              ...prev.slice(0, -1),
              { ...lastEntry, text: data.text }
            ];
          } else {
            return [...prev, {
              id: `user-temp-${Date.now()}`,
              role: 'user',
              text: data.text,
              timestamp: new Date(),
              final: false,
            }];
          }
        });
      }
    }, [])
  );

  // Handle bot responses
  useRTVIClientEvent(
    RTVIEvent.BotTranscript,
    useCallback((data: BotLLMTextData) => {
      const newEntry: TranscriptEntry = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.text,
        timestamp: new Date(),
      };
      setTranscripts(prev => [...prev, newEntry]);
    }, [])
  );

  // Handle bot LLM text (only for Gemini)
  useRTVIClientEvent(
    RTVIEvent.BotLlmText,
    useCallback((data: BotLLMTextData) => {
      if (provider === 'gemini') {
        setTranscripts(prevTranscripts => {
          const lastEntry = prevTranscripts[prevTranscripts.length - 1];
          
          if (lastEntry && lastEntry.role === 'assistant' && !lastEntry.final) {
            return [
              ...prevTranscripts.slice(0, -1),
              { ...lastEntry, text: lastEntry.text + data.text }
            ];
          } else {
            if (!currentBotMessageId) {
              const newId = `bot-${Date.now()}`;
              setCurrentBotMessageId(newId);
              const newEntry: TranscriptEntry = {
                id: newId,
                role: 'assistant',
                text: data.text,
                timestamp: new Date(),
                final: false
              };
              return [...prevTranscripts, newEntry];
            }
            return prevTranscripts;
          }
        });
      }
    }, [currentBotMessageId, provider])
  );

  // Handle bot ready
  useRTVIClientEvent(
    RTVIEvent.BotReady,
    useCallback(() => {
      console.log('Bot is ready!');
      toast({
        title: "Assistant vocal prêt",
        description: "Vous pouvez maintenant parler",
      });
    }, [toast])
  );

  // Handle bot stopped speaking
  useRTVIClientEvent(
    RTVIEvent.BotStoppedSpeaking,
    useCallback(() => {
      if (currentBotMessageId) {
        setTranscripts(prev => 
          prev.map(entry => 
            entry.id === currentBotMessageId 
              ? { ...entry, final: true } 
              : entry
          )
        );
      }
      setCurrentBotMessageId(null);
    }, [currentBotMessageId])
  );

  // Handle bot started speaking
  useRTVIClientEvent(
    RTVIEvent.BotStartedSpeaking,
    useCallback(() => {
      setCurrentBotMessageId(null);
    }, [])
  );

  // Handle user started/stopped speaking
  useRTVIClientEvent(
    RTVIEvent.UserStartedSpeaking,
    useCallback(() => {
      setIsMicActive(true);
    }, [])
  );

  useRTVIClientEvent(
    RTVIEvent.UserStoppedSpeaking,
    useCallback(() => {
      setIsMicActive(false);
    }, [])
  );

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const API_URL = import.meta.env.VITE_VOICE_API_URL || 'http://localhost:7860';
      
      const response = await fetch(`${API_URL}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bot_implementation: provider,
          category: category,
          periods: periods
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const connectionData = await response.json();
      
      await client?.connect({
        url: connectionData.room_url,
        token: connectionData.token,
      });
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter à l'assistant vocal",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await client?.disconnect();
      setTranscripts([]);
      setCurrentUserTranscript('');
      setCurrentBotMessageId(null);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const isConnected = connectionState === 'connected' || connectionState === 'ready';

  return (
    <div className="flex flex-col h-full">
      {/* Header avec contrôles */}
      <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          {/* Sélecteur de modèle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Modèle IA :</span>
            <div className="flex rounded-md shadow-sm">
              <Button
                size="sm"
                variant={provider === 'gemini' ? 'default' : 'outline'}
                onClick={() => !isConnected && onProviderChange('gemini')}
                disabled={isConnected}
                className="rounded-r-none"
              >
                Gemini
              </Button>
              <Button
                size="sm"
                variant={provider === 'openai' ? 'default' : 'outline'}
                onClick={() => !isConnected && onProviderChange('openai')}
                disabled={isConnected}
                className="rounded-l-none"
              >
                OpenAI
              </Button>
            </div>
          </div>

          {/* Status de connexion */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className={cn(
              "text-sm font-medium",
              isConnected ? "text-green-700" : "text-muted-foreground"
            )}>
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
        </div>

        {/* Bouton de connexion */}
        {!isConnected ? (
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            size="default"
            variant="default"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connexion...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 mr-2" />
                Se connecter à l'assistant vocal
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleDisconnect}
            size="default"
            variant="destructive"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            Déconnecter
          </Button>
        )}
      </div>

      {/* Zone de chat */}
      <div className="flex-1 overflow-hidden bg-gradient-to-b from-background/50 to-muted/30">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {transcripts.length === 0 && isConnected ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ai-primary/10 mb-4">
                  <Mic className="w-8 h-8 text-ai-primary" />
                </div>
                <p className="text-muted-foreground">
                  Commencez à parler pour démarrer la conversation...
                </p>
                <p className="text-sm text-muted-foreground/70 mt-2">
                  Assurez-vous que votre microphone est activé
                </p>
              </div>
            ) : (
              transcripts.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      entry.role === 'user'
                        ? 'bg-blue-50 text-blue-900 border border-blue-200'
                        : 'bg-white text-foreground border border-border'
                    }`}
                  >
                    <div className="text-xs font-medium mb-1">
                      {entry.role === 'user' ? 'Vous' : 'Assistant'}
                    </div>
                    <div className="text-sm">
                      {entry.text}
                      {!entry.final && <span className="ml-1 opacity-50">...</span>}
                    </div>
                    <div className="text-xs mt-1 text-muted-foreground">
                      {entry.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Contrôles du microphone */}
      {isConnected && (
        <div className="border-t p-4 bg-background/80 backdrop-blur-sm">
          <PipecatClientMicToggle>
            {({ isMicEnabled, onClick }) => (
              <div className="flex flex-col items-center space-y-2">
                <Button
                  onClick={onClick}
                  variant={isMicEnabled ? "default" : "outline"}
                  size="lg"
                  className={cn(
                    "w-full max-w-xs transition-all",
                    isMicActive && "animate-pulse",
                    isMicEnabled && "bg-green-600 hover:bg-green-700 text-white",
                    !isMicEnabled && "bg-red-100 hover:bg-red-200 text-red-700 border-red-300"
                  )}
                >
                  {isMicEnabled ? (
                    <>
                      <Mic className="w-5 h-5 mr-2" />
                      Microphone activé
                    </>
                  ) : (
                    <>
                      <MicOff className="w-5 h-5 mr-2" />
                      Microphone désactivé
                    </>
                  )}
                </Button>
                
                {currentUserTranscript && (
                  <p className="text-sm text-muted-foreground italic text-center">
                    "{currentUserTranscript}"
                  </p>
                )}
              </div>
            )}
          </PipecatClientMicToggle>
        </div>
      )}

      <PipecatClientAudio />
    </div>
  );
};

export default VoiceChat;