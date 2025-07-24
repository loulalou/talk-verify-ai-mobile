import { useState, useEffect } from "react";
import { CategorySelection } from "@/components/CategorySelection";
import { OnboardingModal } from "@/components/OnboardingModal";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Vérifier si l'utilisateur vient de s'inscrire
    const shouldShowOnboarding = localStorage.getItem('showOnboarding');
    const newUserName = localStorage.getItem('newUserName');
    
    if (shouldShowOnboarding === 'true' && newUserName && user) {
      setUserName(newUserName);
      setShowOnboarding(true);
      
      // Nettoyer les indicateurs localStorage
      localStorage.removeItem('showOnboarding');
      localStorage.removeItem('newUserName');
    }
  }, [user]);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
  };

  return (
    <>
      <CategorySelection />
      
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
        userName={userName}
        userId={user?.id || ""}
      />
    </>
  );
};

export default Index;