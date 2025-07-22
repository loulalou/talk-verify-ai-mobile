import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isProcessing?: boolean;
}

export function VoiceRecorder({ onRecordingComplete, isProcessing }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(average / 255);
          animationRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();

      // Setup recording
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        setAudioLevel(0);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Voice Level Visualization */}
      {isRecording && (
        <div className="flex space-x-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1 bg-ai-primary rounded-full transition-all duration-100",
                audioLevel > i * 0.2 ? "h-8 opacity-100" : "h-2 opacity-30"
              )}
              style={{
                animationDelay: `${i * 100}ms`
              }}
            />
          ))}
        </div>
      )}

      {/* Main Record Button */}
      <div className="relative">
        <Button
          variant={isRecording ? "voice-active" : "voice"}
          size="voice-lg"
          onClick={handleToggleRecording}
          disabled={isProcessing}
          className={cn(
            "relative overflow-hidden",
            isRecording && "animate-glow"
          )}
        >
          {isRecording ? (
            <Square className="h-12 w-12" />
          ) : (
            <Mic className="h-12 w-12" />
          )}
          
          {/* Ripple Effect */}
          {isRecording && (
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
          )}
        </Button>
        
        {/* Outer Ring */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full border-2 border-ai-primary/20 transition-all duration-300",
            isRecording && "border-ai-primary/60 scale-110"
          )}
        />
      </div>

      {/* Status Text */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-ai-primary rounded-full animate-pulse" />
              Processing...
            </span>
          ) : isRecording ? (
            "Tap to stop recording"
          ) : (
            "Tap to start speaking"
          )}
        </p>
      </div>
    </div>
  );
}