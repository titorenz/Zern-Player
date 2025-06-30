import React, { createContext, useContext, ReactNode } from 'react';
import useAudioPlayer from '../hooks/useAudioPlayer';
import { Song, PlayerState } from '../types';

interface AudioPlayerContextType {
  playerState: PlayerState;
  loadSong: (song: Song) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  stop: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  toggleLooping: () => Promise<void>;
  // Add skipToNext, skipToPrevious later
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const audioPlayer = useAudioPlayer();

  return (
    <AudioPlayerContext.Provider value={audioPlayer}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudio = (): AudioPlayerContextType => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioPlayerProvider');
  }
  return context;
};
