import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AvatarType, generateBlockiesAvatar } from "./AvatarSelector";

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
  const { user } = useAuth();
  const [userAvatar, setUserAvatar] = useState<AvatarType>("avatar1");
  
  console.log("ChatMessage rendered:", { messageType: message.type, userAvatar });
  
  // Récupérer l'avatar de l'utilisateur depuis la base de données
  useEffect(() => {
    if (user) {
      console.log("Attempting to fetch avatar in ChatMessage for user:", user.id);
      const fetchUserAvatar = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('avatar')
            .eq('user_id', user.id)
            .maybeSingle();
          
          console.log("Avatar fetch result:", { data, error, userId: user.id });
          
          if (data && !error && data.avatar) {
            setUserAvatar(data.avatar as AvatarType);
            console.log("User avatar set to:", data.avatar);
          } else if (error) {
            console.error("Error fetching avatar:", error);
          } else {
            console.log("No avatar found or profile not yet created");
          }
        } catch (err) {
          console.error("Exception during avatar fetch:", err);
        }
      };
      
      fetchUserAvatar();
    } else {
      console.log("No user logged in, using default avatar");
    }
  }, [user]);
  
  // Fonction pour récupérer l'icône basé sur le type d'avatar
  const getAvatarUrl = (avatarType: AvatarType) => {
    const seeds: Record<AvatarType, string> = {
      "avatar1": "student1",
      "avatar2": "student2", 
      "avatar3": "student3",
      "avatar4": "emma",
      "avatar5": "lucas",
      "avatar6": "marie",
    };
    
    return generateBlockiesAvatar(seeds[avatarType]);
  };
  
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
        <Avatar className="h-8 w-8 flex-shrink-0">
          {isUser ? (
            <>
              <AvatarImage 
                src={getAvatarUrl(userAvatar)} 
                alt="Avatar utilisateur"
                className="object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                U
              </AvatarFallback>
            </>
          ) : (
            <>
              <AvatarFallback className="bg-gradient-accent text-white">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </>
          )}
        </Avatar>

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