import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { KnowledgeCard, KnowledgeItem } from "@/components/KnowledgeCard";
import { ApiKeySetup } from "@/components/ApiKeySetup";
import { DocumentationCard } from "@/components/DocumentationCard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain, MessageSquare, Lightbulb, ArrowLeft, RefreshCw, Info, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StudyCategory } from "@/components/CategorySelection";
import { getCategoryGradientClasses } from "@/utils/categoryColors";
import { PerplexityService } from "@/utils/PerplexityService";
import GeminiService from "@/utils/GeminiService";
import { AvatarType } from "@/components/AvatarSelector";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PipecatClient } from '@pipecat-ai/client-js';
import { PipecatClientProvider } from '@pipecat-ai/client-react';
import { DailyTransport } from '@pipecat-ai/daily-transport';
import VoiceChat from '@/components/VoiceChat';

const StudySession = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const categoryData = location.state;
  const periods = location.state?.periods as string[];

  // Redirect if no category/periods selected
  if (!categoryData?.categoryId || !periods || periods.length === 0) {
    navigate('/');
    return null;
  }

  // Find the category from our data to get the icon
  const studyCategories: StudyCategory[] = [
    {
      id: "history",
      name: "Histoire",
      description: "Événements mondiaux, civilisations et chronologies",
      icon: <Brain className="w-8 h-8" />,
      color: getCategoryGradientClasses("history"),
      periods: []
    },
    {
      id: "geography",
      name: "Géographie", 
      description: "Pays, capitales, caractéristiques physiques",
      icon: <Brain className="w-8 h-8" />,
      color: getCategoryGradientClasses("geography"),
      periods: []
    },
    {
      id: "mathematics",
      name: "Mathématiques",
      description: "Algèbre, géométrie, calcul, et plus",
      icon: <Brain className="w-8 h-8" />,
      color: getCategoryGradientClasses("mathematics"),
      periods: []
    },
    {
      id: "science",
      name: "Sciences",
      description: "Concepts de physique, chimie, biologie",
      icon: <Brain className="w-8 h-8" />,
      color: getCategoryGradientClasses("science"),
      periods: []
    },
    {
      id: "literature",
      name: "Littérature",
      description: "Œuvres classiques, auteurs et périodes littéraires",
      icon: <Brain className="w-8 h-8" />,
      color: getCategoryGradientClasses("literature"),
      periods: []
    },
    {
      id: "languages",
      name: "Langues",
      description: "Grammaire, vocabulaire et compétences linguistiques",
      icon: <Brain className="w-8 h-8" />,
      color: getCategoryGradientClasses("languages"),
      periods: []
    }
  ];

  const category = studyCategories.find(cat => cat.id === categoryData.categoryId) || {
    id: categoryData.categoryId,
    name: categoryData.categoryName,
    description: "",
    icon: <Brain className="w-8 h-8" />,
    color: categoryData.categoryColor
  };
  
  const { user } = useAuth();
  
  // Récupérer l'avatar de l'utilisateur pour l'utiliser comme avatar de l'IA
  useEffect(() => {
    if (user) {
      console.log("Attempting to fetch avatar in StudySession for user:", user.id);
      const fetchUserAvatar = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('avatar')
            .eq('user_id', user.id)
            .maybeSingle();
          
          console.log("Study AI avatar fetch:", { data, error, userId: user.id });
          
          if (data && !error && data.avatar) {
            setAiAvatar(data.avatar as AvatarType);
            console.log("AI avatar set to:", data.avatar);
          } else if (error) {
            console.error("Error fetching avatar:", error);
          } else {
            console.log("No avatar found or profile not yet created");
          }
        } catch (err) {
          console.error("Exception during avatar fetch:", err);
        }
      };
      
      fetchUserAvatar();
    } else {
      console.log("No user logged in, using default avatar");
    }
  }, [user]);
  
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge'>('chat');
  const [hasApiKey, setHasApiKey] = useState(!!PerplexityService.getApiKey());
  const [topicDocumentation, setTopicDocumentation] = useState<Record<string, string>>({});
  const [loadingTopics, setLoadingTopics] = useState<Set<string>>(new Set());
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai'>('gemini'); // Provider pour le chat vocal
  const [showTipsDialog, setShowTipsDialog] = useState(() => {
    // Vérifier si l'utilisateur a choisi de ne plus voir les conseils
    const hideStudyTips = localStorage.getItem('hideStudyTips');
    return hideStudyTips !== 'true';
  }); // Popup de conseils au début
  const [aiAvatar, setAiAvatar] = useState<AvatarType>("avatar1"); // Avatar pour l'IA
  const [pipecatClient, setPipecatClient] = useState<PipecatClient | null>(null);
  const { toast } = useToast();

  // Initialiser Pipecat Client
  const initializePipecatClient = useCallback(() => {
    const transport = new DailyTransport();
    
    const client = new PipecatClient({
      transport,
      enableMic: true,
      enableCam: false,
    });

    setPipecatClient(client);
    return client;
  }, []);

  // Initialiser le client Pipecat au chargement
  useEffect(() => {
    initializePipecatClient();
  }, []);

  const handleProviderChange = useCallback((provider: 'gemini' | 'openai') => {
    setAiProvider(provider);
  }, []);

  const handleKnowledgeConfirm = (knowledgeId: string) => {
    setKnowledgeItems(prev => prev.map(item => 
      item.id === knowledgeId ? { ...item, status: 'confirmed' as const } : item
    ));
    toast({
      title: "Knowledge confirmed",
      description: "This information has been added to the confirmed knowledge base.",
    });
  };

  const handleKnowledgeReject = (knowledgeId: string) => {
    setKnowledgeItems(prev => prev.map(item => 
      item.id === knowledgeId ? { ...item, status: 'rejected' as const } : item
    ));
    toast({
      title: "Knowledge rejected",
      description: "This information has been marked as incorrect.",
    });
  };

  const fetchTopicDocumentation = async (topic: string) => {
    setLoadingTopics(prev => new Set(prev).add(topic));
    
    try {
      // Utiliser Gemini pour la documentation
      const result = await GeminiService.getTopicExplanation(topic, category.name);
      
      if (result.success && result.content) {
        setTopicDocumentation(prev => ({
          ...prev,
          [topic]: result.content!
        }));
        toast({
          title: "Documentation récupérée",
          description: `Informations sur ${topic} obtenues via Gemini`,
        });
      } else if (hasApiKey) {
        // Fallback vers Perplexity si disponible
        const result = await PerplexityService.getTopicDocumentation(topic, category.name);
        
        if (result.success && result.content) {
          setTopicDocumentation(prev => ({
            ...prev,
            [topic]: result.content!
          }));
          toast({
            title: "Documentation récupérée",
            description: `Informations sur ${topic} récupérées`,
          });
        } else {
          throw new Error(result.error || "Échec de récupération de la documentation");
        }
      } else {
        throw new Error("Aucun service IA disponible");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Échec de récupération de la documentation",
        variant: "destructive",
      });
    } finally {
      setLoadingTopics(prev => {
        const newSet = new Set(prev);
        newSet.delete(topic);
        return newSet;
      });
    }
  };

  const fetchAllDocumentation = async () => {
    if (!hasApiKey || periods.length === 0) return;

    // Fetch documentation for all periods
    for (const period of periods) {
      if (!topicDocumentation[period]) {
        await fetchTopicDocumentation(period);
      }
    }
  };

  const handleApiKeySet = () => {
    setHasApiKey(true);
    toast({
      title: "API Key Set",
      description: "You can now fetch documentation for your study topics",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-surface text-foreground">
      {/* Popup de conseils d'étude */}
      <Dialog open={showTipsDialog} onOpenChange={setShowTipsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Info className="w-5 h-5 mr-2 text-ai-primary" />
              Conseils pour votre session d'étude
            </DialogTitle>
            <DialogDescription>
              Suivez ces conseils pour optimiser votre apprentissage avec l'IA
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h4 className="font-medium mb-3 text-ai-primary">Avant de commencer :</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-ai-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Révisez vos notes pour les périodes sélectionnées
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-ai-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Préparez-vous dans un environnement calme
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-ai-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Ayez vos matériels d'étude à portée de main
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-ai-primary">Pendant la session :</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-ai-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Parlez clairement de ce que vous savez
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-ai-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Demandez des clarifications si nécessaire
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-ai-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Corrigez l'IA quand l'information est incorrecte
                </li>
              </ul>
            </div>
           </div>
           <div className="flex items-center justify-between mt-6">
             <Button 
               variant="outline" 
               onClick={() => {
                 localStorage.setItem('hideStudyTips', 'true');
                 setShowTipsDialog(false);
               }}
               className="text-muted-foreground hover:text-foreground"
             >
               Ne plus me le rappeler
             </Button>
             <Button onClick={() => setShowTipsDialog(false)} className="bg-ai-primary hover:bg-ai-primary/90">
               Commencer la session
             </Button>
           </div>
        </DialogContent>
      </Dialog>

      {/* Header simplifié */}
      <div className="bg-ai-surface border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="hover:bg-ai-surface-elevated"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour
            </Button>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center text-white`}>
                {category.icon}
              </div>
              <div>
                <h1 className="font-semibold text-lg">{category.name}</h1>
                <p className="text-sm text-muted-foreground">{periods.length} sujet{periods.length > 1 ? 's' : ''} • Session d'étude</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setActiveTab(activeTab === 'chat' ? 'knowledge' : 'chat')}
            >
              {activeTab === 'chat' ? <Lightbulb className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Zone de chat principale */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-background to-muted/30" style={{ height: 'calc(100vh - 80px)' }}>
        {activeTab === 'chat' ? (
          pipecatClient ? (
            <PipecatClientProvider client={pipecatClient}>
              <VoiceChat 
                provider={aiProvider}
                category={category.name}
                periods={periods}
                onProviderChange={handleProviderChange}
              />
            </PipecatClientProvider>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Initialisation du chat vocal...</p>
              </div>
            </div>
          )
        ) : (
          /* Vue Documentation dans un panneau latéral */
          <div className="flex-1 p-4">
            <ScrollArea className="h-full">
              {!hasApiKey ? (
                <div className="flex items-center justify-center h-full">
                  <ApiKeySetup onApiKeySet={handleApiKeySet} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Documentation des sujets</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchAllDocumentation}
                      disabled={loadingTopics.size > 0}
                    >
                      <RefreshCw className={`w-4 h-4 mr-1 ${loadingTopics.size > 0 ? 'animate-spin' : ''}`} />
                      Tout récupérer
                    </Button>
                  </div>
                  
                  {periods.map((period) => (
                    <DocumentationCard
                      key={period}
                      topic={period}
                      category={category.name}
                      content={topicDocumentation[period]}
                      isLoading={loadingTopics.has(period)}
                      onFetchDocumentation={fetchTopicDocumentation}
                    />
                  ))}
                  
                  {/* Legacy knowledge items */}
                  {knowledgeItems.length > 0 && (
                    <>
                      <Separator className="my-6" />
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Éléments de connaissance du chat</h3>
                        {knowledgeItems.map((knowledge) => (
                          <KnowledgeCard
                            key={knowledge.id}
                            knowledge={knowledge}
                            onConfirm={handleKnowledgeConfirm}
                            onReject={handleKnowledgeReject}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudySession;