import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { ParamListBase } from '@react-navigation/native';

export type PlaylistsStackParamList = {
  Playlists: undefined;
  PlaylistDetail: { id: string };
};

const Stack = createStackNavigator<PlaylistsStackParamList>();

const PlaylistsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen 
      name="Playlists" 
      children={({ navigation }) => (
        <PlaylistsScreen onNavigateToPlaylistDetail={id => navigation.navigate('PlaylistDetail', { id })} />
      )}
    />
    <Stack.Screen 
      name="PlaylistDetail" 
      children={({ route, navigation }) => (
        <PlaylistDetailScreen 
          playlistId={route.params.id} 
          onBack={() => navigation.goBack()} 
        />
      )}
    />
  </Stack.Navigator>
);

export default PlaylistsStack;
