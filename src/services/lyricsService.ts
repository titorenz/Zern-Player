import * as FileSystem from 'expo-file-system';
import { Lyrics, Song } from '../types';

const LYRICS_DIR = `${FileSystem.documentDirectory}lyrics/`;

// Ensure lyrics directory exists
const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(LYRICS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(LYRICS_DIR, { intermediates: true });
  }
};

const getLyricsFilePath = (songId: string) => {
  // Sanitize songId to be a valid filename (e.g., replace non-alphanumeric chars)
  const safeSongId = songId.replace(/[^a-zA-Z0-9_.-]/g, '_');
  return `${LYRICS_DIR}${safeSongId}.json`;
};

export const saveLyrics = async (songId: string, text: string): Promise<void> => {
  await ensureDirExists();
  const filePath = getLyricsFilePath(songId);
  const lyricsData: Lyrics = { songId, text };
  try {
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(lyricsData));
    console.log(`Lyrics saved for song ${songId} at ${filePath}`);
  } catch (error) {
    console.error(`Error saving lyrics for song ${songId}:`, error);
    throw error; // Re-throw to be handled by the caller
  }
};

export const loadLyrics = async (songId: string): Promise<Lyrics | null> => {
  await ensureDirExists(); // Good practice, though mostly for writing
  const filePath = getLyricsFilePath(songId);
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      console.log(`No lyrics file found for song ${songId}`);
      return null;
    }
    const content = await FileSystem.readAsStringAsync(filePath);
    const lyricsData = JSON.parse(content) as Lyrics;
    console.log(`Lyrics loaded for song ${songId}`);
    return lyricsData;
  } catch (error) {
    console.error(`Error loading lyrics for song ${songId}:`, error);
    // If parsing fails or other read error, treat as no lyrics found or handle appropriately
    return null;
  }
};

export const deleteLyrics = async (songId: string): Promise<void> => {
  await ensureDirExists();
  const filePath = getLyricsFilePath(songId);
  try {
    await FileSystem.deleteAsync(filePath, { idempotent: true }); // idempotent means no error if file doesn't exist
    console.log(`Lyrics deleted for song ${songId}`);
  } catch (error) {
    console.error(`Error deleting lyrics for song ${songId}:`, error);
    throw error;
  }
};

// Optional: Function to get all lyrics (e.g., for export)
export const getAllLyrics = async (): Promise<Lyrics[]> => {
  await ensureDirExists();
  try {
    const fileNames = await FileSystem.readDirectoryAsync(LYRICS_DIR);
    const allLyrics: Lyrics[] = [];
    for (const fileName of fileNames) {
      if (fileName.endsWith('.json')) {
        const content = await FileSystem.readAsStringAsync(LYRICS_DIR + fileName);
        try {
          allLyrics.push(JSON.parse(content) as Lyrics);
        } catch (parseError) {
          console.warn(`Could not parse lyrics file: ${fileName}`, parseError);
        }
      }
    }
    return allLyrics;
  } catch (error) {
    console.error("Error reading all lyrics:", error);
    return [];
  }
};
