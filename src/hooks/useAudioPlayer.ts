import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Song, PlayerState } from '../types';

const useAudioPlayer = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    playbackPosition: 0,
    playbackDuration: 0,
    volume: 1.0,
    isLooping: false,
    isShuffling: false,
  });

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  const loadSong = async (song: Song) => {
    if (sound) {
      await sound.unloadAsync();
    }
    try {
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: song.uri },
        { shouldPlay: false }
      );
      setSound(newSound);
      if (status.isLoaded) {
        setPlayerState(prev => ({
          ...prev,
          currentSong: song,
          playbackDuration: status.durationMillis ? status.durationMillis / 1000 : 0,
          playbackPosition: 0,
          isPlaying: false,
        }));
        newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      }
    } catch (error) {
      console.error("Error loading song:", error);
      // Handle error (e.g., show a toast message)
    }
  };

  const onPlaybackStatusUpdate = (status: Audio.PlaybackStatus) => {
    if (status.isLoaded) {
      setPlayerState(prev => ({
        ...prev,
        playbackPosition: status.positionMillis / 1000,
        playbackDuration: status.durationMillis ? status.durationMillis / 1000 : prev.playbackDuration,
        isPlaying: status.isPlaying,
        isLooping: status.isLooping,
        volume: status.volume,
      }));
    } else if (status.error) {
      console.error(`Playback Error: ${status.error}`);
      // Handle playback error
    }
  };

  const play = async () => {
    if (sound && playerState.currentSong) {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && !status.isPlaying) {
          await sound.playAsync();
        }
      } catch (error) {
        console.error("Error playing sound:", error);
      }
    }
  };

  const pause = async () => {
    if (sound) {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await sound.pauseAsync();
        }
      } catch (error) {
        console.error("Error pausing sound:", error);
      }
    }
  };

  const seek = async (position: number) => { // position in seconds
    if (sound) {
      try {
        await sound.setPositionAsync(position * 1000);
      } catch (error) {
        console.error("Error seeking sound:", error);
      }
    }
  };

  const setVolume = async (volume: number) => { // 0.0 to 1.0
    if (sound) {
      try {
        await sound.setVolumeAsync(volume);
      } catch (error) {
        console.error("Error setting volume:", error);
      }
    }
  };

  const toggleLooping = async () => {
    if (sound) {
      try {
        const currentLooping = playerState.isLooping;
        await sound.setIsLoopingAsync(!currentLooping);
        // No need to setPlayerState here, onPlaybackStatusUpdate will handle it
      } catch (error) {
        console.error("Error toggling looping:", error);
      }
    }
  };


  // Skip functions would typically require playlist context,
  // so they might be implemented or enhanced later.
  // For now, a simple unload:
  const stop = async () => {
    if (sound) {
      await sound.unloadAsync();
      setPlayerState(prev => ({
        ...prev,
        currentSong: null,
        isPlaying: false,
        playbackPosition: 0,
      }));
      setSound(null);
    }
  };


  return {
    playerState,
    loadSong,
    play,
    pause,
    seek,
    stop, // Placeholder for skip/stop
    setVolume,
    toggleLooping,
    // TODO: Implement skipToNext, skipToPrevious when playlist is available
  };
};

export default useAudioPlayer;
