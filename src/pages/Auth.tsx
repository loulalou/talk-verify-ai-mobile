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
import { DuolingoSignup } from "@/components/DuolingoSignup";
import { ChevronLeft, ChevronRight } from "lucide-react";
export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Form states
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showDuolingoSignup, setShowDuolingoSignup] = useState(false);

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

  const handleDuolingoSignupSuccess = () => {
    setShowDuolingoSignup(false);
    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
  };
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Invalid credentials",
            description: "Please check your email and password and try again.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }
      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in."
        });
        const from = location.state?.from?.pathname || "/";
        navigate(from, {
          replace: true
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  if (showDuolingoSignup) {
    return <DuolingoSignup onSuccess={handleDuolingoSignupSuccess} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Bienvenue sur Hypatie</CardTitle>
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
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Choisissez votre style d'inscription</p>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => setShowDuolingoSignup(true)}
                    className="w-full h-16 bg-gradient-to-r from-duolingo-green to-duolingo-blue text-white text-lg font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    🚀 Inscription Moderne
                    <span className="block text-sm font-normal opacity-90">Interface colorée et interactive</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full h-12 text-muted-foreground hover:bg-muted"
                    disabled
                  >
                    📝 Inscription Classique
                    <span className="block text-xs opacity-60">(Bientôt disponible)</span>
                  </Button>
                </div>
              </div>
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