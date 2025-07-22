import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Globe, Calculator, Atom, Palette, Music, Languages, ChevronRight, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
export interface StudyCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  periods?: string[];
}
const studyCategories: StudyCategory[] = [{
  id: "history",
  name: "Histoire",
  description: "Événements mondiaux, civilisations et chronologies",
  icon: <BookOpen className="w-8 h-8" />,
  color: "bg-gradient-to-br from-amber-500 to-orange-600",
  periods: ["Histoire ancienne (3000 av. J.-C. - 500 ap. J.-C.)", "Période médiévale (500 - 1500 ap. J.-C.)", "Renaissance (1400 - 1600 ap. J.-C.)", "Âge des explorations (1400 - 1700 ap. J.-C.)", "Révolution industrielle (1760 - 1840 ap. J.-C.)", "Histoire moderne (1800 - 1945 ap. J.-C.)", "Histoire contemporaine (1945 - Présent)"]
}, {
  id: "geography",
  name: "Géographie",
  description: "Pays, capitales, caractéristiques physiques",
  icon: <Globe className="w-8 h-8" />,
  color: "bg-gradient-to-br from-emerald-500 to-teal-600",
  periods: ["Géographie physique", "Géographie politique", "Europe", "Asie", "Afrique", "Amériques", "Océanie"]
}, {
  id: "mathematics",
  name: "Mathématiques",
  description: "Algèbre, géométrie, calcul, et plus",
  icon: <Calculator className="w-8 h-8" />,
  color: "bg-gradient-to-br from-blue-500 to-indigo-600",
  periods: ["Arithmétique de base", "Algèbre", "Géométrie", "Trigonométrie", "Calcul", "Statistiques", "Mathématiques avancées"]
}, {
  id: "science",
  name: "Sciences",
  description: "Concepts de physique, chimie, biologie",
  icon: <Atom className="w-8 h-8" />,
  color: "bg-gradient-to-br from-purple-500 to-pink-600",
  periods: ["Sciences générales", "Physique", "Chimie", "Biologie", "Sciences de la Terre", "Sciences environnementales", "Sciences avancées"]
}, {
  id: "literature",
  name: "Littérature",
  description: "Œuvres classiques, auteurs et périodes littéraires",
  icon: <Palette className="w-8 h-8" />,
  color: "bg-gradient-to-br from-rose-500 to-red-600",
  periods: ["Littérature classique", "Littérature médiévale", "Littérature de la Renaissance", "Période romantique", "Ère victorienne", "Littérature moderne", "Littérature contemporaine"]
}, {
  id: "languages",
  name: "Langues",
  description: "Grammaire, vocabulaire et compétences linguistiques",
  icon: <Languages className="w-8 h-8" />,
  color: "bg-gradient-to-br from-cyan-500 to-blue-600",
  periods: ["Grammaire de base", "Construction du vocabulaire", "Compréhension écrite", "Compétences rédactionnelles", "Pratique orale", "Grammaire avancée", "Analyse littéraire"]
}];
export function CategorySelection() {
  const [selectedCategory, setSelectedCategory] = useState<StudyCategory | null>(null);
  const navigate = useNavigate();
  const handleCategorySelect = (category: StudyCategory) => {
    setSelectedCategory(category);
  };
  const handleContinue = () => {
    if (selectedCategory) {
      navigate(`/periods/${selectedCategory.id}`, {
        state: {
          categoryId: selectedCategory.id,
          categoryName: selectedCategory.name,
          categoryDescription: selectedCategory.description,
          categoryColor: selectedCategory.color,
          categoryPeriods: selectedCategory.periods
        }
      });
    }
  };
  return <div className="bg-gradient-surface min-h-screen">
      {/* Header */}
      

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="font-semibold mb-2 text-center text-3xl">Que souhaitez-vous étudier aujourd'hui ?</h2>
          <p className="text-muted-foreground text-center">
            Sélectionnez une catégorie de matière pour commencer votre session de vérification de connaissances avec l'IA
          </p>
        </div>

        {/* Instructions */}
        <Card className="bg-ai-surface border-border/50 mb-8">
          <div className="p-4">
            <h4 className="font-medium mb-2 flex items-center">
              <GraduationCap className="w-4 h-4 mr-2 text-ai-accent" />
              Comment ça marche
            </h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Choisissez une catégorie de matière que vous voulez étudier</li>
              <li>Sélectionnez la période ou le sujet spécifique que vous apprenez</li>
              <li>Commencez à parler avec l'IA pour tester vos connaissances</li>
              <li>Confirmez ou corrigez les informations présentées par l'IA</li>
            </ol>
          </div>
        </Card>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {studyCategories.map(category => <Card key={category.id} className={`cursor-pointer transition-all duration-300 hover:scale-105 ${selectedCategory?.id === category.id ? 'ring-2 ring-ai-primary bg-ai-primary/5' : 'hover:shadow-lg'}`} onClick={() => handleCategorySelect(category)}>
              <div className="p-6">
                <div className={`w-16 h-16 ${category.color} rounded-xl flex items-center justify-center text-white mb-4 mx-auto`}>
                  {category.icon}
                </div>
                <h3 className="font-semibold text-lg text-center mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {category.description}
                </p>
                <div className="text-xs text-muted-foreground text-center">
                  {category.periods?.length} sujets disponibles
                </div>
              </div>
            </Card>)}
        </div>

        {/* Selected Category Preview */}
        {selectedCategory && <Card className="bg-ai-surface-elevated border-ai-primary/20 mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${selectedCategory.color} rounded-lg flex items-center justify-center text-white`}>
                    {selectedCategory.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedCategory.name}</h3>
                    <p className="text-sm text-muted-foreground">Catégorie sélectionnée</p>
                  </div>
                </div>
                <Button onClick={handleContinue} className="bg-ai-primary hover:bg-ai-primary/90">
                  Continuer
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Périodes d'étude disponibles :</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCategory.periods?.slice(0, 4).map((period, index) => <span key={index} className="text-xs bg-muted px-2 py-1 rounded-full">
                      {period}
                    </span>)}
                  {selectedCategory.periods && selectedCategory.periods.length > 4 && <span className="text-xs text-muted-foreground px-2 py-1">
                      +{selectedCategory.periods.length - 4} de plus
                    </span>}
                </div>
              </div>
            </div>
          </Card>}

      </div>
    </div>;
}