import { createTheme } from '@mui/material/styles';

// Couleurs Material 3 personnalisées basées sur notre design
const material3Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'hsl(270, 50%, 40%)', // Primary
      light: 'hsl(270, 40%, 85%)', // Primary Container
      dark: 'hsl(270, 60%, 30%)',
      contrastText: '#ffffff', // On Primary
    },
    secondary: {
      main: 'hsl(220, 15%, 25%)', // --secondary
      light: 'hsl(220, 15%, 35%)',
      dark: 'hsl(220, 15%, 15%)',
      contrastText: '#ffffff',
    },
    error: {
      main: 'hsl(0, 62%, 50%)', // --destructive
      light: 'hsl(0, 62%, 60%)',
      dark: 'hsl(0, 62%, 40%)',
      contrastText: '#ffffff',
    },
    background: {
      default: 'hsl(0, 0%, 100%)', // --background
      paper: 'hsl(0, 0%, 98%)', // --card
    },
    text: {
      primary: 'hsl(220, 15%, 10%)', // --foreground
      secondary: 'hsl(220, 15%, 45%)', // --muted-foreground
    },
  },
  shape: {
    borderRadius: 12, // Material 3 style radius
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '8px 16px',
          fontWeight: 500,
        },
        containedPrimary: {
          backgroundColor: 'hsl(270, 50%, 40%)',
          '&:hover': {
            backgroundColor: 'hsl(270, 60%, 35%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

// Version dark mode
const darkMaterial3Theme = createTheme({
  ...material3Theme,
  palette: {
    ...material3Theme.palette,
    mode: 'dark',
    primary: {
      main: 'hsl(270, 60%, 60%)',
      light: 'hsl(270, 50%, 80%)',
      dark: 'hsl(270, 70%, 40%)',
      contrastText: '#000000',
    },
    background: {
      default: 'hsl(220, 15%, 10%)', // --background dark
      paper: 'hsl(220, 15%, 15%)', // --card dark
    },
    text: {
      primary: 'hsl(220, 15%, 95%)', // --foreground dark
      secondary: 'hsl(220, 15%, 65%)', // --muted-foreground dark
    },
  },
});

export { material3Theme, darkMaterial3Theme };