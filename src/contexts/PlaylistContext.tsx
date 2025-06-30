import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Playlist, Song } from '../types';
import * as PlaylistService from '../services/playlistService';
import { useAudio } from './AudioPlayerContext'; // To control playback

interface PlaylistContextType {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  currentQueue: Song[];
  currentSongIndex: number | null;
  createPlaylist: (name: string, initialSongs?: Song[]) => Promise<Playlist | undefined>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, song: Song) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
  renamePlaylist: (playlistId: string, newName: string) => Promise<void>;
  loadPlaylists: () => Promise<void>;
  playSongFromQueue: (song: Song, queue?: Song[], startIndex?: number) => void;
  playNextSong: () => void;
  playPreviousSong: () => void;
  addSongToQueue: (song: Song) => void;
  removeSongFromQueue: (songId: string) => void;
  clearQueue: () => void;
  // TODO: Reorder queue, shuffle queue
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const PlaylistProvider = ({ children }: { children: ReactNode }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null); // Might be the source of the currentQueue
  const [currentQueue, setCurrentQueue] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null);

  const { loadSong, playerState, play } = useAudio();

  const loadPlaylists = useCallback(async () => {
    const fetchedPlaylists = await PlaylistService.getAllPlaylists();
    setPlaylists(fetchedPlaylists);
  }, []);

  useEffect(() => {
    loadPlaylists();
    // PlaylistService.DEV_ONLY_clearAllPlaylistsAndSongs(); // For testing
  }, [loadPlaylists]);

  // Auto-play next song when current one finishes (if not looping)
  useEffect(() => {
    if (
      playerState.isPlaying &&
      playerState.playbackPosition > 0 &&
      playerState.playbackDuration > 0 &&
      playerState.playbackPosition >= playerState.playbackDuration - 0.5 && // check near end
      !playerState.isLooping
    ) {
      playNextSong();
    }
  }, [playerState.playbackPosition, playerState.playbackDuration, playerState.isPlaying, playerState.isLooping]);


  const createPlaylistHandler = async (name: string, initialSongs: Song[] = []) => {
    try {
      const newPlaylist = await PlaylistService.createPlaylist(name, initialSongs);
      setPlaylists(prev => [...prev, newPlaylist]);
      return newPlaylist;
    } catch (error) {
      console.error("Error creating playlist in context:", error);
    }
  };

  const deletePlaylistHandler = async (playlistId: string) => {
    try {
      await PlaylistService.deletePlaylist(playlistId);
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
      if (currentPlaylist?.id === playlistId) {
        setCurrentPlaylist(null); // Or set to a default/first playlist
      }
    } catch (error) {
      console.error("Error deleting playlist in context:", error);
    }
  };

  const renamePlaylistHandler = async (playlistId: string, newName: string) => {
    try {
      const updatedPlaylist = await PlaylistService.renamePlaylist(playlistId, newName);
      if (updatedPlaylist) {
        setPlaylists(prev => prev.map(p => p.id === playlistId ? updatedPlaylist : p));
        if (currentPlaylist?.id === playlistId) {
          setCurrentPlaylist(updatedPlaylist);
        }
      }
    } catch (error) {
      console.error("Error renaming playlist in context:", error);
    }
  };

  const addSongToPlaylistHandler = async (playlistId: string, song: Song) => {
     try {
      const updatedPlaylist = await PlaylistService.addSongToPlaylist(playlistId, song);
      if (updatedPlaylist) {
        setPlaylists(prev => prev.map(p => p.id === playlistId ? updatedPlaylist : p));
        if (currentPlaylist?.id === playlistId) {
          setCurrentPlaylist(updatedPlaylist); // Update current playlist if it's the one being modified
        }
      }
    } catch (error) {
      console.error("Error adding song to playlist in context:", error);
    }
  };

  const removeSongFromPlaylistHandler = async (playlistId: string, songId: string) => {
    try {
      const updatedPlaylist = await PlaylistService.removeSongFromPlaylist(playlistId, songId);
      if (updatedPlaylist) {
        setPlaylists(prev => prev.map(p => p.id === playlistId ? updatedPlaylist : p));
        if (currentPlaylist?.id === playlistId) {
          setCurrentPlaylist(updatedPlaylist);
        }
        // Also remove from current playing queue if it's there
        if (currentQueue.find(s => s.id === songId) && currentPlaylist?.id === playlistId) {
            const songToRemove = currentQueue.find(s => s.id === songId);
            if (songToRemove) removeFromQueueHandler(songToRemove.id);
        }
      }
    } catch (error) {
      console.error("Error removing song from playlist in context:", error);
    }
  };

  const playSongFromQueue = async (song: Song, queue?: Song[], startIndex?: number) => {
    if (queue) {
      setCurrentQueue(queue);
      // If currentPlaylist is not set, or different from the source of this queue, update/clear it
      // This logic might need refinement based on how playlists vs arbitrary queues are handled
    }
    const indexInQueue = queue ? (startIndex !== undefined ? startIndex : queue.findIndex(s => s.id === song.id)) : currentQueue.findIndex(s => s.id === song.id);

    if (indexInQueue !== -1) {
      setCurrentSongIndex(indexInQueue);
      await loadSong(song); // from useAudio
      await play(); // from useAudio
    } else if (queue === undefined && !currentQueue.find(s=> s.id === song.id)) {
        // Song is not in current queue, play it as a single track
        setCurrentQueue([song]);
        setCurrentSongIndex(0);
        await loadSong(song);
        await play();
    }
  };

  const playNextSong = async () => {
    if (currentQueue.length > 0 && currentSongIndex !== null) {
      const nextIndex = (currentSongIndex + 1) % currentQueue.length;
      // Add logic for shuffle if playerState.isShuffling is true
      // For now, simple next:
      if (nextIndex !== currentSongIndex || currentQueue.length === 1) { // Play if different song or only one song
        const nextSong = currentQueue[nextIndex];
        await loadSong(nextSong);
        await play();
        setCurrentSongIndex(nextIndex);
      } else if (nextIndex === currentSongIndex && !playerState.isLooping) {
        // Reached end of non-looping queue (and not shuffling to same song)
        // Optionally stop or handle end of queue
      }
    }
  };

  const playPreviousSong = async () => {
    if (currentQueue.length > 0 && currentSongIndex !== null) {
      const prevIndex = (currentSongIndex - 1 + currentQueue.length) % currentQueue.length;
      // Add logic for shuffle if playerState.isShuffling is true
      // For now, simple previous:
      if (prevIndex !== currentSongIndex || currentQueue.length === 1) {
        const prevSong = currentQueue[prevIndex];
        await loadSong(prevSong);
        await play();
        setCurrentSongIndex(prevIndex);
      }
    }
  };

  const addSongToQueueHandler = (song: Song) => {
    // Avoid duplicates, or decide if duplicates are allowed
    if (!currentQueue.find(s => s.id === song.id)) {
      setCurrentQueue(prev => [...prev, song]);
    }
  };

  const removeFromQueueHandler = (songId: string) => {
    setCurrentQueue(prev => prev.filter(s => s.id !== songId));
    // Adjust currentSongIndex if the removed song was before or at the current index
    if (playerState.currentSong?.id === songId) {
        // If current song is removed, play next or stop. For now, just clear index.
        // More robust: playNextSong() or stop().
        setCurrentSongIndex(null);
    } else if (currentSongIndex !== null) {
        const removedSongOriginalIndex = currentQueue.findIndex(s => s.id === songId);
        if (removedSongOriginalIndex !== -1 && removedSongOriginalIndex < currentSongIndex) {
            setCurrentSongIndex(prevIdx => prevIdx !== null ? prevIdx -1 : null);
        }
    }
  };

  const clearQueueHandler = () => {
    setCurrentQueue([]);
    setCurrentSongIndex(null);
    // Optionally stop current playback: audioContext.stop();
  };


  return (
    <PlaylistContext.Provider value={{
      playlists,
      currentPlaylist,
      currentQueue,
      currentSongIndex,
      createPlaylist: createPlaylistHandler,
      deletePlaylist: deletePlaylistHandler,
      addSongToPlaylist: addSongToPlaylistHandler,
      removeSongFromPlaylist: removeSongFromPlaylistHandler,
      renamePlaylist: renamePlaylistHandler,
      loadPlaylists,
      playSongFromQueue,
      playNextSong,
      playPreviousSong,
      addSongToQueue: addSongToQueueHandler,
      removeSongFromQueue: removeFromQueueHandler,
      clearQueue: clearQueueHandler,
    }}>
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylists = (): PlaylistContextType => {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error('usePlaylists must be used within a PlaylistProvider');
  }
  return context;
};
