import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form states
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState("");
  const [age, setAge] = useState("");
  const [schoolLevel, setSchoolLevel] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const maxSteps = 4;

  const schoolLevels = [
    { value: "cp", label: "CP" },
    { value: "ce1", label: "CE1" },
    { value: "ce2", label: "CE2" },
    { value: "cm1", label: "CM1" },
    { value: "cm2", label: "CM2" },
    { value: "6eme", label: "6ème" },
    { value: "5eme", label: "5ème" },
    { value: "4eme", label: "4ème" },
    { value: "3eme", label: "3ème" },
    { value: "seconde", label: "Seconde" },
    { value: "premiere", label: "Première" },
    { value: "terminale", label: "Terminale" },
    { value: "superieur", label: "Enseignement supérieur" },
  ];

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return accountType !== "";
      case 2:
        return age !== "";
      case 3:
        return schoolLevel !== "";
      case 4:
        return name !== "";
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!validateStep(step)) {
      toast({
        title: "Champ requis",
        description: "Veuillez remplir ce champ pour continuer.",
        variant: "destructive"
      });
      return;
    }
    if (step < maxSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4) || !email || !password) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs pour créer votre compte.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            account_type: accountType,
            age: age,
            school_level: schoolLevel,
            name: name
          }
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast({
            title: "Compte existant",
            description: "Un compte existe déjà avec cette adresse email.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      if (data.user) {
        toast({
          title: "Compte créé !",
          description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter."
        });
        navigate("/auth");
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création du compte",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <Label className="text-lg font-medium">Ce compte est :</Label>
            <RadioGroup value={accountType} onValueChange={setAccountType} className="space-y-3">
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted transition-colors">
                <RadioGroupItem value="parent" id="parent" />
                <Label htmlFor="parent" className="cursor-pointer text-base">Je suis parent d'élève</Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted transition-colors">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student" className="cursor-pointer text-base">Je suis élève</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <Label className="text-lg font-medium">
              {accountType === "parent" ? "Quel âge a votre enfant ?" : "Quel est ton âge ?"}
            </Label>
            <Input
              type="number"
              placeholder="Âge"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="3"
              max="25"
              className="text-base"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Label className="text-lg font-medium">
              {accountType === "parent" 
                ? "Quel est le niveau scolaire de votre enfant ?" 
                : "En quelle classe es-tu ?"}
            </Label>
            <Select value={schoolLevel} onValueChange={setSchoolLevel}>
              <SelectTrigger className="text-base">
                <SelectValue placeholder="Sélectionnez le niveau" />
              </SelectTrigger>
              <SelectContent>
                {schoolLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <Label className="text-lg font-medium">
              {accountType === "parent" 
                ? "Quel est le prénom de votre enfant ?" 
                : "Quel est ton prénom ?"}
            </Label>
            <Input
              type="text"
              placeholder="Prénom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base"
            />
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Mot de passe</Label>
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Créer un compte</CardTitle>
            <span className="text-sm text-muted-foreground">{step}/{maxSteps}</span>
          </div>
          <Progress value={(step / maxSteps) * 100} className="w-full" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStepContent()}
          
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>
            
            {step < maxSteps ? (
              <Button
                onClick={nextStep}
                disabled={!validateStep(step)}
                className="flex items-center gap-2"
              >
                Continuer
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!validateStep(4) || !email || !password || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? "Création..." : "Créer mon compte 🚀"}
              </Button>
            )}
          </div>
          
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/auth")}
              className="text-muted-foreground"
            >
              Retour à la connexion
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}