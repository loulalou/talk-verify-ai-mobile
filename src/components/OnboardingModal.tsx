import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, BookOpen, MessageCircle, Sparkles } from "lucide-react";
import { AvatarSelector, AvatarType } from "@/components/AvatarSelector";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userId: string;
}

export function OnboardingModal({ isOpen, onClose, userName, userId }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarType>("fun1");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const maxSteps = 3;

  const nextStep = () => {
    if (step < maxSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      // Mettre à jour le profil avec l'avatar sélectionné
      const { error } = await supabase
        .from('profiles')
        .update({ avatar: selectedAvatar })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Profil configuré !",
        description: "Votre avatar a été sauvegardé avec succès."
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la sauvegarde de votre profil",
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
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Bienvenue {userName} !</h2>
              <p className="text-muted-foreground text-lg">
                Découvrons ensemble comment utiliser Hypatie pour booster votre apprentissage.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-4">Comment ça marche ?</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-1">1</div>
                <div>
                  <h3 className="font-semibold">Choisissez votre matière</h3>
                  <p className="text-sm text-muted-foreground">Sélectionnez la matière que vous souhaitez étudier depuis le menu principal.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-1">2</div>
                <div>
                  <h3 className="font-semibold">Chattez avec Hypatie</h3>
                  <p className="text-sm text-muted-foreground">Posez vos questions et recevez des explications personnalisées et adaptées à votre niveau.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-1">3</div>
                <div>
                  <h3 className="font-semibold">Progressez à votre rythme</h3>
                  <p className="text-sm text-muted-foreground">Suivez vos progrès et accédez à des ressources complémentaires pour approfondir.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">Choisissez votre avatar</h2>
              <p className="text-muted-foreground">
                Sélectionnez l'avatar qui vous représente le mieux !
              </p>
            </div>
            
            <AvatarSelector 
              value={selectedAvatar} 
              onChange={setSelectedAvatar} 
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Configuration du profil</CardTitle>
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
                  className="flex items-center gap-2"
                >
                  Continuer
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? "Sauvegarde..." : "Terminer 🎉"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}