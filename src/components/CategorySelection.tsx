import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  Globe, 
  Calculator, 
  Atom, 
  Palette, 
  Music,
  Languages,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface StudyCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  periods?: string[];
}

const studyCategories: StudyCategory[] = [
  {
    id: "history",
    name: "History",
    description: "World events, civilizations, and timelines",
    icon: <BookOpen className="w-8 h-8" />,
    color: "bg-gradient-to-br from-amber-500 to-orange-600",
    periods: [
      "Ancient History (3000 BCE - 500 CE)",
      "Medieval Period (500 - 1500 CE)", 
      "Renaissance (1400 - 1600 CE)",
      "Age of Exploration (1400 - 1700 CE)",
      "Industrial Revolution (1760 - 1840 CE)",
      "Modern History (1800 - 1945 CE)",
      "Contemporary History (1945 - Present)"
    ]
  },
  {
    id: "geography",
    name: "Geography", 
    description: "Countries, capitals, physical features",
    icon: <Globe className="w-8 h-8" />,
    color: "bg-gradient-to-br from-emerald-500 to-teal-600",
    periods: [
      "Physical Geography",
      "Political Geography", 
      "Europe",
      "Asia",
      "Africa", 
      "Americas",
      "Oceania"
    ]
  },
  {
    id: "mathematics",
    name: "Mathematics",
    description: "Algebra, geometry, calculus, and more",
    icon: <Calculator className="w-8 h-8" />,
    color: "bg-gradient-to-br from-blue-500 to-indigo-600",
    periods: [
      "Basic Arithmetic",
      "Algebra",
      "Geometry",
      "Trigonometry",
      "Calculus",
      "Statistics",
      "Advanced Mathematics"
    ]
  },
  {
    id: "science",
    name: "Science",
    description: "Physics, chemistry, biology concepts",
    icon: <Atom className="w-8 h-8" />,
    color: "bg-gradient-to-br from-purple-500 to-pink-600",
    periods: [
      "General Science",
      "Physics",
      "Chemistry", 
      "Biology",
      "Earth Science",
      "Environmental Science",
      "Advanced Sciences"
    ]
  },
  {
    id: "literature",
    name: "Literature",
    description: "Classic works, authors, and literary periods",
    icon: <Palette className="w-8 h-8" />,
    color: "bg-gradient-to-br from-rose-500 to-red-600",
    periods: [
      "Classical Literature",
      "Medieval Literature",
      "Renaissance Literature",
      "Romantic Period",
      "Victorian Era",
      "Modern Literature",
      "Contemporary Literature"
    ]
  },
  {
    id: "languages",
    name: "Languages",
    description: "Grammar, vocabulary, and language skills",
    icon: <Languages className="w-8 h-8" />,
    color: "bg-gradient-to-br from-cyan-500 to-blue-600",
    periods: [
      "Basic Grammar",
      "Vocabulary Building",
      "Reading Comprehension",
      "Writing Skills",
      "Speaking Practice",
      "Advanced Grammar",
      "Literature Analysis"
    ]
  }
];

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

  return (
    <div className="bg-gradient-surface">
      {/* Header */}
      <div className="bg-ai-surface border-b border-border/50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Study Companion</h1>
              <p className="text-muted-foreground">Choose your study category to begin verification</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">What would you like to study today?</h2>
          <p className="text-muted-foreground">
            Select a subject category to start your knowledge verification session with AI
          </p>
        </div>

        {/* Instructions */}
        <Card className="bg-ai-surface border-border/50 mb-8">
          <div className="p-4">
            <h4 className="font-medium mb-2 flex items-center">
              <GraduationCap className="w-4 h-4 mr-2 text-ai-accent" />
              How it works
            </h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Choose a subject category that you want to study</li>
              <li>Select the specific period or topic you've been learning</li>
              <li>Start speaking with the AI to test your knowledge</li>
              <li>Confirm or correct the information presented by the AI</li>
            </ol>
          </div>
        </Card>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {studyCategories.map((category) => (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedCategory?.id === category.id
                  ? 'ring-2 ring-ai-primary bg-ai-primary/5'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => handleCategorySelect(category)}
            >
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
                  {category.periods?.length} topics available
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Selected Category Preview */}
        {selectedCategory && (
          <Card className="bg-ai-surface-elevated border-ai-primary/20 mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${selectedCategory.color} rounded-lg flex items-center justify-center text-white`}>
                    {selectedCategory.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedCategory.name}</h3>
                    <p className="text-sm text-muted-foreground">Selected category</p>
                  </div>
                </div>
                <Button 
                  onClick={handleContinue}
                  className="bg-ai-primary hover:bg-ai-primary/90"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Available study periods:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCategory.periods?.slice(0, 4).map((period, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-muted px-2 py-1 rounded-full"
                    >
                      {period}
                    </span>
                  ))}
                  {selectedCategory.periods && selectedCategory.periods.length > 4 && (
                    <span className="text-xs text-muted-foreground px-2 py-1">
                      +{selectedCategory.periods.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}