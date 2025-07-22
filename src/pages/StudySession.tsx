import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { ChatMessage, Message } from "@/components/ChatMessage";
import { KnowledgeCard, KnowledgeItem } from "@/components/KnowledgeCard";
import { ApiKeySetup } from "@/components/ApiKeySetup";
import { DocumentationCard } from "@/components/DocumentationCard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Brain, MessageSquare, Lightbulb, ArrowLeft, Target, RefreshCw, Clock, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StudyCategory } from "@/components/CategorySelection";
import { PerplexityService } from "@/utils/PerplexityService";
import GeminiService from "@/utils/GeminiService";
import { AvatarType } from "@/components/AvatarSelector";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
      color: "bg-gradient-to-br from-amber-500 to-orange-600",
      periods: []
    },
    {
      id: "geography",
      name: "Géographie", 
      description: "Pays, capitales, caractéristiques physiques",
      icon: <Brain className="w-8 h-8" />,
      color: "bg-gradient-to-br from-emerald-500 to-teal-600",
      periods: []
    },
    {
      id: "mathematics",
      name: "Mathématiques",
      description: "Algèbre, géométrie, calcul, et plus",
      icon: <Brain className="w-8 h-8" />,
      color: "bg-gradient-to-br from-blue-500 to-indigo-600",
      periods: []
    },
    {
      id: "science",
      name: "Sciences",
      description: "Concepts de physique, chimie, biologie",
      icon: <Brain className="w-8 h-8" />,
      color: "bg-gradient-to-br from-purple-500 to-pink-600",
      periods: []
    },
    {
      id: "literature",
      name: "Littérature",
      description: "Œuvres classiques, auteurs et périodes littéraires",
      icon: <Brain className="w-8 h-8" />,
      color: "bg-gradient-to-br from-rose-500 to-red-600",
      periods: []
    },
    {
      id: "languages",
      name: "Langues",
      description: "Grammaire, vocabulaire et compétences linguistiques",
      icon: <Brain className="w-8 h-8" />,
      color: "bg-gradient-to-br from-cyan-500 to-blue-600",
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
      const fetchUserAvatar = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar')
          .eq('user_id', user.id)
          .single();
        
        if (data && !error && data.avatar) {
          setAiAvatar(data.avatar as AvatarType);
        }
      };
      
      fetchUserAvatar();
    }
  }, [user]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge'>('chat');
  const [hasApiKey, setHasApiKey] = useState(!!PerplexityService.getApiKey());
  const [topicDocumentation, setTopicDocumentation] = useState<Record<string, string>>({});
  const [loadingTopics, setLoadingTopics] = useState<Set<string>>(new Set());
  const [useGemini, setUseGemini] = useState(true); // Utiliser Gemini par défaut
  const [showTipsDialog, setShowTipsDialog] = useState(true); // Popup de conseils au début
  const [aiAvatar, setAiAvatar] = useState<AvatarType>("teacher"); // Avatar pour l'IA
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Mock AI responses for demo
  const mockAIResponses = [
    "Je comprends que vous aimeriez en savoir plus sur ce sujet. Laissez-moi partager ce que je sais.",
    "Basé sur les informations disponibles, voici ce que je peux vous dire sur ce sujet.",
    "C'est une question intéressante. Permettez-moi de vous donner quelques insights.",
    "Je serais ravi de vous aider à mieux comprendre. Voici ce que j'ai appris.",
  ];

  const mockKnowledgeItems = [
    {
      title: "Python Programming",
      content: "Python is a high-level programming language known for its simplicity and readability.",
      category: "Technology",
      confidence: 0.95
    },
    {
      title: "Climate Change",
      content: "Global average temperatures have risen by approximately 1.1°C since the late 19th century.",
      category: "Science",
      confidence: 0.88
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const simulateAIResponse = async (userMessage: string) => {
    setIsProcessing(true);
    
    try {
      if (useGemini) {
        // Utiliser Gemini
        const periodsContext = periods.join(', ');
        const result = await GeminiService.sendMessage(
          userMessage, 
          category.name, 
          `Session d'étude sur: ${periodsContext}`
        );
        
        if (result.success && result.response) {
          const aiMessage: Message = {
            id: Date.now().toString(),
            content: result.response,
            type: 'ai',
            timestamp: new Date(),
            needsConfirmation: Math.random() > 0.7, // 30% chance
            confirmed: false
          };
          setMessages(prev => [...prev, aiMessage]);
        } else {
          throw new Error(result.error || 'Erreur de communication avec Gemini');
        }
      } else {
        // Fallback aux réponses simulées
        await new Promise(resolve => setTimeout(resolve, 1500));
        const response = mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
        const needsConfirmation = Math.random() > 0.5;
        
        const aiMessage: Message = {
          id: Date.now().toString(),
          content: response,
          type: 'ai',
          timestamp: new Date(),
          needsConfirmation,
          confirmed: false
        };
        setMessages(prev => [...prev, aiMessage]);
      }

      // Parfois ajouter un élément de connaissance
      if (Math.random() > 0.8) {
        const randomKnowledge = mockKnowledgeItems[Math.floor(Math.random() * mockKnowledgeItems.length)];
        const newKnowledge: KnowledgeItem = {
          ...randomKnowledge,
          id: Date.now().toString(),
          status: 'pending'
        };
        setKnowledgeItems(prev => [...prev, newKnowledge]);
      }
    } catch (error) {
      console.error('Erreur lors de la communication avec l\'IA:', error);
      toast({
        title: "Erreur",
        description: "Impossible de communiquer avec l'IA. Utilisation du mode hors ligne.",
        variant: "destructive",
      });
      
      // Fallback en cas d'erreur
      const response = "Je rencontre des difficultés techniques. Pouvez-vous reformuler votre question ?";
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: response,
        type: 'ai',
        timestamp: new Date(),
        needsConfirmation: false,
        confirmed: false
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    // In a real app, you'd send this to a speech-to-text service
    const mockTranscription = "This is a sample transcription of the recorded audio.";
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: mockTranscription,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    toast({
      title: "Voice recorded",
      description: "Processing your message...",
    });

    await simulateAIResponse(mockTranscription);
  };

  const handleMessageConfirm = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, confirmed: true } : msg
    ));
    toast({
      title: "Information confirmed",
      description: "Thank you for confirming this information.",
    });
  };

  const handleMessageReject = (messageId: string) => {
    toast({
      title: "Feedback noted",
      description: "We'll improve our responses based on your feedback.",
    });
  };

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

  const clearChat = () => {
    setMessages([]);
    setKnowledgeItems([]);
    toast({
      title: "Chat cleared",
      description: "Starting fresh conversation.",
    });
  };

  const fetchTopicDocumentation = async (topic: string) => {
    setLoadingTopics(prev => new Set(prev).add(topic));
    
    try {
      if (useGemini) {
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
        } else {
          throw new Error(result.error || "Échec de récupération via Gemini");
        }
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
          <div className="flex justify-end mt-6">
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
              variant={useGemini ? "default" : "outline"} 
              size="sm" 
              onClick={() => setUseGemini(!useGemini)}
            >
              {useGemini ? "Gemini" : "Mode hors ligne"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setActiveTab(activeTab === 'chat' ? 'knowledge' : 'chat')}
            >
              {activeTab === 'chat' ? <Lightbulb className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            </Button>
            <Button variant="surface" size="sm" onClick={clearChat}>
              Effacer
            </Button>
          </div>
        </div>
      </div>

      {/* Zone de chat principale */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-background to-muted/30" style={{ height: 'calc(100vh - 80px)' }}>
        {activeTab === 'chat' ? (
          <>
            {/* Messages de chat */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                      <div className="text-center space-y-4 max-w-md">
                        <div className="w-16 h-16 bg-ai-primary rounded-full flex items-center justify-center mx-auto">
                          <MessageSquare className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg mb-2">Commencez votre session d'étude</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Utilisez le microphone ci-dessous pour poser vos questions ou expliquer ce que vous savez sur {category.name}
                          </p>
                          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                            <strong>Sujets sélectionnés :</strong> {periods.slice(0, 2).join(', ')}
                            {periods.length > 2 && ` et ${periods.length - 2} autre${periods.length > 3 ? 's' : ''}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pb-4">
                      {messages.map((message) => (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          onConfirm={handleMessageConfirm}
                          onReject={handleMessageReject}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Zone d'input style chat */}
            <div className="border-t border-border/50 bg-ai-surface p-4">
              <div className="max-w-4xl mx-auto">
                <VoiceRecorder 
                  onRecordingComplete={handleRecordingComplete}
                  isProcessing={isProcessing}
                />
                
                {/* Conseils rapides sous forme de badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded-full">
                    💡 Parlez clairement de vos connaissances
                  </span>
                  <span className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded-full">
                    ❓ Posez des questions pour approfondir
                  </span>
                  <span className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded-full">
                    ✅ Confirmez ou corrigez les réponses de l'IA
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Vue Documentation dans un panneau latéral */
          <div className="flex-1 p-4">
            <ScrollArea className="h-full">
              {!useGemini && !hasApiKey ? (
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
