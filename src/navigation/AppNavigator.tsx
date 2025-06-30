import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../contexts/ThemeContext';

// Screens
import PlayerScreen from '../screens/PlayerScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import SongLibraryScreen from '../screens/SongLibraryScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen'; // Will be part of a stack eventually

// For now, PlaylistDetailScreen won't be directly in tabs.
// We'll need a StackNavigator for the Playlists tab to include PlaylistDetailScreen.
// Let's start with a simple tab structure.
// TODO: Implement StackNavigator for Playlist flow.

const Tab = createMaterialBottomTabNavigator();

// Dummy component for PlaylistDetail placeholder in tab (will be replaced by stack)
// const PlaylistsStack = () => {
//   // This would be a StackNavigator in a real setup
//   return <PlaylistsScreen onNavigateToPlaylistDetail={(id) => console.log("Navigate to detail: ", id)} />;
// }

const AppNavigator = () => {
  const { theme, isDarkTheme } = useAppTheme();

  return (
    <NavigationContainer theme={theme}>
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
          name="PlaylistsTab" // Changed name to avoid conflict if a screen is also named "Playlists"
          // For now, directly using PlaylistsScreen. Later, this will be a StackNavigator.
          // The onNavigateToPlaylistDetail prop will need to be handled by the navigation system.
          component={PlaylistsScreen}
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
