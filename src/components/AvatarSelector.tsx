import { useState } from "react";
import { cn } from "@/lib/utils";

export type AvatarType = "fun1" | "fun2" | "fun3" | "lorelei1" | "lorelei2" | "lorelei3";

interface AvatarOption {
  id: AvatarType;
  url: string;
  label: string;
}

const avatarOptions: AvatarOption[] = [
  { 
    id: "fun1", 
    url: "https://api.dicebear.com/8.x/fun-emoji/svg?seed=student1",
    label: "Fun 1" 
  },
  { 
    id: "fun2", 
    url: "https://api.dicebear.com/8.x/fun-emoji/svg?seed=student2",
    label: "Fun 2" 
  },
  { 
    id: "fun3", 
    url: "https://api.dicebear.com/8.x/fun-emoji/svg?seed=student3",
    label: "Fun 3" 
  },
  { 
    id: "lorelei1", 
    url: "https://api.dicebear.com/8.x/lorelei/svg?seed=emma",
    label: "Emma" 
  },
  { 
    id: "lorelei2", 
    url: "https://api.dicebear.com/8.x/lorelei/svg?seed=lucas",
    label: "Lucas" 
  },
  { 
    id: "lorelei3", 
    url: "https://api.dicebear.com/8.x/lorelei/svg?seed=marie",
    label: "Marie" 
  },
];

interface AvatarSelectorProps {
  value: AvatarType;
  onChange: (value: AvatarType) => void;
}

export function AvatarSelector({ value, onChange }: AvatarSelectorProps) {
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
            "w-16 h-16 rounded-full mb-2 overflow-hidden border-2 transition-all",
            value === option.id ? "border-primary" : "border-border"
          )}>
            <img 
              src={option.url} 
              alt={option.label}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23ddd'/%3E%3C/svg%3E";
              }}
            />
          </div>
          <span className="text-sm font-medium">{option.label}</span>
        </button>
      ))}
    </div>
  );
}