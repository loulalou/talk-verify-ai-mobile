import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AvatarSelector, AvatarType } from "@/components/AvatarSelector";
import { AccountTypeSelection } from "@/components/AccountTypeSelection";
import { SchoolLevelSelection } from "@/components/SchoolLevelSelection";
import { CountrySelection } from "@/components/CountrySelection";
import { ExamPreparationSelection } from "@/components/ExamPreparationSelection";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Form states
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [avatar, setAvatar] = useState<AvatarType>("teacher");
  
  // New signup flow states
  const [signupStep, setSignupStep] = useState(1);
  const [accountType, setAccountType] = useState("");
  const [schoolLevel, setSchoolLevel] = useState("");
  const [country, setCountry] = useState("");
  const [examPreparation, setExamPreparation] = useState("none");

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
    };
    checkAuth();
  }, [navigate, location]);

  const resetSignupForm = () => {
    setSignupStep(1);
    setName("");
    setAge("");
    setEmail("");
    setPassword("");
    setAccountType("");
    setSchoolLevel("");
    setCountry("");
    setExamPreparation("none");
    setAvatar("teacher");
  };

  const getMaxSteps = () => {
    return accountType === "student" ? 4 : 2;
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return Boolean(accountType);
      case 2:
        return Boolean(name && email && password);
      case 3:
        if (accountType === "student") {
          return Boolean(age && schoolLevel && country);
        }
        return true;
      case 4:
        return true; // Exam preparation is optional
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(signupStep)) {
      setSignupStep(signupStep + 1);
    } else {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    setSignupStep(signupStep - 1);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(signupStep)) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const signupData: any = {
        name,
        avatar,
        account_type: accountType,
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
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      if (data.user) {
        toast({
          title: "Succès !",
          description: "Compte créé avec succès. Vous pouvez maintenant vous connecter.",
        });
        resetSignupForm();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Échec de la création du compte",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Invalid credentials",
            description: "Please check your email and password and try again.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Bienvenue</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Se connecter</TabsTrigger>
              <TabsTrigger value="signup">S'inscrire</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Entrez votre email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Mot de passe</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Étape {signupStep} sur {getMaxSteps()}</span>
                  <div className="flex space-x-1">
                    {Array.from({ length: getMaxSteps() }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-8 rounded-full ${
                          i + 1 <= signupStep ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <form onSubmit={signupStep === getMaxSteps() ? handleSignUp : (e) => { e.preventDefault(); nextStep(); }} className="space-y-4">
                {signupStep === 1 && (
                  <AccountTypeSelection
                    value={accountType}
                    onChange={setAccountType}
                  />
                )}

                {signupStep === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nom {accountType === "parent" ? "de l'enfant" : ""} *</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder={`Entrez ${accountType === "parent" ? "le nom de l'enfant" : "votre nom"}`}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Avatar</Label>
                      <AvatarSelector value={avatar} onChange={setAvatar} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email *</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Entrez votre email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Mot de passe *</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Créez un mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </>
                )}

                {signupStep === 3 && accountType === "student" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="signup-age">Âge *</Label>
                      <Input
                        id="signup-age"
                        type="number"
                        placeholder="Entrez votre âge"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        min="1"
                        max="120"
                        required
                      />
                    </div>
                    <SchoolLevelSelection
                      value={schoolLevel}
                      onChange={setSchoolLevel}
                    />
                    <CountrySelection
                      value={country}
                      onChange={setCountry}
                    />
                  </>
                )}

                {signupStep === 4 && accountType === "student" && (
                  <ExamPreparationSelection
                    value={examPreparation}
                    onChange={setExamPreparation}
                  />
                )}

                <div className="flex space-x-2">
                  {signupStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Précédent
                    </Button>
                  )}
                  
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading || !validateStep(signupStep)}
                  >
                    {isLoading ? (
                      "Création..."
                    ) : signupStep === getMaxSteps() ? (
                      "Créer le compte"
                    ) : (
                      <>
                        Suivant
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          <Alert className="mt-4">
            <AlertDescription className="text-sm">
              À des fins de test, vous pouvez désactiver la confirmation par email dans vos paramètres Supabase pour accélérer le processus d'inscription.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}