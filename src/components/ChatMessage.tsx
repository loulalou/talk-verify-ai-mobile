import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  needsConfirmation?: boolean;
  confirmed?: boolean;
}

interface ChatMessageProps {
  message: Message;
  onConfirm?: (messageId: string) => void;
  onReject?: (messageId: string) => void;
}

export function ChatMessage({ message, onConfirm, onReject }: ChatMessageProps) {
  const isUser = message.type === 'user';
  
  return (
    <div className={cn(
      "flex w-full mb-4 animate-slide-up",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex max-w-[80%] space-x-3",
        isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser 
            ? "bg-ai-primary text-white" 
            : "bg-gradient-accent text-white"
        )}>
          {isUser ? (
            <User className="w-4 h-4" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </div>

        {/* Message Content */}
        <div className="flex flex-col space-y-2">
          <div className={cn(
            "px-4 py-3 rounded-2xl shadow-sm",
            isUser 
              ? "bg-ai-primary text-white rounded-br-md" 
              : "bg-ai-surface-elevated text-foreground rounded-bl-md border border-border/50"
          )}>
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>

          {/* Knowledge Confirmation */}
          {message.needsConfirmation && !message.confirmed && (
            <div className="bg-ai-surface border border-border/50 rounded-lg p-3 space-y-3">
              <p className="text-xs text-muted-foreground">
                Please confirm this information is accurate:
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="confirm"
                  size="sm"
                  onClick={() => onConfirm?.(message.id)}
                  className="flex-1"
                >
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReject?.(message.id)}
                  className="flex-1"
                >
                  Needs Correction
                </Button>
              </div>
            </div>
          )}

          {/* Confirmed Badge */}
          {message.confirmed && (
            <div className="flex items-center space-x-1 text-ai-accent">
              <div className="w-2 h-2 bg-ai-accent rounded-full" />
              <span className="text-xs">Confirmed</span>
            </div>
          )}

          {/* Timestamp */}
          <p className="text-xs text-muted-foreground px-2">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
}