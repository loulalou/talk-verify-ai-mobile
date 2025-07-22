import { useState, useEffect } from "react";
import { ArrowLeft, User, Mail, Calendar, BookOpen, Award, Settings, Bell, MapPin, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  name: string;
  age?: number;
  country?: string;
  school_level?: string;
  account_type?: string;
  exam_preparation?: string;
  avatar: string;
  created_at?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          toast({
            title: "Erreur",
            description: "Impossible de charger les données du profil",
            variant: "destructive"
          });
          return;
        }

        if (data) {
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Erreur",
          description: "Une erreur inattendue s'est produite",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, toast]);

  // Mock stats data - in future these could come from conversation/activity tables
  const mockStats = {
    totalConversations: 47,
    totalMessages: 1284,
    studyHours: 127,
    completedTopics: 23
  };

  const mockRecentActivity = [
    { category: "History", topic: "Ancient Rome", time: "2 hours ago", progress: 85 },
    { category: "Science", topic: "Photosynthesis", time: "1 day ago", progress: 92 },
    { category: "Mathematics", topic: "Calculus", time: "3 days ago", progress: 76 },
  ];

  const mockAchievements = [
    { name: "First Steps", description: "Complete your first study session", earned: true },
    { name: "Conversationalist", description: "Send 100 messages", earned: true },
    { name: "Knowledge Seeker", description: "Study 10 different topics", earned: true },
    { name: "Dedicated Learner", description: "Study for 50 hours", earned: false },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!userProfile || !user) {
    return (
      <div className="min-h-screen bg-gradient-surface text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Profil non trouvé</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  // Format join date
  const joinDate = userProfile.created_at 
    ? new Date(userProfile.created_at).toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long' 
      })
    : "Date inconnue";

  return (
    <div className="min-h-screen bg-gradient-surface text-foreground">
      {/* Header */}
      <div className="bg-ai-surface border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="hover:bg-ai-surface-elevated"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour
            </Button>
            <h1 className="text-xl font-semibold">Profil</h1>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-1" />
            Modifier le profil
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <Card className="bg-ai-surface border-border/50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" alt={userProfile.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground">{userProfile.name}</h2>
                <p className="text-muted-foreground flex items-center mt-1">
                  <Mail className="w-4 h-4 mr-1" />
                  {user.email}
                </p>
                <p className="text-muted-foreground flex items-center mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  Membre depuis {joinDate}
                </p>
                {userProfile.age && (
                  <p className="text-muted-foreground flex items-center mt-1">
                    <User className="w-4 h-4 mr-1" />
                    {userProfile.age} ans
                  </p>
                )}
                {userProfile.country && (
                  <p className="text-muted-foreground flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {userProfile.country}
                  </p>
                )}
                {userProfile.school_level && (
                  <p className="text-muted-foreground flex items-center mt-1">
                    <GraduationCap className="w-4 h-4 mr-1" />
                    {userProfile.school_level}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-4 bg-gradient-primary/5 rounded-lg border border-primary/20">
                <div className="text-2xl font-bold text-primary">{mockStats.totalConversations}</div>
                <div className="text-sm text-muted-foreground">Conversations</div>
              </div>
              <div className="text-center p-4 bg-gradient-accent/5 rounded-lg border border-accent/20">
                <div className="text-2xl font-bold text-accent">{mockStats.totalMessages}</div>
                <div className="text-sm text-muted-foreground">Messages</div>
              </div>
              <div className="text-center p-4 bg-gradient-surface/50 rounded-lg border border-border/50">
                <div className="text-2xl font-bold text-foreground">{mockStats.studyHours}</div>
                <div className="text-sm text-muted-foreground">Heures d'étude</div>
              </div>
              <div className="text-center p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                <div className="text-2xl font-bold text-green-600">{mockStats.completedTopics}</div>
                <div className="text-sm text-muted-foreground">Sujets appris</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-ai-surface">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="achievements">Succès</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Recent Activity */}
              <Card className="bg-ai-surface border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Activité récente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockRecentActivity.map((activity, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{activity.topic}</p>
                          <p className="text-xs text-muted-foreground">{activity.category} • {activity.time}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {activity.progress}%
                        </Badge>
                      </div>
                      <Progress value={activity.progress} className="h-2" />
                      {index < mockRecentActivity.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Learning Progress */}
              <Card className="bg-ai-surface border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Progression d'apprentissage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Histoire</span>
                      <span>12/15 sujets</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sciences</span>
                      <span>8/12 sujets</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Mathématiques</span>
                      <span>5/10 sujets</span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Géographie</span>
                      <span>3/8 sujets</span>
                    </div>
                    <Progress value={38} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card className="bg-ai-surface border-border/50">
              <CardHeader>
                <CardTitle>Succès</CardTitle>
                <CardDescription>
                  Suivez vos étapes d'apprentissage et débloquez de nouveaux badges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {mockAchievements.map((achievement, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border ${
                        achievement.earned 
                          ? 'bg-primary/5 border-primary/20' 
                          : 'bg-muted/20 border-border/50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          achievement.earned 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            achievement.earned ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {achievement.name}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {achievement.description}
                          </p>
                          {achievement.earned && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              Obtenu
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-ai-surface border-border/50">
              <CardHeader>
                <CardTitle>Préférences</CardTitle>
                <CardDescription>
                  Personnalisez votre expérience d'apprentissage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Recevez des mises à jour sur vos progrès d'apprentissage
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Bell className="w-4 h-4 mr-1" />
                    Configurer
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Sauvegarde automatique des conversations</div>
                    <div className="text-sm text-muted-foreground">
                      Sauvegardez automatiquement vos sessions d'étude
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Activé
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Saisie vocale</div>
                    <div className="text-sm text-muted-foreground">
                      Utilisez l'enregistrement vocal pour les conversations
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Activé
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;