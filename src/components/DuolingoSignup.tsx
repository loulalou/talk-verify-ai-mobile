import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AvatarSelector, AvatarType } from "@/components/AvatarSelector";
import { ChevronLeft, ChevronRight, User, GraduationCap, BookOpen, MapPin, Mail, Lock, Heart } from "lucide-react";

interface DuolingoSignupProps {
  onSuccess: () => void;
}

export function DuolingoSignup({ onSuccess }: DuolingoSignupProps) {
  const { toast } = useToast();
  
  // Form states
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // User data
  const [accountType, setAccountType] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [schoolLevel, setSchoolLevel] = useState("");
  const [country, setCountry] = useState("");
  const [examPreparation, setExamPreparation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<AvatarType>("fun1");

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

  const maxSteps = accountType === "student" ? 4 : 3;

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return Boolean(accountType);
      case 2:
        if (accountType === "student") {
          return Boolean(name && age && schoolLevel);
        }
        return Boolean(name);
      case 3:
        if (accountType === "student") {
          return Boolean(country && examPreparation);
        }
        return Boolean(email && password);
      case 4:
        return Boolean(email && password);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const signupData: any = {
        name,
        avatar,
        account_type: accountType
      };

      if (accountType === "student") {
        signupData.age = age ? parseInt(age) : null;
        signupData.school_level = schoolLevel;
        signupData.country = country;
        signupData.exam_preparation = examPreparation;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: signupData
        }
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Compte existant",
            description: "Cet email est déjà enregistré. Veuillez vous connecter.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      if (data.user) {
        toast({
          title: "Bienvenue ! 🎉",
          description: "Votre compte a été créé avec succès !"
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Échec de la création du compte",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStepColor = (stepNumber: number) => {
    if (stepNumber === 1) return "duolingo-green";
    if (stepNumber === 2) return "duolingo-blue";
    if (stepNumber === 3) return "duolingo-yellow";
    return "duolingo-purple";
  };

  const currentColor = getStepColor(step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-duolingo-green-light via-duolingo-blue-light to-duolingo-purple-light p-4 flex items-center justify-center">
      <Card className="w-full max-w-lg shadow-xl border-0 overflow-hidden">
        {/* Progress Bar */}
        <div className={`h-2 bg-${currentColor} transition-all duration-500`} 
             style={{ width: `${(step / maxSteps) * 100}%` }} />
        
        <CardContent className="p-8">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex space-x-2">
              {Array.from({ length: maxSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i + 1 <= step 
                      ? `bg-${currentColor}` 
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <span className="ml-4 text-sm font-medium text-muted-foreground">
              {step} / {maxSteps}
            </span>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {step === 1 && (
              <div className="text-center space-y-6">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-duolingo-green rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Quel type de compte ?</h2>
                  <p className="text-muted-foreground">Choisissez l'option qui vous correspond</p>
                </div>
                
                <RadioGroup value={accountType} onValueChange={setAccountType} className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-muted hover:border-duolingo-green hover:bg-duolingo-green-light transition-all cursor-pointer">
                    <RadioGroupItem value="student" id="student" className="text-duolingo-green" />
                    <div className="flex items-center space-x-3 flex-1 cursor-pointer" onClick={() => setAccountType("student")}>
                      <GraduationCap className="w-6 h-6 text-duolingo-green" />
                      <div className="text-left">
                        <Label htmlFor="student" className="text-base font-medium cursor-pointer">Je suis élève</Label>
                        <p className="text-sm text-muted-foreground">Créer mon propre compte</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-muted hover:border-duolingo-blue hover:bg-duolingo-blue-light transition-all cursor-pointer">
                    <RadioGroupItem value="parent" id="parent" className="text-duolingo-blue" />
                    <div className="flex items-center space-x-3 flex-1 cursor-pointer" onClick={() => setAccountType("parent")}>
                      <Heart className="w-6 h-6 text-duolingo-blue" />
                      <div className="text-left">
                        <Label htmlFor="parent" className="text-base font-medium cursor-pointer">Pour mon enfant</Label>
                        <p className="text-sm text-muted-foreground">Créer un compte pour mon enfant</p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-duolingo-blue rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Informations personnelles</h2>
                  <p className="text-muted-foreground">Parlez-nous de vous</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-base font-medium">
                      Prénom {accountType === "parent" ? "de l'enfant" : ""} *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={`Entrez ${accountType === "parent" ? "le prénom de l'enfant" : "votre prénom"}`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2 h-12 text-base"
                    />
                  </div>

                  {accountType === "student" && (
                    <>
                      <div>
                        <Label htmlFor="age" className="text-base font-medium">Âge *</Label>
                        <Input
                          id="age"
                          type="number"
                          placeholder="Votre âge"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          min="1"
                          max="120"
                          className="mt-2 h-12 text-base"
                        />
                      </div>

                      <div>
                        <Label className="text-base font-medium">Niveau scolaire *</Label>
                        <Select value={schoolLevel} onValueChange={setSchoolLevel}>
                          <SelectTrigger className="mt-2 h-12 text-base">
                            <SelectValue placeholder="Sélectionnez votre niveau" />
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
                    </>
                  )}

                  <div>
                    <Label className="text-base font-medium">Choisissez votre avatar</Label>
                    <div className="mt-2">
                      <AvatarSelector value={avatar} onChange={setAvatar} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && accountType === "student" && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-duolingo-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Où étudiez-vous ?</h2>
                  <p className="text-muted-foreground">Aidez-nous à personnaliser votre expérience</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Pays *</Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger className="mt-2 h-12 text-base">
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

                  <div>
                    <Label className="text-base font-medium">Préparez-vous un examen ? *</Label>
                    <RadioGroup value={examPreparation} onValueChange={setExamPreparation} className="mt-3 space-y-3">
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-duolingo-yellow-light transition-all cursor-pointer">
                        <RadioGroupItem value="none" id="none" />
                        <Label htmlFor="none" className="cursor-pointer flex-1">Non</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-duolingo-yellow-light transition-all cursor-pointer">
                        <RadioGroupItem value="brevet" id="brevet" />
                        <Label htmlFor="brevet" className="cursor-pointer flex-1">Brevet</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-duolingo-yellow-light transition-all cursor-pointer">
                        <RadioGroupItem value="bac" id="bac" />
                        <Label htmlFor="bac" className="cursor-pointer flex-1">Baccalauréat</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {((step === 3 && accountType === "parent") || (step === 4 && accountType === "student")) && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-duolingo-purple rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Créez votre compte</h2>
                  <p className="text-muted-foreground">Presque terminé !</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-base font-medium">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre.email@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2 h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-base font-medium">Mot de passe *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Créez un mot de passe sécurisé"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      className="mt-2 h-12 text-base"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Au moins 6 caractères</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex items-center space-x-2 h-12 px-6"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Précédent</span>
              </Button>
            ) : (
              <div />
            )}

            {step === maxSteps ? (
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !validateStep(step)}
                className={`bg-${currentColor} hover:bg-${currentColor}/90 text-white h-12 px-8 font-medium`}
              >
                {isLoading ? "Création..." : "Créer mon compte 🚀"}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!validateStep(step)}
                className={`bg-${currentColor} hover:bg-${currentColor}/90 text-white h-12 px-6 flex items-center space-x-2`}
              >
                <span>Continuer</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}