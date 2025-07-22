import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  Search, 
  MessageSquare, 
  User, 
  Plus, 
  History,
  Settings,
  Brain,
  X,
  MoreVertical
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Conversation {
  id: string;
  title: string;
  category: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock conversations data
  const [conversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Ancient History Discussion",
      category: "History",
      lastMessage: "Tell me about the Roman Empire",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      messageCount: 15
    },
    {
      id: "2", 
      title: "Geography Quiz Session",
      category: "Geography",
      lastMessage: "What are the capitals of European countries?",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      messageCount: 8
    },
    {
      id: "3",
      title: "Math Problem Solving",
      category: "Mathematics", 
      lastMessage: "Help me solve this calculus problem",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      messageCount: 22
    },
    {
      id: "4",
      title: "Science Fundamentals",
      category: "Science",
      lastMessage: "Explain photosynthesis process",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      messageCount: 12
    }
  ]);

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      case 'history': return <History className="w-3 h-3" />;
      case 'geography': return <Brain className="w-3 h-3" />;
      case 'mathematics': return <Brain className="w-3 h-3" />;
      case 'science': return <Brain className="w-3 h-3" />;
      default: return <MessageSquare className="w-3 h-3" />;
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

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-80"} border-r border-border/50 bg-sidebar`}>
      <SidebarHeader className="p-4 border-b border-border/50">
        {!collapsed && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Study AI</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewConversation}
                className="text-primary hover:bg-primary/10"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border/50 focus:border-primary"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-background"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </>
        )}
        
        {collapsed && (
          <div className="flex flex-col items-center space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewConversation}
              className="w-8 h-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-xs text-muted-foreground px-4 py-2">
              Recent Conversations ({filteredConversations.length})
            </SidebarGroupLabel>
          )}
          
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <SidebarMenu>
                {filteredConversations.map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton 
                      onClick={() => handleConversationClick(conversation)}
                      className={`w-full h-auto p-3 hover:bg-accent/50 ${collapsed ? 'justify-center' : 'justify-start'}`}
                    >
                      {collapsed ? (
                        <div className="flex flex-col items-center">
                          {getCategoryIcon(conversation.category)}
                          <span className="text-xs mt-1 truncate w-8 text-center">
                            {conversation.messageCount}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-start space-x-3 w-full">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                            {getCategoryIcon(conversation.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-foreground truncate">
                                {conversation.title}
                              </h4>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                  >
                                    <MoreVertical className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    Edit title
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    Share conversation
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive">
                                    Delete
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
                                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                  {conversation.category}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {conversation.messageCount}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
              
              {filteredConversations.length === 0 && !collapsed && (
                <div className="text-center py-8 px-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "No conversations found" : "No conversations yet"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {searchQuery ? "Try a different search term" : "Start a new conversation to begin"}
                  </p>
                </div>
              )}
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        {collapsed ? (
          <div className="flex flex-col items-center space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="w-8 h-8 p-0"
            >
              <User className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 hover:bg-accent/50"
                >
                  <div className="flex items-center space-x-3 w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">John Doe</p>
                      <p className="text-xs text-muted-foreground">john.doe@example.com</p>
                    </div>
                    <Settings className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}