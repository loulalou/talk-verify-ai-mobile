import { useState } from "react";
import { Brain, BookOpen, GraduationCap, User, Laptop, Microscope } from "lucide-react";
import { cn } from "@/lib/utils";

export type AvatarType = "teacher" | "student" | "researcher" | "mentor" | "developer" | "scientist";

interface AvatarOption {
  id: AvatarType;
  icon: React.ReactNode;
  label: string;
}

const avatarOptions: AvatarOption[] = [
  { id: "teacher", icon: <Brain className="w-6 h-6" />, label: "Professeur" },
  { id: "student", icon: <BookOpen className="w-6 h-6" />, label: "Étudiant" },
  { id: "researcher", icon: <Microscope className="w-6 h-6" />, label: "Chercheur" },
  { id: "mentor", icon: <GraduationCap className="w-6 h-6" />, label: "Mentor" },
  { id: "developer", icon: <Laptop className="w-6 h-6" />, label: "Développeur" },
  { id: "scientist", icon: <User className="w-6 h-6" />, label: "Scientifique" },
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
            "flex flex-col items-center justify-center p-4 rounded-lg border-2 border-border/50 transition-all duration-200",
            value === option.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
          )}
        >
          <div className={cn(
            "p-2 rounded-full mb-2",
            value === option.id ? "text-primary" : "text-foreground"
          )}>
            {option.icon}
          </div>
          <span className="text-sm">{option.label}</span>
        </button>
      ))}
    </div>
  );
}