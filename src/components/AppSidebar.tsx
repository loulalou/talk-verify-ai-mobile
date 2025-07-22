import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { MessageSquare, User, Plus, History, Settings, Brain, MoreVertical, LogOut, GraduationCap } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCategoryColor, getCategoryBadgeClasses, getCategoryIconClasses } from "@/utils/categoryColors";
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
    category: "history",
    lastMessage: "Tell me about the Roman Empire",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    // 2 hours ago
    messageCount: 15
  }, {
    id: "2",
    title: "Geography Quiz Session", 
    category: "geography",
    lastMessage: "What are the capitals of European countries?",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    // 5 hours ago
    messageCount: 8
  }, {
    id: "3",
    title: "Math Problem Solving",
    category: "mathematics",
    lastMessage: "Help me solve this calculus problem",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    // 1 day ago
    messageCount: 22
  }, {
    id: "4",
    title: "Science Fundamentals",
    category: "science",
    lastMessage: "Explain photosynthesis process",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    // 2 days ago
    messageCount: 12
  }, {
    id: "5",
    title: "French Literature Analysis",
    category: "literature",
    lastMessage: "Analyze Victor Hugo's writing style",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    // 3 days ago
    messageCount: 18
  }, {
    id: "6",
    title: "English Grammar Session",
    category: "languages",
    lastMessage: "Explain past perfect tense",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    // 4 days ago
    messageCount: 9
  }]);
  const filteredConversations = conversations; // No filtering since search is now in header
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
    const categoryColor = getCategoryColor(category);
    const iconStyle = { color: categoryColor?.primary || '#A6B0D2' };
    
    switch (category.toLowerCase()) {
      case 'history':
        return <History className="w-3 h-3" style={iconStyle} />;
      case 'geography':
        return <Brain className="w-3 h-3" style={iconStyle} />;
      case 'mathematics':
        return <Brain className="w-3 h-3" style={iconStyle} />;
      case 'science':
        return <Brain className="w-3 h-3" style={iconStyle} />;
      case 'literature':
        return <Brain className="w-3 h-3" style={iconStyle} />;
      case 'languages':
        return <Brain className="w-3 h-3" style={iconStyle} />;
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
            
          </>}
        
        {collapsed && <div className="flex flex-col items-center space-y-2">
            <Button variant="ghost" size="sm" onClick={handleNewConversation} className="w-8 h-8 p-0 text-foreground hover:bg-accent">
              <Plus className="w-4 h-4" />
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
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-1`} 
                               style={{ backgroundColor: getCategoryColor(conversation.category)?.light || '#E6EBEF' }}>
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
                                <span className={`text-xs px-1.5 py-0.5 rounded ${getCategoryBadgeClasses(conversation.category)}`}
                                      style={{ 
                                        backgroundColor: getCategoryColor(conversation.category)?.light || '#E6EBEF',
                                        color: getCategoryColor(conversation.category)?.dark || '#1E1F24',
                                        borderColor: getCategoryColor(conversation.category)?.primary || '#A6B0D2'
                                      }}>
                                  {getCategoryColor(conversation.category)?.name || conversation.category}
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
                    Aucune conversation pour le moment
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Commencez une nouvelle conversation
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