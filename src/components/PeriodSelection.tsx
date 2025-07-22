import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Clock, 
  ChevronRight,
  CheckCircle,
  BookOpen, 
  Globe, 
  Calculator, 
  Atom, 
  Palette,
  Languages
} from "lucide-react";
import { StudyCategory } from "./CategorySelection";

export function PeriodSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const categoryData = location.state;
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);

  if (!categoryData?.categoryId) {
    navigate('/');
    return null;
  }

  // Find the category from our data to get the icon
  const studyCategories: StudyCategory[] = [
    {
      id: "history",
      name: "Histoire",
      description: "Événements mondiaux, civilisations et chronologies",
      icon: <BookOpen className="w-8 h-8" />,
      color: "bg-gradient-to-br from-amber-500 to-orange-600",
      periods: [
        "Histoire ancienne (3000 av. J.-C. - 500 ap. J.-C.)",
        "Période médiévale (500 - 1500 ap. J.-C.)", 
        "Renaissance (1400 - 1600 ap. J.-C.)",
        "Âge des explorations (1400 - 1700 ap. J.-C.)",
        "Révolution industrielle (1760 - 1840 ap. J.-C.)",
        "Histoire moderne (1800 - 1945 ap. J.-C.)",
        "Histoire contemporaine (1945 - Présent)"
      ]
    },
    {
      id: "geography",
      name: "Géographie", 
      description: "Pays, capitales, caractéristiques physiques",
      icon: <Globe className="w-8 h-8" />,
      color: "bg-gradient-to-br from-emerald-500 to-teal-600",
      periods: [
        "Géographie physique",
        "Géographie politique", 
        "Europe",
        "Asie",
        "Afrique", 
        "Amériques",
        "Océanie"
      ]
    },
    {
      id: "mathematics",
      name: "Mathématiques",
      description: "Algèbre, géométrie, calcul, et plus",
      icon: <Calculator className="w-8 h-8" />,
      color: "bg-gradient-to-br from-blue-500 to-indigo-600",
      periods: [
        "Arithmétique de base",
        "Algèbre",
        "Géométrie",
        "Trigonométrie",
        "Calcul",
        "Statistiques",
        "Mathématiques avancées"
      ]
    },
    {
      id: "science",
      name: "Sciences",
      description: "Concepts de physique, chimie, biologie",
      icon: <Atom className="w-8 h-8" />,
      color: "bg-gradient-to-br from-purple-500 to-pink-600",
      periods: [
        "Sciences générales",
        "Physique",
        "Chimie", 
        "Biologie",
        "Sciences de la Terre",
        "Sciences environnementales",
        "Sciences avancées"
      ]
    },
    {
      id: "literature",
      name: "Littérature",
      description: "Œuvres classiques, auteurs et périodes littéraires",
      icon: <Palette className="w-8 h-8" />,
      color: "bg-gradient-to-br from-rose-500 to-red-600",
      periods: [
        "Littérature classique",
        "Littérature médiévale",
        "Littérature de la Renaissance",
        "Période romantique",
        "Ère victorienne",
        "Littérature moderne",
        "Littérature contemporaine"
      ]
    },
    {
      id: "languages",
      name: "Langues",
      description: "Grammaire, vocabulaire et compétences linguistiques",
      icon: <Languages className="w-8 h-8" />,
      color: "bg-gradient-to-br from-cyan-500 to-blue-600",
      periods: [
        "Grammaire de base",
        "Construction du vocabulaire",
        "Compréhension écrite",
        "Compétences rédactionnelles",
        "Pratique orale",
        "Grammaire avancée",
        "Analyse littéraire"
      ]
    }
  ];

  const category = studyCategories.find(cat => cat.id === categoryData.categoryId);

  if (!category) {
    navigate('/');
    return null;
  }

  const handlePeriodToggle = (period: string) => {
    const newSelectedPeriods = selectedPeriods.includes(period) 
      ? selectedPeriods.filter(p => p !== period)
      : [...selectedPeriods, period];
    
    setSelectedPeriods(newSelectedPeriods);
    
    // Navigation automatique dès qu'on sélectionne au moins une période
    if (newSelectedPeriods.length > 0) {
      setTimeout(() => {
        navigate('/study', { 
          state: { 
            categoryId: category.id,
            categoryName: category.name,
            categoryColor: category.color,
            periods: newSelectedPeriods 
          }
        });
      }, 500); // Délai plus long pour voir la sélection
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <div className="bg-ai-surface border-b border-border/50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost" 
              size="sm"
              onClick={handleBack}
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
                <h1 className="text-xl font-bold">{category.name}</h1>
                <p className="text-muted-foreground">Choisissez des sujets spécifiques à étudier</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-ai-primary" />
            <h2 className="text-xl font-semibold">Sélectionner les périodes d'étude</h2>
          </div>
          <p className="text-muted-foreground">
            Choisissez une ou plusieurs périodes/sujets sur lesquels vous voulez vérifier vos connaissances.
            Vous pouvez sélectionner plusieurs domaines pour une session d'étude complète.
          </p>
        </div>

        {/* Period Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {category.periods?.map((period, index) => {
            const isSelected = selectedPeriods.includes(period);
            return (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  isSelected
                    ? 'ring-2 ring-ai-primary bg-ai-primary/5 border-ai-primary/30'
                    : 'hover:shadow-lg hover:bg-ai-surface-elevated'
                }`}
                onClick={() => handlePeriodToggle(period)}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`font-medium ${isSelected ? 'text-ai-primary' : ''}`}>
                      {period}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Testez vos connaissances dans ce domaine
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected 
                      ? 'border-ai-primary bg-ai-primary text-white' 
                      : 'border-muted-foreground/30'
                  }`}>
                    {isSelected && <CheckCircle className="w-4 h-4" />}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Suppression de la section "Selected Summary" car navigation automatique */}

        {/* Conseils d'étude déplacés vers la session d'étude */}
      </div>
    </div>
  );
}