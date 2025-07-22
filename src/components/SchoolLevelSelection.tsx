import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SchoolLevelSelectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function SchoolLevelSelection({ value, onChange }: SchoolLevelSelectionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="school-level">Niveau scolaire *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionnez votre niveau" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cp">CP</SelectItem>
          <SelectItem value="ce1">CE1</SelectItem>
          <SelectItem value="ce2">CE2</SelectItem>
          <SelectItem value="cm1">CM1</SelectItem>
          <SelectItem value="cm2">CM2</SelectItem>
          <SelectItem value="6eme">6ème</SelectItem>
          <SelectItem value="5eme">5ème</SelectItem>
          <SelectItem value="4eme">4ème</SelectItem>
          <SelectItem value="3eme">3ème</SelectItem>
          <SelectItem value="seconde">Seconde</SelectItem>
          <SelectItem value="premiere">Première</SelectItem>
          <SelectItem value="terminale">Terminale</SelectItem>
          <SelectItem value="superieur">Enseignement supérieur</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}