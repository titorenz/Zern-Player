import React from 'react';
import { NavigationContainer, Theme as NavigationTheme, DefaultTheme } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../contexts/ThemeContext';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { ParamListBase } from '@react-navigation/native';

// Screens
import PlayerScreen from '../screens/PlayerScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import SongLibraryScreen from '../screens/SongLibraryScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen'; // Will be part of a stack eventually
import PlaylistsStack from './PlaylistsStack';

// For now, PlaylistDetailScreen won't be directly in tabs.
// We'll need a StackNavigator for the Playlists tab to include PlaylistDetailScreen.
// Let's start with a simple tab structure.
// TODO: Implement StackNavigator for Playlist flow.

const Tab = createMaterialBottomTabNavigator();

const AppNavigator = () => {
  const { theme, isDarkTheme } = useAppTheme();

  // Extend theme to match NavigationTheme requirements
  const navigationTheme: NavigationTheme = {
    ...DefaultTheme,
    ...theme,
    colors: {
      ...DefaultTheme.colors,
      ...theme.colors,
      card: (theme.colors as any).card || theme.colors.surface || '#fff',
      text: (theme.colors as any).text || '#000',
      border: (theme.colors as any).border || '#ccc',
      notification: (theme.colors as any).notification || theme.colors.primary || '#f00',
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        initialRouteName="Player"
        activeColor={theme.colors.primary}
        inactiveColor={theme.colors.onSurfaceVariant}
        barStyle={{ backgroundColor: theme.colors.elevation.level2 }} // Or theme.colors.surface for a flatter look
        shifting={false} // Or true for shifting effect
      >
        <Tab.Screen
          name="Player"
          component={PlayerScreen}
          options={{
            tabBarLabel: 'Player',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="music-circle" color={color} size={26} />
            ),
          }}
        />
        <Tab.Screen
          name="Library"
          component={SongLibraryScreen}
          options={{
            tabBarLabel: 'Library',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="music-box-multiple" color={color} size={26} />
            ),
          }}
        />
        <Tab.Screen
          name="PlaylistsTab"
          component={PlaylistsStack}
          options={{
            tabBarLabel: 'Playlists',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="playlist-music" color={color} size={26} />
            ),
          }}
        />
        {/* Settings Screen (Optional for later)
        <Tab.Screen
          name="Settings"
          component={SettingsScreen} // Create this screen later
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="cog" color={color} size={26} />
            ),
          }}
        />
        */}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
