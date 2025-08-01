import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from 'next-themes';
import { material3Theme, darkMaterial3Theme } from '@/theme/material3Theme';

interface Material3ProviderProps {
  children: React.ReactNode;
}

export function Material3Provider({ children }: Material3ProviderProps) {
  const { theme } = useTheme();
  
  const currentTheme = theme === 'dark' ? darkMaterial3Theme : material3Theme;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}