import React from 'react';
import { StatusBar } from 'expo-status-bar'; // Keep StatusBar import
import { AudioPlayerProvider } from './src/contexts/AudioPlayerContext';
import { PlaylistProvider } from './src/contexts/PlaylistContext';
import { ThemeProvider, useAppTheme } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator'; // Import AppNavigator
import { View, StyleSheet } from 'react-native'; // Keep View and StyleSheet for potential status bar wrapping

// ThemedStatusBar component to use theme context for StatusBar style
const ThemedStatusBar = () => {
  const { theme } = useAppTheme();
  return <StatusBar style={theme.dark ? "light" : "dark"} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AudioPlayerProvider>
        <PlaylistProvider>
          {/* AppNavigator now contains NavigationContainer and thus defines the background */}
          <AppNavigator />
          {/* StatusBar needs to be a child of ThemeProvider to access theme,
              but not necessarily inside NavigationContainer's View.
              Placing it here makes it global. AppNavigator will handle screen views.
          */}
          <ThemedStatusBar />
        </PlaylistProvider>
      </AudioPlayerProvider>
    </ThemeProvider>
  );
}

// Styles are no longer needed here for a main container,
// as NavigationContainer and screens will manage their own views.
// const styles = StyleSheet.create({
//   container: {
//   flex: 1,
//   },
// });
