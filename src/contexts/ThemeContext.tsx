import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { MD3DarkTheme, MD3LightTheme, PaperProvider, adaptNavigationTheme } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

// Augment the Paper theme type to include our custom colors or properties if needed in future
// import { MD3Theme } from 'react-native-paper';
// interface ExtendedTheme extends MD3Theme {
//   // custom properties
// }

export const CombinedDefaultTheme = {
  ...MD3LightTheme,
  ...NavigationDefaultTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...NavigationDefaultTheme.colors,
    primary: '#6750A4', // Example primary, adjust as needed
    background: '#F7F2FA',
    card: '#EADDFF', // Usually surface for Paper
    text: '#1C1B1F',
    border: 'rgb(199, 199, 204)', // from navigation
    notification: MD3LightTheme.colors.error, // or another color
    // Glassmorphism specific colors (can be part of theme.colors or separate)
    glassBackgroundLight: 'rgba(255, 255, 255, 0.7)',
    glassBorderLight: 'rgba(0, 0, 0, 0.1)',
  },
};

export const CombinedDarkTheme = {
  ...MD3DarkTheme,
  ...NavigationDarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...NavigationDarkTheme.colors,
    primary: '#D0BCFF', // Example primary, adjust as needed
    background: '#1C1B1F',
    card: '#383240', // Usually surface for Paper
    text: '#E6E1E5',
    border: 'rgb(39, 39, 41)', // from navigation
    notification: MD3DarkTheme.colors.error,
    // Glassmorphism specific colors
    glassBackgroundDark: 'rgba(40, 40, 40, 0.75)', // Slightly more opaque for dark
    glassBorderDark: 'rgba(255, 255, 255, 0.15)', // Brighter border for dark
  },
};


interface ThemeContextType {
  theme: typeof CombinedDefaultTheme | typeof CombinedDarkTheme;
  isDarkTheme: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false); // Default to light theme

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  // Memoize the theme object to prevent unnecessary re-renders
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
