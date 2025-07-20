import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { ChatMessage, Message } from "@/components/ChatMessage";
import { KnowledgeCard, KnowledgeItem } from "@/components/KnowledgeCard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Brain, MessageSquare, Lightbulb, ArrowLeft, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StudyCategory } from "@/components/CategorySelection";

const StudySession = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const category = location.state?.category as StudyCategory;
  const periods = location.state?.periods as string[];

  // Redirect if no category/periods selected
  if (!category || !periods || periods.length === 0) {
    navigate('/');
    return null;
  }
  const [messages, setMessages] = useState<Message[]>([]);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Mock AI responses for demo
  const mockAIResponses = [
    "I understand you'd like to know about that topic. Let me share what I know.",
    "Based on the information available, here's what I can tell you about that subject.",
    "That's an interesting question. Let me provide you with some insights.",
    "I'd be happy to help you understand this better. Here's what I've learned.",
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
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const response = mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
    const needsConfirmation = Math.random() > 0.5; // 50% chance of needing confirmation
    
    const aiMessage: Message = {
      id: Date.now().toString(),
      content: response,
      type: 'ai',
      timestamp: new Date(),
      needsConfirmation,
      confirmed: false
    };

    setMessages(prev => [...prev, aiMessage]);

    // Sometimes add a knowledge item
    if (Math.random() > 0.7) {
      const randomKnowledge = mockKnowledgeItems[Math.floor(Math.random() * mockKnowledgeItems.length)];
      const newKnowledge: KnowledgeItem = {
        ...randomKnowledge,
        id: Date.now().toString(),
        status: 'pending'
      };
      setKnowledgeItems(prev => [...prev, newKnowledge]);
    }
    
    setIsProcessing(false);
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

  return (
    <div className="min-h-screen bg-gradient-surface text-foreground">
      {/* Header */}
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
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center text-white`}>
                {category.icon}
              </div>
              <div>
                <h1 className="font-semibold text-lg">{category.name} Study Session</h1>
                <p className="text-sm text-muted-foreground">{periods.length} topic{periods.length > 1 ? 's' : ''} selected</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="surface" size="sm" onClick={clearChat}>
              Clear
            </Button>
          </div>
        </div>
        
        {/* Study Topics Bar */}
        <div className="mt-3 flex items-center space-x-2">
          <Target className="w-4 h-4 text-ai-accent" />
          <div className="flex flex-wrap gap-2">
            {periods.slice(0, 3).map((period, index) => (
              <span 
                key={index}
                className="text-xs bg-ai-primary/10 text-ai-primary px-2 py-1 rounded border border-ai-primary/20"
              >
                {period}
              </span>
            ))}
            {periods.length > 3 && (
              <span className="text-xs text-muted-foreground px-2 py-1">
                +{periods.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-ai-surface border-b border-border/50">
        <div className="flex">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'chat' 
                ? 'text-ai-primary border-b-2 border-ai-primary bg-ai-primary/5' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Conversation</span>
            {messages.length > 0 && (
              <span className="bg-ai-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {messages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'knowledge' 
                ? 'text-ai-primary border-b-2 border-ai-primary bg-ai-primary/5' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Knowledge</span>
            {knowledgeItems.length > 0 && (
              <span className="bg-ai-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {knowledgeItems.filter(k => k.status === 'pending').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto">
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium">Start a conversation</h3>
                      <p className="text-sm text-muted-foreground">Tap the microphone to begin speaking</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
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
            </ScrollArea>

            <Separator />

            {/* Voice Recorder */}
            <div className="p-6 bg-ai-surface">
              <VoiceRecorder 
                onRecordingComplete={handleRecordingComplete}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 p-4">
            {knowledgeItems.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto">
                    <Lightbulb className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">No knowledge items yet</h3>
                    <p className="text-sm text-muted-foreground">Start a conversation to generate knowledge items</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {knowledgeItems.map((knowledge) => (
                  <KnowledgeCard
                    key={knowledge.id}
                    knowledge={knowledge}
                    onConfirm={handleKnowledgeConfirm}
                    onReject={handleKnowledgeReject}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default StudySession;
