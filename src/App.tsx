import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { Material3Provider } from "@/components/providers/Material3Provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, IconButton, TextField, InputAdornment, Typography, Box, AppBar, Toolbar, Menu, MenuItem, Avatar as MuiAvatar, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { User, LogOut, Search, X, Menu as MenuIcon } from "lucide-react";
import { HelpPopup } from "./components/HelpPopup";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateBlockiesAvatar } from "./components/AvatarSelector";
import Index from "./pages/Index";
import StudySession from "./pages/StudySession";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
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
  return <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 'bold' }}>
      Bonjour {userProfile.name}
    </Typography>;
}

function HeaderSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <Box sx={{ maxWidth: '400px', width: '100%' }}>
      <TextField
        placeholder="Rechercher des conversations..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        size="small"
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={20} />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => setSearchQuery("")}
                edge="end"
              >
                <X size={16} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}

function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<{ avatar: string } | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar')
          .eq('user_id', user.id)
          .single();
        if (data && !error) {
          setUserProfile(data);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const getAvatarUrl = (avatarType: string) => {
    const seeds: Record<string, string> = {
      "avatar1": "student1",
      "avatar2": "student2", 
      "avatar3": "student3",
      "avatar4": "emma",
      "avatar5": "lucas",
      "avatar6": "marie",
    };
    
    return generateBlockiesAvatar(seeds[avatarType] || seeds["avatar1"]);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick} size="small">
        <MuiAvatar sx={{ width: 32, height: 32 }}>
          {userProfile?.avatar ? (
            <img 
              src={getAvatarUrl(userProfile.avatar)} 
              alt="Avatar utilisateur" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                imageRendering: 'pixelated' 
              }}
            />
          ) : (
            user?.email?.[0]?.toUpperCase() || 'U'
          )}
        </MuiAvatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
          <ListItemIcon>
            <User size={20} />
          </ListItemIcon>
          <ListItemText>Profil</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { signOut(); handleClose(); }}>
          <ListItemIcon>
            <LogOut size={20} />
          </ListItemIcon>
          <ListItemText>Se déconnecter</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
const queryClient = new QueryClient();
const App = () => <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Material3Provider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/*" element={<ProtectedRoute>
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                      <AppBar position="static" color="default" elevation={1} sx={{ 
                        borderBottom: 1, 
                        borderColor: 'divider',
                        backgroundColor: 'background.paper'
                      }}>
                        <Toolbar sx={{ minHeight: '48px !important', px: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <SidebarTrigger className="text-foreground hover:bg-accent" />
                            <WelcomeMessage />
                          </Box>
                          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', px: 4 }}>
                            <HeaderSearch />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HelpPopup />
                            <UserMenu />
                          </Box>
                        </Toolbar>
                      </AppBar>
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
      </Material3Provider>
    </ThemeProvider>
  </QueryClientProvider>;
export default App;