import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CountrySelectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function CountrySelection({ value, onChange }: CountrySelectionProps) {
  const countries = [
    { code: "FR", name: "France" },
    { code: "BE", name: "Belgique" },
    { code: "CH", name: "Suisse" },
    { code: "CA", name: "Canada" },
    { code: "MA", name: "Maroc" },
    { code: "TN", name: "Tunisie" },
    { code: "DZ", name: "Algérie" },
    { code: "SN", name: "Sénégal" },
    { code: "CI", name: "Côte d'Ivoire" },
    { code: "OTHER", name: "Autre" },
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="country">Pays *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionnez votre pays" />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}