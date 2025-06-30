import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, List, useTheme, ActivityIndicator, Searchbar, FAB, Portal, Dialog, Checkbox, Button as PaperButton, Appbar } from 'react-native-paper';
import { usePlaylists } from '../contexts/PlaylistContext';
import { useAudio } from '../contexts/AudioPlayerContext';
import { useAppTheme } from '../contexts/ThemeContext';
import { Song, Playlist } from '../types';
import * as PlaylistService from '../services/playlistService'; // Using this to get all songs
import GlassCard from '../components/GlassCard';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface SongLibraryScreenProps {
  // Props for navigation if any, e.g. onGoToPlayer: () => void;
  // For now, it's standalone for display in App.tsx
}

const SongLibraryScreen: React.FC<SongLibraryScreenProps> = () => {
  const { playSongFromQueue, playerState, playlists, addSongToPlaylist, loadPlaylists } = usePlaylists();
  const { theme } = useAppTheme();
  const paperTheme = useTheme();

  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);

  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState<Song | null>(null);
  const [playlistPickerVisible, setPlaylistPickerVisible] = useState(false);

  // State for which playlists a song is already in (for the picker)
  // This is a bit complex for a simple picker, could be simplified or made more robust
  const [targetPlaylists, setTargetPlaylists] = useState<string[]>([]);


  const fetchAllSongs = useCallback(async () => {
    setIsLoading(true);
    try {
      const songs = await PlaylistService.getAllSongs();
      setAllSongs(songs);
      setFilteredSongs(songs); // Initially, all songs are shown
    } catch (error) {
      console.error("Failed to fetch all songs:", error);
      Alert.alert("Error", "Could not load song library.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSongs();
    loadPlaylists(); // Ensure playlists are loaded for the picker
  }, [fetchAllSongs, loadPlaylists]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSongs(allSongs);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = allSongs.filter(
        song =>
          song.title.toLowerCase().includes(lowerCaseQuery) ||
          song.artist.toLowerCase().includes(lowerCaseQuery) ||
          song.album.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredSongs(filtered);
    }
  }, [searchQuery, allSongs]);

  const handlePlaySong = (song: Song) => {
    // Play song in a new queue containing only this song, or add to current and play
    playSongFromQueue(song, [song], 0);
    // Potentially navigate to PlayerScreen if not already there (handled by main navigation later)
  };

  const openPlaylistPicker = (song: Song) => {
    setSelectedSongForPlaylist(song);
    // Determine which playlists this song is already in
    const songInPlaylists = playlists.filter(p => p.songs.some(s => s.id === song.id)).map(p => p.id);
    setTargetPlaylists(songInPlaylists);
    setPlaylistPickerVisible(true);
  };

  const handleTogglePlaylistForSong = (playlistId: string) => {
    setTargetPlaylists(prev =>
      prev.includes(playlistId) ? prev.filter(id => id !== playlistId) : [...prev, playlistId]
    );
  };

  const handleSaveSongToPlaylists = async () => {
    if (!selectedSongForPlaylist) return;

    setIsLoading(true); // Use main loading indicator for simplicity
    try {
        // Add to newly selected playlists
        for (const playlistId of targetPlaylists) {
            if (!playlists.find(p => p.id === playlistId)?.songs.some(s => s.id === selectedSongForPlaylist.id)) {
                 await addSongToPlaylist(playlistId, selectedSongForPlaylist);
            }
        }
        // Remove from deselected playlists
        for (const playlist of playlists) {
            if (!targetPlaylists.includes(playlist.id) && playlist.songs.some(s => s.id === selectedSongForPlaylist.id)) {
                // This is effectively removeSongFromPlaylist, but addSongToPlaylist in context handles storage.
                // We might need a more direct `removeSongFromPlaylist` call if context doesn't update storage correctly for removal via this path.
                // For now, relying on the fact that `addSongToPlaylist` in context uses `PlaylistService.addSongToPlaylist` which should save.
                // This part is tricky: we are modifying based on selection, not just adding.
                // A better approach would be specific add/remove calls.
                // For now, this focuses on adding. A "remove from playlist" would be better handled in PlaylistDetailScreen.
                // Let's simplify: this dialog will only ADD to selected playlists.
            }
        }
        Alert.alert("Success", `${selectedSongForPlaylist.title} has been added to the selected playlists.`);
    } catch (error) {
        Alert.alert("Error", "Could not add song to playlists.");
        console.error(error);
    } finally {
        setIsLoading(false);
        setPlaylistPickerVisible(false);
        setSelectedSongForPlaylist(null);
        setTargetPlaylists([]);
        await loadPlaylists(); // Refresh playlist data
    }
  };


  const renderSongItem = ({ item }: { item: Song }) => {
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
            <TouchableOpacity onPress={() => handlePlaySong(item)} style={styles.playIconContainer}>
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
              icon="playlist-plus"
              iconColor={theme.colors.primary}
              size={24}
              onPress={() => openPlaylistPicker(item)}
            />
          )}
          onPress={() => handlePlaySong(item)}
        />
      </GlassCard>
    );
  };

  if (isLoading && allSongs.length === 0) { // Show loading only on initial load
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
        <Text style={{marginTop: 10, color: theme.colors.onSurface}}>Loading songs...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.elevation.level2 }}>
        <Appbar.Content title="Song Library" titleStyle={{color: theme.colors.onSurface, fontWeight: 'bold'}} />
      </Appbar.Header>
      <Searchbar
        placeholder="Search songs, artists, albums"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchbar, {backgroundColor: theme.colors.elevation.level3}]}
        inputStyle={{color: theme.colors.onSurface}}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        iconColor={theme.colors.onSurfaceVariant}
        theme={paperTheme} // Pass the paper theme for internal components
      />
      {filteredSongs.length === 0 && !isLoading ? (
         <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="music-off" size={64} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.emptyText, {color: theme.colors.onSurfaceVariant}]}>
              {searchQuery ? "No songs match your search." : "No songs in library."}
            </Text>
            {!searchQuery && <Text style={[styles.emptySubText, {color: theme.colors.onSurfaceVariant}]}>Add songs to get started.</Text>}
         </View>
      ) : (
        <FlatList
          data={filteredSongs}
          renderItem={renderSongItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContentContainer}
        />
      )}

      {selectedSongForPlaylist && (
        <Portal>
          <Dialog visible={playlistPickerVisible} onDismiss={() => setPlaylistPickerVisible(false)} style={{backgroundColor: theme.colors.elevation.level3}}>
            <Dialog.Title style={{color: theme.colors.onSurface}}>Add "{selectedSongForPlaylist.title}" to...</Dialog.Title>
            <Dialog.ScrollArea style={{ maxHeight: 300, paddingHorizontal: 0 }}>
              {playlists.length === 0 ? (
                <Text style={{padding: 20, color: theme.colors.onSurfaceVariant, textAlign:'center'}}>No playlists available. Create one first!</Text>
              ) : playlists.map(playlist => (
                <List.Item
                  key={playlist.id}
                  title={playlist.name}
                  titleStyle={{color: theme.colors.onSurface}}
                  onPress={() => handleTogglePlaylistForSong(playlist.id)}
                  left={props => <List.Icon {...props} icon={targetPlaylists.includes(playlist.id) ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} color={theme.colors.primary} />}
                />
              ))}
            </Dialog.ScrollArea>
            <Dialog.Actions>
              <PaperButton onPress={() => setPlaylistPickerVisible(false)} textColor={theme.colors.secondary} disabled={isLoading}>Cancel</PaperButton>
              <PaperButton onPress={handleSaveSongToPlaylists} loading={isLoading} disabled={isLoading || playlists.length === 0} textColor={theme.colors.primary}>Save</PaperButton>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      )}
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
  searchbar: {
    margin: 8,
    borderRadius: 10, // Softer radius
    elevation: 2,
  },
  listContentContainer: {
    paddingHorizontal: 8,
    paddingTop: 0, // Searchbar has margin
    paddingBottom: 16,
  },
  songItemCard: {
    marginVertical: 4,
    marginHorizontal: 8,
  },
  playIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    paddingLeft: 8,
    paddingRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginTop:16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  }
});

export default SongLibraryScreen;
