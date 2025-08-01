import { useState } from "react";
import { BookOpen, Globe, Calculator, Atom, Palette, Languages } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { categoryColors, getCategoryGradientClasses } from "@/utils/categoryColors";
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardActionArea,
  Chip
} from "@mui/material";
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
  color: getCategoryGradientClasses("history"),
  periods: ["Histoire ancienne (3000 av. J.-C. - 500 ap. J.-C.)", "Période médiévale (500 - 1500 ap. J.-C.)", "Renaissance (1400 - 1600 ap. J.-C.)", "Âge des explorations (1400 - 1700 ap. J.-C.)", "Révolution industrielle (1760 - 1840 ap. J.-C.)", "Histoire moderne (1800 - 1945 ap. J.-C.)", "Histoire contemporaine (1945 - Présent)"]
}, {
  id: "geography",
  name: "Géographie",
  description: "Pays, capitales, caractéristiques physiques",
  icon: <Globe className="w-8 h-8" />,
  color: getCategoryGradientClasses("geography"),
  periods: ["Géographie physique", "Géographie politique", "Europe", "Asie", "Afrique", "Amériques", "Océanie"]
}, {
  id: "mathematics",
  name: "Mathématiques",
  description: "Algèbre, géométrie, calcul, et plus",
  icon: <Calculator className="w-8 h-8" />,
  color: getCategoryGradientClasses("mathematics"),
  periods: ["Arithmétique de base", "Algèbre", "Géométrie", "Trigonométrie", "Calcul", "Statistiques", "Mathématiques avancées"]
}, {
  id: "science",
  name: "Sciences",
  description: "Concepts de physique, chimie, biologie",
  icon: <Atom className="w-8 h-8" />,
  color: getCategoryGradientClasses("science"),
  periods: ["Sciences générales", "Physique", "Chimie", "Biologie", "Sciences de la Terre", "Sciences environnementales", "Sciences avancées"]
}, {
  id: "literature",
  name: "Littérature",
  description: "Œuvres classiques, auteurs et périodes littéraires",
  icon: <Palette className="w-8 h-8" />,
  color: getCategoryGradientClasses("literature"),
  periods: ["Littérature classique", "Littérature médiévale", "Littérature de la Renaissance", "Période romantique", "Ère victorienne", "Littérature moderne", "Littérature contemporaine"]
}, {
  id: "languages",
  name: "Langues",
  description: "Grammaire, vocabulaire et compétences linguistiques",
  icon: <Languages className="w-8 h-8" />,
  color: getCategoryGradientClasses("languages"),
  periods: ["Grammaire de base", "Construction du vocabulaire", "Compréhension écrite", "Compétences rédactionnelles", "Pratique orale", "Grammaire avancée", "Analyse littéraire"]
}];
export function CategorySelection() {
  const [selectedCategory, setSelectedCategory] = useState<StudyCategory | null>(null);
  const navigate = useNavigate();
  const handleCategorySelect = (category: StudyCategory) => {
    setSelectedCategory(category);
    // Navigation automatique après sélection
    setTimeout(() => {
      navigate(`/periods/${category.id}`, {
        state: {
          categoryId: category.id,
          categoryName: category.name,
          categoryDescription: category.description,
          categoryColor: category.color,
          categoryPeriods: category.periods
        }
      });
    }, 300); // Délai court pour voir la sélection
  };
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" sx={{ 
            fontWeight: 'bold', 
            color: 'text.primary',
            mb: 2,
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}>
            Que souhaitez-vous étudier aujourd'hui ?
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Sélectionnez une catégorie de matière pour commencer votre session de vérification de connaissances avec l'IA
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
          gap: 3 
        }}>
          {studyCategories.map((category) => (
            <Card 
              key={category.id}
              sx={{ 
                height: '100%',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 6,
                },
                ...(selectedCategory?.id === category.id && {
                  transform: 'scale(1.05)',
                  boxShadow: 8,
                  border: '2px solid',
                  borderColor: 'primary.main'
                })
              }}
            >
              <CardActionArea onClick={() => handleCategorySelect(category)} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Box 
                      sx={{ 
                        width: 64, 
                        height: 64,
                        background: `linear-gradient(135deg, ${categoryColors[category.id]?.gradient || 'hsl(220, 70%, 50%), hsl(220, 70%, 60%)'})`,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      {category.icon}
                    </Box>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {category.description}
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${category.periods?.length} sujets disponibles`}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}