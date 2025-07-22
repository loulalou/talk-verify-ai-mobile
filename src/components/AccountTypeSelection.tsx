import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AccountTypeSelectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function AccountTypeSelection({ value, onChange }: AccountTypeSelectionProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Ce compte est :</Label>
      <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="student" id="student" />
          <Label htmlFor="student" className="cursor-pointer">Je suis élève</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="parent" id="parent" />
          <Label htmlFor="parent" className="cursor-pointer">Pour mon enfant</Label>
        </div>
      </RadioGroup>
    </div>
  );
}