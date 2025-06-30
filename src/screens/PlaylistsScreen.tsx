import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, List, useTheme, FAB, Dialog, Portal, TextInput as PaperTextInput, IconButton, Appbar } from 'react-native-paper';
import { usePlaylists } from '../contexts/PlaylistContext';
import { useAppTheme } from '../contexts/ThemeContext';
import { Playlist } from '../types';
import GlassCard from '../components/GlassCard';

interface PlaylistsScreenProps {
  onNavigateToPlaylistDetail: (playlistId: string) => void;
}

const PlaylistsScreen: React.FC<PlaylistsScreenProps> = ({ onNavigateToPlaylistDetail }) => {
  const { playlists, createPlaylist, deletePlaylist, renamePlaylist, loadPlaylists } = usePlaylists();
  const { theme } = useAppTheme();
  const paperTheme = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [renameDialogVisible, setRenameDialogVisible] = useState(false);
  const [playlistToRename, setPlaylistToRename] = useState<Playlist | null>(null);
  const [updatedPlaylistName, setUpdatedPlaylistName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const showModal = () => setModalVisible(true);
  const hideModal = () => {
    setModalVisible(false);
    setNewPlaylistName('');
  };

  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim() === '') {
      Alert.alert("Error", "Playlist name cannot be empty.");
      return;
    }
    setIsCreating(true);
    try {
      await createPlaylist(newPlaylistName.trim());
      hideModal();
    } catch (error) {
      Alert.alert("Error", "Could not create playlist.");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePlaylist = (playlistId: string, playlistName: string) => {
    Alert.alert(
      "Delete Playlist",
      `Are you sure you want to delete "${playlistName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePlaylist(playlistId);
            } catch (error) {
              Alert.alert("Error", `Could not delete playlist "${playlistName}".`);
            }
          }
        }
      ]
    );
  };

  const showRenameDialog = (playlist: Playlist) => {
    setPlaylistToRename(playlist);
    setUpdatedPlaylistName(playlist.name);
    setRenameDialogVisible(true);
  };

  const hideRenameDialog = () => {
    setRenameDialogVisible(false);
    setPlaylistToRename(null);
    setUpdatedPlaylistName('');
  };

  const handleRenamePlaylist = async () => {
    if (!playlistToRename || updatedPlaylistName.trim() === '') {
      Alert.alert("Error", "Playlist name cannot be empty.");
      return;
    }
    setIsRenaming(true);
    try {
      await renamePlaylist(playlistToRename.id, updatedPlaylistName.trim());
      hideRenameDialog();
    } catch (error) {
      Alert.alert("Error", `Could not rename playlist "${playlistToRename.name}".`);
    } finally {
      setIsRenaming(false);
    }
  };

  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <GlassCard style={styles.playlistItemCard}>
      <List.Item
        title={item.name}
        titleStyle={{ color: theme.colors.onSurface, fontWeight: 'bold' }}
        description={`${item.songs.length} song${item.songs.length === 1 ? '' : 's'}`}
        descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
        left={props => <List.Icon {...props} icon="playlist-music" color={theme.colors.primary} />}
        right={() => (
          <View style={styles.itemActions}>
            <IconButton
              icon="pencil-outline"
              size={20}
              iconColor={theme.colors.primary}
              onPress={() => showRenameDialog(item)}
            />
            <IconButton
              icon="delete-outline"
              size={20}
              iconColor={theme.colors.error}
              onPress={() => handleDeletePlaylist(item.id, item.name)}
            />
          </View>
        )}
        onPress={() => onNavigateToPlaylistDetail(item.id)}
        style={styles.listItem}
      />
    </GlassCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.elevation.level2 }}>
        <Appbar.Content title="My Playlists" titleStyle={{color: theme.colors.onSurface, fontWeight: 'bold'}} />
        {/* Optional: Add other actions like sort, search here */}
      </Appbar.Header>

      {playlists.length === 0 ? (
         <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, {color: theme.colors.onSurfaceVariant}]}>No playlists yet.</Text>
            <Text style={[styles.emptySubText, {color: theme.colors.onSurfaceVariant}]}>Tap the '+' button to create your first playlist!</Text>
         </View>
      ) : (
        <FlatList
            data={playlists}
            renderItem={renderPlaylistItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContentContainer}
        />
      )}

      <Portal>
        {/* Create Playlist Modal */}
        <Dialog visible={modalVisible} onDismiss={hideModal} style={{backgroundColor: theme.colors.elevation.level3}}>
          <Dialog.Title style={{color: theme.colors.onSurface}}>Create New Playlist</Dialog.Title>
          <Dialog.Content>
            <PaperTextInput
              label="Playlist Name"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              mode="outlined"
              autoFocus
              theme={paperTheme}
              style={{backgroundColor: theme.colors.surfaceVariant}}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideModal} textColor={theme.colors.secondary} disabled={isCreating}>Cancel</Button>
            <Button onPress={handleCreatePlaylist} loading={isCreating} disabled={isCreating} textColor={theme.colors.primary}>Create</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Rename Playlist Dialog */}
        {playlistToRename && (
          <Dialog visible={renameDialogVisible} onDismiss={hideRenameDialog} style={{backgroundColor: theme.colors.elevation.level3}}>
            <Dialog.Title style={{color: theme.colors.onSurface}}>Rename Playlist "{playlistToRename.name}"</Dialog.Title>
            <Dialog.Content>
              <PaperTextInput
                label="New Playlist Name"
                value={updatedPlaylistName}
                onChangeText={setUpdatedPlaylistName}
                mode="outlined"
                autoFocus
                theme={paperTheme}
                style={{backgroundColor: theme.colors.surfaceVariant}}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideRenameDialog} textColor={theme.colors.secondary} disabled={isRenaming}>Cancel</Button>
              <Button onPress={handleRenamePlaylist} loading={isRenaming} disabled={isRenaming} textColor={theme.colors.primary}>Rename</Button>
            </Dialog.Actions>
          </Dialog>
        )}
      </Portal>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primaryContainer }]}
        onPress={showModal}
        color={theme.colors.onPrimaryContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 80,
  },
  playlistItemCard: {
    marginVertical: 6,
    marginHorizontal: 8,
  },
  listItem: {
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  }
});

export default PlaylistsScreen;
