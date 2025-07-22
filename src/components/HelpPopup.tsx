import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lightbulb, BookOpen, MessageSquare, CheckCircle, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function HelpPopup() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
          <Lightbulb className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <span>Comment ça marche</span>
          </DialogTitle>
          <DialogDescription>
            Découvrez comment utiliser Hypatie pour optimiser vos sessions d'étude
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Étapes principales */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Étapes principales</h3>
            
            <div className="grid gap-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Choisir une matière</h4>
                      <p className="text-sm text-muted-foreground">
                        Sélectionnez la catégorie que vous souhaitez étudier : Histoire, Géographie, Mathématiques, Sciences, etc.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Sélectionner une période</h4>
                      <p className="text-sm text-muted-foreground">
                        Choisissez la période historique ou le sujet spécifique que vous voulez réviser.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Interagir avec l'IA</h4>
                      <p className="text-sm text-muted-foreground">
                        Utilisez le chat vocal ou écrit pour poser des questions et tester vos connaissances.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Valider les réponses</h4>
                      <p className="text-sm text-muted-foreground">
                        Confirmez ou corrigez les informations présentées par l'IA pour un apprentissage optimal.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Fonctionnalités */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Fonctionnalités clés</h3>
            
            <div className="grid gap-3">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <span className="font-medium">Chat vocal et écrit</span>
                  <p className="text-sm text-muted-foreground">Communiquez avec l'IA par la voix ou le texte</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <span className="font-medium">Documentation enrichie</span>
                  <p className="text-sm text-muted-foreground">Accédez à des fiches détaillées sur chaque sujet</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <div>
                  <span className="font-medium">Validation interactive</span>
                  <p className="text-sm text-muted-foreground">Confirmez ou corrigez les réponses de l'IA</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <span className="font-medium">Historique des conversations</span>
                  <p className="text-sm text-muted-foreground">Retrouvez et continuez vos sessions précédentes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Conseils */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Conseils pour bien commencer</h3>
            
            <Card className="bg-secondary/20 border-primary/20">
              <CardContent className="pt-6">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>Commencez par une matière que vous connaissez déjà pour vous familiariser</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>N'hésitez pas à corriger l'IA si elle fait des erreurs - c'est ainsi qu'elle apprend</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>Utilisez la fonction vocale pour un apprentissage plus naturel</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>Consultez la documentation pour approfondir vos connaissances</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => setOpen(false)}>
            Commencer à étudier
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}