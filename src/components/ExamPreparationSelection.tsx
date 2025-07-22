import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ExamPreparationSelectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function ExamPreparationSelection({ value, onChange }: ExamPreparationSelectionProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Préparez-vous un examen ?</Label>
      <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="none" id="none" />
          <Label htmlFor="none" className="cursor-pointer">Non</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="brevet" id="brevet" />
          <Label htmlFor="brevet" className="cursor-pointer">Brevet</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bac" id="bac" />
          <Label htmlFor="bac" className="cursor-pointer">Baccalauréat</Label>
        </div>
      </RadioGroup>
    </div>
  );
}