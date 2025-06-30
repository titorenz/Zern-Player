export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  uri: string; // local file URI or remote URL
  albumArtUri?: string;
}

export interface Lyrics {
  songId: string;
  text: string;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  playbackPosition: number; // in seconds
  playbackDuration: number; // in seconds
  volume: number; // 0.0 to 1.0
  isLooping: boolean;
  isShuffling: boolean;
}

// Storage Schemas (examples, can be adjusted based on storage solution)
export interface SongSchema {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  uri: string;
  albumArtUri?: string;
}

export interface LyricsSchema {
  songId: string;
  text: string;
}

export interface PlaylistSchema {
  id: string;
  name: string;
  songIds: string[]; // Store only song IDs to avoid data duplication
}
