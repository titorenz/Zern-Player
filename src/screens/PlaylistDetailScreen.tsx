import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Text, List, useTheme, FAB, ActivityIndicator, Divider, Appbar, Menu, IconButton } from 'react-native-paper';
import { usePlaylists } from '../contexts/PlaylistContext';
import { useAudio } from '../contexts/AudioPlayerContext';
import { useAppTheme } from '../contexts/ThemeContext';
import { Song, Playlist } from '../types';
import * as PlaylistService from '../services/playlistService'; // For fetching full playlist details
import GlassCard from '../components/GlassCard';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// This screen would typically be part of a navigation stack, receiving playlistId as a param
interface PlaylistDetailScreenProps {
  playlistId: string; // Received via navigation params
  onBack: () => void; // Simple back function for now
  // onNavigateToSongPicker: (playlistId: string) => void; // For adding songs
}

const PlaylistDetailScreen: React.FC<PlaylistDetailScreenProps> = ({ playlistId, onBack }) => {
  const { playlists, removeSongFromPlaylist, playSongFromQueue, currentQueue } = usePlaylists(); // Get playlists at the top
  const { playerState } = useAudio();
  const { theme } = useAppTheme();
  const paperTheme = useTheme();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);


  const fetchPlaylistDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedPlaylist = await PlaylistService.getPlaylistById(playlistId);
      setPlaylist(fetchedPlaylist);
    } catch (error) {
      console.error("Failed to fetch playlist details:", error);
      Alert.alert("Error", "Could not load playlist details.");
      // Optionally navigate back or show an error state
    } finally {
      setIsLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    fetchPlaylistDetails();
  }, [fetchPlaylistDetails]);

  // Refetch if the currentQueue (which might be this playlist) changes externally
  // or if the playlist object itself from PlaylistContext changes.
  // This is a bit simplistic; a more robust solution might involve listening to specific playlist updates.
  useEffect(() => {
    const currentPlaylistFromContext = playlists.find(p => p.id === playlistId);
    if (currentPlaylistFromContext && JSON.stringify(currentPlaylistFromContext.songs) !== JSON.stringify(playlist?.songs)) {
      setPlaylist(currentPlaylistFromContext);
    }
  }, [playlists, playlistId, playlist?.songs]);


  const handleRemoveSong = (songId: string, songTitle: string) => {
    if (!playlist) return;
    Alert.alert(
      "Remove Song",
      `Are you sure you want to remove "${songTitle}" from "${playlist.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedPlaylist = await PlaylistService.removeSongFromPlaylist(playlist.id, songId); // Use direct service call
              if (updatedPlaylist) {
                 setPlaylist(updatedPlaylist); // Update local state
                 // Also trigger a refresh in context if this playlist is the one modified
                 // This will be handled by the useEffect that listens to playlist changes from context.
                 // For immediate UI update and to ensure context is also up-to-date:
                 await removeSongFromPlaylist(playlist.id, songId); // Call context's method to update global state & AsyncStorage
              } else {
                Alert.alert("Error", "Could not update playlist after removing song.");
              }
            } catch (error) {
              Alert.alert("Error", `Could not remove song "${songTitle}".`);
            }
          },
        },
      ]
    );
  };

  const handlePlaySong = (song: Song, index: number) => {
    if (playlist) {
      playSongFromQueue(song, playlist.songs, index);
    }
  };

  const renderSongItem = ({ item, index }: { item: Song, index: number }) => {
    const isPlayingThisSong = playerState.currentSong?.id === item.id && playerState.isPlaying;
    const isCurrentSong = playerState.currentSong?.id === item.id;

    return (
      <GlassCard style={styles.songItemCard}>
        <List.Item
          title={item.title}
          titleStyle={{
            color: isCurrentSong ? theme.colors.primary : theme.colors.onSurface,
            fontWeight: isCurrentSong ? 'bold' : 'normal'
          }}
          description={`${item.artist} - ${item.album}`}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={props => (
            <TouchableOpacity onPress={() => handlePlaySong(item, index)} style={styles.playIconContainer}>
              <List.Icon
                {...props}
                icon={isPlayingThisSong ? "pause-circle" : (isCurrentSong ? "play-circle-outline" : "play-circle")}
                color={isCurrentSong ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          )}
          right={props => (
            <IconButton
              {...props}
              icon="minus-circle-outline"
              iconColor={theme.colors.error}
              size={20}
              onPress={() => handleRemoveSong(item.id, item.title)}
            />
          )}
          onPress={() => handlePlaySong(item, index)}
        />
      </GlassCard>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
        <Text style={{marginTop: 10, color: theme.colors.onSurface}}>Loading playlist...</Text>
      </View>
    );
  }

  if (!playlist) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
          <Appbar.BackAction onPress={onBack} color={theme.colors.onSurface} />
          <Appbar.Content title="Playlist Not Found" titleStyle={{color: theme.colors.onSurface}} />
        </Appbar.Header>
        <Text style={{color: theme.colors.onSurface}}>Playlist details could not be loaded.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.elevation.level2 }}>
        <Appbar.BackAction onPress={onBack} color={theme.colors.onSurface} />
        <Appbar.Content title={playlist.name} titleStyle={{color: theme.colors.onSurface}} subtitle={`${playlist.songs.length} songs`} subtitleStyle={{color: theme.colors.onSurfaceVariant}}/>
        {/* <Appbar.Action icon="plus" onPress={() => {/* TODO: onNavigateToSongPicker(playlistId) }} color={theme.colors.primary} /> */}
        {/* TODO: Add rename playlist option here if desired */}
      </Appbar.Header>

      {playlist.songs.length === 0 ? (
        <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="music-note-off" size={64} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.emptyText, {color: theme.colors.onSurfaceVariant}]}>This playlist is empty.</Text>
            <Text style={[styles.emptySubText, {color: theme.colors.onSurfaceVariant}]}>Add songs from your library.</Text>
        </View>
      ) : (
        <FlatList
          data={playlist.songs}
          renderItem={renderSongItem}
          keyExtractor={item => item.id}
          ItemSeparatorComponent={() => <View style={{height: 2}} />} // Minimal separator, GlassCard provides visual separation
          contentContainerStyle={styles.listContentContainer}
        />
      )}
      {/*
      <FAB
        icon="plus"
        label="Add Songs"
        style={[styles.fab, { backgroundColor: theme.colors.primaryContainer }]}
        onPress={() => { /* TODO: onNavigateToSongPicker(playlistId) * / }}
        color={theme.colors.onPrimaryContainer}
      />
      */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContentContainer: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 16,
  },
  songItemCard: {
    marginVertical: 4, // Reduced margin as items are smaller
    marginHorizontal: 8,
  },
  playIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%', // Ensure it takes full height of List.Item left area
    paddingLeft: 8, // Adjust as needed
    paddingRight: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  }
});

export default PlaylistDetailScreen;
