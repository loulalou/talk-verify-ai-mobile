import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import blockies from "ethereum-blockies";

export type AvatarType = "avatar1" | "avatar2" | "avatar3" | "avatar4" | "avatar5" | "avatar6";

interface AvatarOption {
  id: AvatarType;
  seed: string;
  label: string;
}

const avatarOptions: AvatarOption[] = [
  { 
    id: "avatar1", 
    seed: "student1",
    label: "Avatar 1" 
  },
  { 
    id: "avatar2", 
    seed: "student2",
    label: "Avatar 2" 
  },
  { 
    id: "avatar3", 
    seed: "student3",
    label: "Avatar 3" 
  },
  { 
    id: "avatar4", 
    seed: "emma",
    label: "Avatar 4" 
  },
  { 
    id: "avatar5", 
    seed: "lucas",
    label: "Avatar 5" 
  },
  { 
    id: "avatar6", 
    seed: "marie",
    label: "Avatar 6" 
  },
];

interface AvatarSelectorProps {
  value: AvatarType;
  onChange: (value: AvatarType) => void;
}

export function generateBlockiesAvatar(seed: string): string {
  const canvas = blockies.create({
    seed: seed,
    size: 8,
    scale: 8,
  });
  return canvas.toDataURL();
}

export function AvatarSelector({ value, onChange }: AvatarSelectorProps) {
  const [avatarUrls, setAvatarUrls] = useState<Record<AvatarType, string>>({} as Record<AvatarType, string>);

  useEffect(() => {
    const generateAvatars = () => {
      const urls: Record<AvatarType, string> = {} as Record<AvatarType, string>;
      avatarOptions.forEach(option => {
        urls[option.id] = generateBlockiesAvatar(option.seed);
      });
      setAvatarUrls(urls);
    };

    generateAvatars();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {avatarOptions.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "flex flex-col items-center justify-center p-4 rounded-lg border-2 border-border/50 transition-all duration-200 hover:scale-105",
            value === option.id ? "bg-primary/10 border-primary shadow-md" : "hover:bg-muted"
          )}
        >
          <div className={cn(
            "w-16 h-16 rounded-lg mb-2 overflow-hidden border-2 transition-all",
            value === option.id ? "border-primary" : "border-border"
          )}>
            {avatarUrls[option.id] && (
              <img 
                src={avatarUrls[option.id]} 
                alt={option.label}
                className="w-full h-full object-cover pixelated"
                style={{ imageRendering: 'pixelated' }}
              />
            )}
          </div>
          <span className="text-sm font-medium">{option.label}</span>
        </button>
      ))}
    </div>
  );
}