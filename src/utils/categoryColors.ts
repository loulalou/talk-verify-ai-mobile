// Centralized category color system that aligns with our elegant blue & warm palette

export interface CategoryColorScheme {
  id: string;
  name: string;
  // Solid colors for badges, backgrounds, etc.
  primary: string;    // Main color
  light: string;      // Light background
  dark: string;       // Dark variant for text/borders
  // CSS classes for gradients
  gradient: string;   // Gradient background class
  // Semantic color values for consistency
  hsl: {
    primary: string;
    light: string;
    dark: string;
  };
}

export const categoryColors: Record<string, CategoryColorScheme> = {
  history: {
    id: "history",
    name: "Histoire",
    primary: "#D97706", // Amber-600
    light: "#FEF3C7",   // Amber-50
    dark: "#92400E",    // Amber-700
    gradient: "bg-gradient-to-br from-amber-500 to-amber-700",
    hsl: {
      primary: "25 95% 53%",  // #D97706
      light: "48 100% 88%",   // #FEF3C7
      dark: "25 95% 33%"      // #92400E
    }
  },
  geography: {
    id: "geography", 
    name: "Géographie",
    primary: "#059669", // Emerald-600
    light: "#D1FAE5",   // Emerald-50
    dark: "#047857",    // Emerald-700
    gradient: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    hsl: {
      primary: "160 84% 39%", // #059669
      light: "152 76% 90%",   // #D1FAE5
      dark: "160 84% 29%"     // #047857
    }
  },
  mathematics: {
    id: "mathematics",
    name: "Mathématiques", 
    primary: "#2563EB", // Blue-600
    light: "#DBEAFE",   // Blue-50
    dark: "#1D4ED8",    // Blue-700
    gradient: "bg-gradient-to-br from-blue-500 to-blue-700",
    hsl: {
      primary: "221 83% 53%", // #2563EB
      light: "214 100% 92%",  // #DBEAFE
      dark: "221 83% 43%"     // #1D4ED8
    }
  },
  science: {
    id: "science",
    name: "Sciences",
    primary: "#7C3AED", // Violet-600
    light: "#EDE9FE",   // Violet-50
    dark: "#6D28D9",    // Violet-700
    gradient: "bg-gradient-to-br from-violet-500 to-violet-700",
    hsl: {
      primary: "262 83% 58%", // #7C3AED
      light: "250 100% 96%",  // #EDE9FE
      dark: "262 83% 48%"     // #6D28D9
    }
  },
  literature: {
    id: "literature",
    name: "Littérature",
    primary: "#DC2626", // Red-600
    light: "#FEE2E2",   // Red-50
    dark: "#B91C1C",    // Red-700
    gradient: "bg-gradient-to-br from-red-500 to-red-700",
    hsl: {
      primary: "0 84% 60%",   // #DC2626
      light: "0 86% 97%",     // #FEE2E2
      dark: "0 84% 50%"       // #B91C1C
    }
  },
  languages: {
    id: "languages",
    name: "Langues",
    primary: "#0891B2", // Cyan-600
    light: "#CFFAFE",   // Cyan-50
    dark: "#0E7490",    // Cyan-700
    gradient: "bg-gradient-to-br from-cyan-500 to-cyan-700",
    hsl: {
      primary: "188 94% 37%", // #0891B2
      light: "185 96% 90%",   // #CFFAFE
      dark: "188 94% 27%"     // #0E7490
    }
  }
};

// Helper functions
export const getCategoryColor = (categoryId: string): CategoryColorScheme | null => {
  return categoryColors[categoryId] || null;
};

export const getCategoryBadgeClasses = (categoryId: string): string => {
  const colors = getCategoryColor(categoryId);
  if (!colors) return "bg-secondary text-secondary-foreground";
  
  return `bg-[${colors.light}] text-[${colors.dark}] border border-[${colors.primary}]/20`;
};

export const getCategoryIconClasses = (categoryId: string): string => {
  const colors = getCategoryColor(categoryId);
  if (!colors) return "text-muted-foreground";
  
  return `text-[${colors.primary}]`;
};

export const getCategoryGradientClasses = (categoryId: string): string => {
  const colors = getCategoryColor(categoryId);
  if (!colors) return "bg-secondary";
  
  return colors.gradient;
};

// CSS variable generator for dynamic theming
export const generateCategoryCSSVariables = (): string => {
  let cssVars = "";
  
  Object.values(categoryColors).forEach(category => {
    cssVars += `
    --category-${category.id}-primary: ${category.hsl.primary};
    --category-${category.id}-light: ${category.hsl.light};
    --category-${category.id}-dark: ${category.hsl.dark};`;
  });
  
  return cssVars;
};