import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { MD3DarkTheme, MD3LightTheme, PaperProvider, adaptNavigationTheme } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

// 1. Define custom color interface
interface GlassColors {
  glassBackgroundLight: string;
  glassBorderLight: string;
  glassBackgroundDark: string;
  glassBorderDark: string;
  border: string; // Add border as a custom color
  notification: string; // Add notification as a custom color
}

// 2. Extend the theme type
import type { MD3Theme } from 'react-native-paper';
export type AppTheme = MD3Theme & { colors: MD3Theme['colors'] & GlassColors };

export const CombinedDefaultTheme: AppTheme = {
  ...MD3LightTheme,
  ...NavigationDefaultTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...NavigationDefaultTheme.colors,
    primary: '#6750A4',
    background: '#F7F2FA',
    border: 'rgb(199, 199, 204)', // Now valid
    notification: MD3LightTheme.colors.error, // Now valid
    glassBackgroundLight: 'rgba(255, 255, 255, 0.7)',
    glassBorderLight: 'rgba(0, 0, 0, 0.1)',
    glassBackgroundDark: 'rgba(40, 40, 40, 0.75)', // Provide fallback for type safety
    glassBorderDark: 'rgba(255, 255, 255, 0.15)',
  },
};

export const CombinedDarkTheme: AppTheme = {
  ...MD3DarkTheme,
  ...NavigationDarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...NavigationDarkTheme.colors,
    primary: '#D0BCFF',
    background: '#1C1B1F',
    border: 'rgb(39, 39, 41)', // Now valid
    notification: MD3DarkTheme.colors.error, // Now valid
    glassBackgroundLight: 'rgba(255, 255, 255, 0.7)', // Provide fallback for type safety
    glassBorderLight: 'rgba(0, 0, 0, 0.1)',
    glassBackgroundDark: 'rgba(40, 40, 40, 0.75)',
    glassBorderDark: 'rgba(255, 255, 255, 0.15)',
  },
};

interface ThemeContextType {
  theme: AppTheme;
  isDarkTheme: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const theme = useMemo(() => (isDarkTheme ? CombinedDarkTheme : CombinedDefaultTheme), [isDarkTheme]);

  return (
    <ThemeContext.Provider value={{ theme, isDarkTheme, toggleTheme }}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
