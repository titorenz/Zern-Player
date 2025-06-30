import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView as RNScrollView, ImageBackground, Switch } from 'react-native';
import { useAudio } from '../contexts/AudioPlayerContext';
import { usePlaylists } from '../contexts/PlaylistContext';
import { Song } from '../types';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import { Button as PaperButton, Snackbar } from 'react-native-paper'; // Removed Slider from here
import { useAppTheme } from '../contexts/ThemeContext'; // Import useAppTheme
import LyricsDisplay from '../components/LyricsDisplay';
import LyricsEditor from '../components/LyricsEditor';
import GlassCard from '../components/GlassCard';
import * as LyricsService from '../services/lyricsService';
import * as PlaylistService from '../services/playlistService';

const { width } = Dimensions.get('window');
const ALBUM_ART_SIZE = width * 0.6;
const BACKGROUND_IMAGE_URL = 'https://via.placeholder.com/800x1200/777777/FFFFFF?text=Background';

const dummySongData: Omit<Song, 'id' | 'duration'> = {
  title: 'Sample Song Title',
  artist: 'Sample Artist',
  album: 'Sample Album',
  uri: 'http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
  albumArtUri: 'https://via.placeholder.com/300/1DB954/FFFFFF?text=ZernPlayer',
};


const PlayerScreen = () => {
  const { playerState, play, pause, seek, toggleLooping } = useAudio();
  const { currentSong, isPlaying, playbackPosition, playbackDuration, isLooping } = playerState;
  const { playSongFromQueue, playNextSong, playPreviousSong, currentQueue, currentSongIndex, createPlaylist, playlists, loadPlaylists } = usePlaylists();

  const { theme, isDarkTheme, toggleTheme } = useAppTheme(); // Use AppTheme context

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [isLyricsEditorVisible, setIsLyricsEditorVisible] = useState(false);
  const [isSavingLyrics, setIsSavingLyrics] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const setupInitialSong = async () => {
        if (!currentSong && currentQueue.length === 0) {
            let songToPlay = await PlaylistService.getSongById('__default_dummy_song__');
            if (!songToPlay) {
                songToPlay = { id: '__default_dummy_song__', ...dummySongData, duration: 180 };
                await PlaylistService.saveSongMetadata(songToPlay);
                if (playlists.length === 0) {
                    await createPlaylist("My First Playlist", [songToPlay]);
                    await loadPlaylists();
                }
            }
            if (playerState.currentSong?.id !== songToPlay.id) {
                 playSongFromQueue(songToPlay, [songToPlay], 0);
            }
        }
    };
    setupInitialSong();
  }, [currentSong, currentQueue, playSongFromQueue, playerState.currentSong, playlists, createPlaylist, loadPlaylists]);

  const fetchLyrics = useCallback(async () => {
    if (currentSong) {
      setIsLoadingLyrics(true);
      try {
        const loadedLyrics = await LyricsService.loadLyrics(currentSong.id);
        setLyrics(loadedLyrics ? loadedLyrics.text : null);
      } catch (error) {
        console.error("Failed to load lyrics:", error);
        setSnackbarMessage('Failed to load lyrics.'); setSnackbarVisible(true); setLyrics(null);
      } finally { setIsLoadingLyrics(false); }
    } else { setLyrics(null); }
  }, [currentSong]);

  useEffect(() => { fetchLyrics(); }, [fetchLyrics]);
  useEffect(() => { if (!isSeeking) { setSeekValue(playbackPosition); } }, [playbackPosition, isSeeking]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === undefined) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeekStart = () => setIsSeeking(true);
  const handleSeekComplete = (value: number) => { seek(value); setIsSeeking(false); };

  const handleSaveLyrics = async (newLyricsText: string) => {
    if (currentSong) {
      setIsSavingLyrics(true);
      try {
        await LyricsService.saveLyrics(currentSong.id, newLyricsText);
        setLyrics(newLyricsText); setSnackbarMessage('Lyrics saved successfully!'); setIsLyricsEditorVisible(false);
      } catch (error) { console.error("Failed to save lyrics:", error); setSnackbarMessage('Failed to save lyrics.');
      } finally { setIsSavingLyrics(false); setSnackbarVisible(true); }
    }
  };

  const canSkipPrevious = currentQueue.length > 0 && (currentSongIndex !== null && currentSongIndex > 0);
  const canSkipNext = currentQueue.length > 0 && (currentSongIndex !== null && currentSongIndex < currentQueue.length - 1);

  // Determine background image: Use current song's album art if available, otherwise fallback.
  // The blurRadius on ImageBackground will make it a suitable backdrop.
  const dynamicBackgroundImage = currentSong?.albumArtUri || BACKGROUND_IMAGE_URL;


  return (
    <ImageBackground source={{ uri: dynamicBackgroundImage }} style={styles.backgroundImage} blurRadius={30}>
      <RNScrollView style={styles.outerContainer} contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.playerContent}>

          <View style={styles.headerControls}>
            <Text style={[styles.themeToggleText, {color: theme.colors.onSurface}]}>{isDarkTheme ? "Dark Mode" : "Light Mode"}</Text>
            <Switch
                trackColor={{ false: "#767577", true: theme.colors.primaryContainer }}
                thumbColor={isDarkTheme ? theme.colors.primary : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleTheme}
                value={isDarkTheme}
            />
          </View>

          <GlassCard style={styles.albumArtCard}>
            <Image
              source={{ uri: currentSong?.albumArtUri || 'https://via.placeholder.com/300/1DB954/FFFFFF?text=ZernPlayer' }}
              style={styles.albumArt}
            />
          </GlassCard>

          <GlassCard style={styles.songInfoCard}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={1} ellipsizeMode="tail">{currentSong?.title || 'No song loaded'}</Text>
            <Text style={[styles.artist, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1} ellipsizeMode="tail">{currentSong?.artist || '---'}</Text>
          </GlassCard>

          <GlassCard style={styles.scrubberCard}>
            <View style={styles.scrubberContainer}>
                <Text style={[styles.timeText, { color: theme.colors.onSurfaceVariant }]}>{formatTime(seekValue)}</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={playbackDuration || 0}
                    value={seekValue}
                    onValueChange={setSeekValue}
                    onSlidingStart={handleSeekStart}
                    onSlidingComplete={handleSeekComplete}
                    thumbTintColor={theme.colors.primary}
                    minimumTrackTintColor={theme.colors.primary}
                    maximumTrackTintColor={theme.colors.surfaceVariant}
                    disabled={!currentSong || playbackDuration === 0}
                />
                <Text style={[styles.timeText, { color: theme.colors.onSurfaceVariant }]}>{formatTime(playbackDuration)}</Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.controlsCard}>
            <View style={styles.controlsContainer}>
                <TouchableOpacity onPress={toggleLooping} style={styles.controlButton}>
                    <MaterialCommunityIcons name={isLooping ? "repeat-once" : "repeat"} size={28} color={isLooping ? theme.colors.primary : theme.colors.onSurface} />
                </TouchableOpacity>
                <TouchableOpacity onPress={playPreviousSong} style={styles.controlButton} disabled={!currentSong || !canSkipPrevious}>
                    <MaterialCommunityIcons name="skip-previous" size={36} color={(!currentSong || !canSkipPrevious) ? ((theme.colors as any).disabled || '#aaa') : theme.colors.onSurface} />
                </TouchableOpacity>
                <TouchableOpacity onPress={isPlaying ? pause : play} style={[styles.controlButton, styles.playButton]} disabled={!currentSong}>
                    <MaterialCommunityIcons name={isPlaying ? "pause-circle" : "play-circle"} size={64} color={!currentSong ? ((theme.colors as any).disabled || '#aaa') : theme.colors.onSurface} />
                </TouchableOpacity>
                <TouchableOpacity onPress={playNextSong} style={styles.controlButton} disabled={!currentSong || !canSkipNext}>
                    <MaterialCommunityIcons name="skip-next" size={36} color={(!currentSong || !canSkipNext) ? ((theme.colors as any).disabled || '#aaa') : theme.colors.onSurface} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { /* TODO: Shuffle */ }} style={styles.controlButton}>
                    <MaterialCommunityIcons name="shuffle-variant" size={28} color={theme.colors.onSurface} />
                </TouchableOpacity>
            </View>
          </GlassCard>

          <View style={styles.lyricsSection}>
            <GlassCard style={styles.lyricsCard}>
                <View style={styles.lyricsHeader}>
                    <Text style={[styles.lyricsTitle, {color: theme.colors.onSurface}]}>Lyrics</Text>
                    <PaperButton
                    icon="pencil"
                    mode="text"
                    onPress={() => setIsLyricsEditorVisible(true)}
                    disabled={!currentSong || isSavingLyrics}
                    compact
                    textColor={theme.colors.primary}
                    >
                    Edit
                    </PaperButton>
                </View>
                <LyricsDisplay lyrics={lyrics} isLoading={isLoadingLyrics} />
            </GlassCard>
          </View>

          {currentSong && (
            <LyricsEditor
              visible={isLyricsEditorVisible}
              onDismiss={() => setIsLyricsEditorVisible(false)}
              initialLyrics={lyrics}
              onSave={handleSaveLyrics}
              songTitle={currentSong.title}
              isSaving={isSavingLyrics}
            />
          )}
        </View>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={{bottom: 30}}
        >
          {snackbarMessage}
        </Snackbar>
      </RNScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  outerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  playerContent: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20, // Adjusted padding
    paddingHorizontal: 20,
    justifyContent: 'space-between', // Changed to space-between
  },
  headerControls: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'flex-end', // Align to the right
    alignItems: 'center',
    paddingVertical: 10, // Add some padding
    // marginBottom: 5, // Space it out from album art
  },
  themeToggleText: {
    marginRight: 8,
    fontSize: 14,
  },
  albumArtCard: {
    width: ALBUM_ART_SIZE + 20,
    height: ALBUM_ART_SIZE + 20,
    padding: 0,
    marginBottom: 15, // Adjusted margin
  },
  albumArt: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  songInfoCard: {
    width: '90%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 3,
  },
  artist: {
    fontSize: 16,
    textAlign: 'center',
  },
  scrubberCard: {
    width: '90%',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15, // Adjusted margin
  },
  scrubberContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    minWidth: 35,
    textAlign: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 5,
  },
  controlsCard: {
    width: '90%',
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 15, // Adjusted margin
  },
  controlsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
  },
  lyricsSection: {
    width: '90%',
    marginBottom: 10, // Ensure space for snackbar if it appears at bottom
  },
  lyricsCard: {
  },
  lyricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lyricsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default PlayerScreen;
