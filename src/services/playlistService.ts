import AsyncStorage from '@react-native-async-storage/async-storage';
import { Playlist, Song, PlaylistSchema } from '../types'; // Assuming Song might be needed for full Playlist object construction
import uuid from 'react-native-uuid'; // For generating unique IDs

const PLAYLISTS_STORAGE_KEY = '@ZernPlayer_Playlists';
const SONGS_STORAGE_KEY = '@ZernPlayer_Songs'; // Assuming a separate place to store all songs metadata

// --- Song Management (basic example, might be more complex in reality) ---
// This is a simplified song storage. In a real app, songs might come from media library, server, etc.
export const saveSongMetadata = async (song: Song): Promise<void> => {
  try {
    const existingSongs = await getAllSongs();
    const songIndex = existingSongs.findIndex(s => s.id === song.id);
    if (songIndex > -1) {
      existingSongs[songIndex] = song;
    } else {
      existingSongs.push(song);
    }
    await AsyncStorage.setItem(SONGS_STORAGE_KEY, JSON.stringify(existingSongs));
  } catch (error) {
    console.error('Failed to save song metadata', error);
    throw error;
  }
};

export const getSongById = async (songId: string): Promise<Song | undefined> => {
  const allSongs = await getAllSongs();
  return allSongs.find(s => s.id === songId);
};

export const getAllSongs = async (): Promise<Song[]> => {
  try {
    const songsJson = await AsyncStorage.getItem(SONGS_STORAGE_KEY);
    return songsJson ? JSON.parse(songsJson) : [];
  } catch (error) {
    console.error('Failed to get all songs', error);
    return [];
  }
};


// --- Playlist Management ---
export const getAllPlaylists = async (): Promise<Playlist[]> => {
  try {
    const playlistsJson = await AsyncStorage.getItem(PLAYLISTS_STORAGE_KEY);
    const playlistSchemas: PlaylistSchema[] = playlistsJson ? JSON.parse(playlistsJson) : [];

    // Hydrate playlists with full song objects
    const hydratedPlaylists: Playlist[] = [];
    for (const schema of playlistSchemas) {
      const songs: Song[] = [];
      for (const songId of schema.songIds) {
        const song = await getSongById(songId);
        if (song) songs.push(song);
      }
      hydratedPlaylists.push({ ...schema, songs });
    }
    return hydratedPlaylists;
  } catch (error) {
    console.error('Failed to get all playlists', error);
    return [];
  }
};

export const getPlaylistById = async (playlistId: string): Promise<Playlist | null> => {
  try {
    const playlists = await getAllPlaylists(); // This already hydrates
    return playlists.find(p => p.id === playlistId) || null;
  } catch (error) {
    console.error(`Failed to get playlist ${playlistId}`, error);
    return null;
  }
};

export const createPlaylist = async (name: string, initialSongs: Song[] = []): Promise<Playlist> => {
  try {
    // Save metadata for any new songs added to this playlist
    for (const song of initialSongs) {
        await saveSongMetadata(song);
    }

    const newPlaylistSchema: PlaylistSchema = {
      id: uuid.v4() as string,
      name,
      songIds: initialSongs.map(s => s.id),
    };

    const existingPlaylistSchemas = await AsyncStorage.getItem(PLAYLISTS_STORAGE_KEY);
    const playlists: PlaylistSchema[] = existingPlaylistSchemas ? JSON.parse(existingPlaylistSchemas) : [];
    playlists.push(newPlaylistSchema);

    await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));

    // Return the hydrated playlist
    return { ...newPlaylistSchema, songs: initialSongs };
  } catch (error) {
    console.error('Failed to create playlist', error);
    throw error;
  }
};

export const deletePlaylist = async (playlistId: string): Promise<void> => {
  try {
    const playlistsJson = await AsyncStorage.getItem(PLAYLISTS_STORAGE_KEY);
    let playlists: PlaylistSchema[] = playlistsJson ? JSON.parse(playlistsJson) : [];
    playlists = playlists.filter(p => p.id !== playlistId);
    await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
  } catch (error) {
    console.error(`Failed to delete playlist ${playlistId}`, error);
    throw error;
  }
};

export const addSongToPlaylist = async (playlistId: string, song: Song): Promise<Playlist | null> => {
  try {
    await saveSongMetadata(song); // Ensure song metadata is saved

    const playlistsJson = await AsyncStorage.getItem(PLAYLISTS_STORAGE_KEY);
    const playlists: PlaylistSchema[] = playlistsJson ? JSON.parse(playlistsJson) : [];
    const playlistIndex = playlists.findIndex(p => p.id === playlistId);

    if (playlistIndex > -1) {
      if (!playlists[playlistIndex].songIds.includes(song.id)) {
        playlists[playlistIndex].songIds.push(song.id);
        await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
      }
      // Return the updated, hydrated playlist
      const updatedSchema = playlists[playlistIndex];
      const songs: Song[] = [];
      for (const songId of updatedSchema.songIds) {
        const s = await getSongById(songId);
        if (s) songs.push(s);
      }
      return { ...updatedSchema, songs };
    }
    return null; // Playlist not found
  } catch (error) {
    console.error(`Failed to add song ${song.id} to playlist ${playlistId}`, error);
    throw error;
  }
};

export const removeSongFromPlaylist = async (playlistId: string, songId: string): Promise<Playlist | null> => {
  try {
    const playlistsJson = await AsyncStorage.getItem(PLAYLISTS_STORAGE_KEY);
    const playlists: PlaylistSchema[] = playlistsJson ? JSON.parse(playlistsJson) : [];
    const playlistIndex = playlists.findIndex(p => p.id === playlistId);

    if (playlistIndex > -1) {
      playlists[playlistIndex].songIds = playlists[playlistIndex].songIds.filter(id => id !== songId);
      await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));

      // Return the updated, hydrated playlist
      const updatedSchema = playlists[playlistIndex];
      const songs: Song[] = [];
      for (const id of updatedSchema.songIds) {
        const s = await getSongById(id);
        if (s) songs.push(s);
      }
      return { ...updatedSchema, songs };
    }
    return null; // Playlist not found
  } catch (error) {
    console.error(`Failed to remove song ${songId} from playlist ${playlistId}`, error);
    throw error;
  }
};

export const renamePlaylist = async (playlistId: string, newName: string): Promise<Playlist | null> => {
    try {
        const playlistsJson = await AsyncStorage.getItem(PLAYLISTS_STORAGE_KEY);
        const playlists: PlaylistSchema[] = playlistsJson ? JSON.parse(playlistsJson) : [];
        const playlistIndex = playlists.findIndex(p => p.id === playlistId);

        if (playlistIndex > -1) {
            playlists[playlistIndex].name = newName;
            await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));

            // Return the updated, hydrated playlist
            const updatedSchema = playlists[playlistIndex];
            const songs: Song[] = [];
            for (const songId of updatedSchema.songIds) {
                const s = await getSongById(songId);
                if (s) songs.push(s);
            }
            return { ...updatedSchema, songs };
        }
        return null; // Playlist not found
    } catch (error) {
        console.error(`Failed to rename playlist ${playlistId}`, error);
        throw error;
    }
};

// Utility to clear all playlists and songs (for development/testing)
export const DEV_ONLY_clearAllPlaylistsAndSongs = async () => {
  if (process.env.NODE_ENV === 'development' || __DEV__) {
    await AsyncStorage.removeItem(PLAYLISTS_STORAGE_KEY);
    await AsyncStorage.removeItem(SONGS_STORAGE_KEY);
    console.log('DEV: Cleared all playlists and songs from AsyncStorage.');
  }
};
