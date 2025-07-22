import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Search, MessageSquare, User, Plus, History, Settings, Brain, X, MoreVertical, LogOut, GraduationCap } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter, useSidebar } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
interface Conversation {
  id: string;
  title: string;
  category: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}
export function AppSidebar() {
  const {
    state
  } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    user,
    signOut
  } = useAuth();
  const [userProfile, setUserProfile] = useState<{
    name: string;
    age?: number;
  } | null>(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const {
          data,
          error
        } = await supabase.from('profiles').select('name, age').eq('user_id', user.id).single();
        if (data && !error) {
          setUserProfile(data);
        }
      }
    };
    fetchProfile();
  }, [user]);

  // Mock conversations data
  const [conversations] = useState<Conversation[]>([{
    id: "1",
    title: "Ancient History Discussion",
    category: "History",
    lastMessage: "Tell me about the Roman Empire",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    // 2 hours ago
    messageCount: 15
  }, {
    id: "2",
    title: "Geography Quiz Session",
    category: "Geography",
    lastMessage: "What are the capitals of European countries?",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    // 5 hours ago
    messageCount: 8
  }, {
    id: "3",
    title: "Math Problem Solving",
    category: "Mathematics",
    lastMessage: "Help me solve this calculus problem",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    // 1 day ago
    messageCount: 22
  }, {
    id: "4",
    title: "Science Fundamentals",
    category: "Science",
    lastMessage: "Explain photosynthesis process",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    // 2 days ago
    messageCount: 12
  }]);
  const filteredConversations = conversations.filter(conv => conv.title.toLowerCase().includes(searchQuery.toLowerCase()) || conv.category.toLowerCase().includes(searchQuery.toLowerCase()) || conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = diff / (1000 * 60 * 60);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${Math.floor(hours)}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'history':
        return <History className="w-3 h-3" />;
      case 'geography':
        return <Brain className="w-3 h-3" />;
      case 'mathematics':
        return <Brain className="w-3 h-3" />;
      case 'science':
        return <Brain className="w-3 h-3" />;
      default:
        return <MessageSquare className="w-3 h-3" />;
    }
  };
  const handleNewConversation = () => {
    navigate('/');
  };
  const handleConversationClick = (conversation: Conversation) => {
    // Navigate to study session with the conversation context
    navigate('/study', {
      state: {
        categoryId: conversation.category.toLowerCase(),
        categoryName: conversation.category,
        periods: ["Sample Period"],
        conversationId: conversation.id
      }
    });
  };
  return <Sidebar className="border-r border-border bg-background" collapsible="icon">
      <SidebarHeader className="p-4 border-b border-border bg-card">
        {!collapsed && <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-6 h-6 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Hypatie</h2>
              </div>
            </div>
            
            {userProfile?.name && <div className="mb-3">
                
              </div>}
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher des conversations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-input border-border focus:border-primary text-foreground placeholder:text-muted-foreground" />
              {searchQuery && <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-accent text-muted-foreground hover:text-accent-foreground">
                  <X className="w-3 h-3" />
                </Button>}
            </div>
          </>}
        
        {collapsed && <div className="flex flex-col items-center space-y-2">
            <Button variant="ghost" size="sm" onClick={handleNewConversation} className="w-8 h-8 p-0 text-foreground hover:bg-accent">
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-foreground hover:bg-accent">
              <Search className="w-4 h-4" />
            </Button>
          </div>}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="bg-background">
          {!collapsed}
          
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <SidebarMenu>
                {filteredConversations.map(conversation => <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton onClick={() => handleConversationClick(conversation)} className={`w-full h-auto p-3 hover:bg-accent group ${collapsed ? 'justify-center' : 'justify-start'}`}>
                      {collapsed ? <div className="flex flex-col items-center">
                          {getCategoryIcon(conversation.category)}
                          <span className="text-xs mt-1 truncate w-8 text-center">
                            {conversation.messageCount}
                          </span>
                        </div> : <div className="flex items-start space-x-3 w-full">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-1 bg-amber-700">
                            {getCategoryIcon(conversation.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-foreground truncate">
                                {conversation.title}
                              </h4>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-accent-foreground hover:bg-accent">
                                  <MoreVertical className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-popover border-border">
                                  <DropdownMenuItem className="text-popover-foreground hover:bg-accent">
                                    Modifier le titre
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-popover-foreground hover:bg-accent">
                                    Partager la conversation
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive hover:bg-accent hover:text-destructive">
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {conversation.lastMessage}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(conversation.timestamp)}
                              </span>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs bg-secondary px-1.5 py-0.5 rounded border border-border/50 text-amber-50">
                                  {conversation.category}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {conversation.messageCount}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>)}
              </SidebarMenu>
              
              {filteredConversations.length === 0 && !collapsed && <div className="text-center py-8 px-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "Aucune conversation trouvée" : "Aucune conversation pour le moment"}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {searchQuery ? "Essayez un autre terme de recherche" : "Commencez une nouvelle conversation"}
                  </p>
                </div>}
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border bg-background">
        {collapsed ? <div className="flex flex-col items-center space-y-2">
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-foreground hover:bg-accent">
              <Settings className="w-4 h-4" />
            </Button>
          </div> : <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start h-auto p-3 hover:bg-accent">
              <div className="flex items-center space-x-3 w-full">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Paramètres</span>
              </div>
            </Button>
          </div>}
      </SidebarFooter>
    </Sidebar>;
}