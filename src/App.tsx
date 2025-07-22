import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, LogOut, Search, X } from "lucide-react";
import { HelpPopup } from "./components/HelpPopup";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import StudySession from "./pages/StudySession";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import { CategorySelection } from "./components/CategorySelection";
import { PeriodSelection } from "./components/PeriodSelection";
import NotFound from "./pages/NotFound";
function WelcomeMessage() {
  const {
    user
  } = useAuth();
  const [userProfile, setUserProfile] = useState<{
    name: string;
  } | null>(null);
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const {
          data,
          error
        } = await supabase.from('profiles').select('name').eq('user_id', user.id).single();
        if (data && !error) {
          setUserProfile(data);
        }
      }
    };
    fetchProfile();
  }, [user]);
  if (!userProfile?.name) return null;
  return <span className="text-muted-foreground text-xl font-bold">
      Bonjour {userProfile.name}
    </span>;
}

function HeaderSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="relative max-w-md w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input 
        placeholder="Rechercher des conversations..." 
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)} 
        className="pl-10 pr-10 bg-input border-border focus:border-primary text-foreground placeholder:text-muted-foreground"
      />
      {searchQuery && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setSearchQuery("")} 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-accent text-muted-foreground hover:text-accent-foreground"
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}

function UserMenu() {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  return <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="Utilisateur" />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>;
}
const queryClient = new QueryClient();
const App = () => <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={<ProtectedRoute>
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                      <header className="h-12 flex items-center justify-between border-b border-border bg-background px-4">
                        <div className="flex items-center space-x-4">
                          <SidebarTrigger className="text-foreground hover:bg-accent" />
                          <WelcomeMessage />
                        </div>
                        <div className="flex-1 flex justify-center max-w-2xl mx-8">
                          <HeaderSearch />
                        </div>
                        <div className="flex items-center space-x-2">
                          <HelpPopup />
                          <UserMenu />
                        </div>
                      </header>
                      <main className="flex-1">
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/periods/:categoryId" element={<PeriodSelection />} />
                          <Route path="/study" element={<StudySession />} />
                          <Route path="/profile" element={<Profile />} />
                          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              </ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>;
export default App;