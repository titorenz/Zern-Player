# Zern Player Documentation

## Table of Contents
1.  [About Zern Player](#about-zern-player)
2.  [Features](#features)
3.  [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)
    *   [Running the App](#running-the-app)
4.  [Usage](#usage)
    *   [Navigating the App](#navigating-the-app)
    *   [Playing Music](#playing-music)
    *   [Managing Lyrics](#managing-lyrics)
    *   [Managing Playlists](#managing-playlists)
    *   [Song Library](#song-library)
    *   [Theme Toggle](#theme-toggle)
5.  [Building for Android (APK)](#building-for-android-apk)
    *   [Using EAS Build](#using-eas-build)
    *   [Classic Expo Build (`expo build:android`) - Deprecated](#classic-expo-build-expo-buildandroid---deprecated)
6.  [Project Structure](#project-structure)
7.  [Future Enhancements](#future-enhancements)

## About Zern Player
Zern Player is a modern and feature-rich music player application built with React Native and TypeScript. It features a glassmorphism UI, local lyrics management, playlist capabilities, and a themeable interface.

## Features
*   **Music Playback**: Standard controls (play, pause, skip, seek).
*   **Track Information**: Displays album art, title, and artist.
*   **Manual Lyrics Management**: Users can add, edit, and save lyrics for each track locally.
*   **Playlist Management**: Create, rename, delete playlists. Add/remove songs from playlists.
*   **Song Library**: View all available songs, search, and play.
*   **Background Playback**: Music continues playing when the app is in the background.
*   **Glassmorphism UI**: Modern UI with blurred transparent cards and soft shadows.
*   **Light/Dark Mode**: Toggle between light and dark themes.
*   **Built with Expo**: Utilizes the Expo framework for development and building.
*   **TypeScript**: Strongly-typed codebase for better maintainability.

## Getting Started

### Prerequisites
*   Node.js (LTS version recommended)
*   npm or Yarn
*   Expo CLI: `npm install -g expo-cli`
*   Git (for cloning the repository)
*   An Android device/emulator or iOS simulator/device (Expo Go app required for development)

### Installation
1.  Clone the repository (if applicable, otherwise skip if you have the code):
    ```bash
    git clone <repository-url>
    cd zern-player
    ```
2.  Install dependencies:
    ```bash
    npm install
    # OR
    yarn install
    ```

### Running the App
1.  Start the Metro bundler and development server:
    ```bash
    npx expo start
    ```
2.  This will open a page in your web browser with a QR code.
3.  **On your mobile device**:
    *   Install the "Expo Go" app from the Google Play Store or Apple App Store.
    *   Open Expo Go and scan the QR code from the browser.
    *   Alternatively, if your device is connected to the same Wi-Fi network, you can find the development server listed in Expo Go under the "Projects" tab or connect via LAN.
4.  The app will bundle and load on your device.

## Usage

### Navigating the App
The app uses a bottom tab navigator with the following main sections:
*   **Player**: The main music playback screen.
*   **Library**: Lists all available songs.
*   **Playlists**: Manage and view your playlists.

### Playing Music
*   **From Library**: Navigate to the "Library" tab, find a song, and tap it to start playing.
*   **From Playlist**: Navigate to the "Playlists" tab, select a playlist, then tap a song in the playlist.
*   **Controls**: The "Player" screen provides controls for play/pause, skipping tracks (if in a queue/playlist), seeking through the song using the slider, and toggling repeat mode.

### Managing Lyrics
1.  **Viewing Lyrics**: On the "Player" screen, below the playback controls, the lyrics for the current song are displayed.
2.  **Adding/Editing Lyrics**:
    *   On the "Player" screen, tap the "Edit" button in the Lyrics section.
    *   A modal will appear allowing you to type or paste lyrics for the current song.
    *   Tap "Save" to store the lyrics locally. If lyrics already exist, they will be overwritten.
    *   Tap "Cancel" to close the modal without saving.

### Managing Playlists
1.  **Viewing Playlists**: Navigate to the "Playlists" tab. All created playlists are listed here.
2.  **Creating a New Playlist**:
    *   On the "Playlists" tab, tap the floating action button (FAB) with a "+" icon.
    *   Enter a name for your new playlist in the dialog and tap "Create".
3.  **Viewing Playlist Details**: Tap on a playlist in the "Playlists" list to view its songs.
4.  **Adding Songs to a Playlist**:
    *   Navigate to the "Library" tab.
    *   Tap the "playlist-plus" icon next to the song you want to add.
    *   A dialog will appear listing your playlists. Select the playlist(s) you want to add the song to by tapping them (a checkmark will appear).
    *   Tap "Save" to add the song to the selected playlists.
5.  **Removing Songs from a Playlist**:
    *   Navigate to the "Playlists" tab and select the playlist.
    *   In the playlist detail view, tap the "minus-circle-outline" icon next to the song you want to remove.
    *   Confirm the removal in the alert dialog.
6.  **Renaming a Playlist**:
    *   On the "Playlists" tab, tap the "pencil" icon next to the playlist you want to rename.
    *   Enter the new name in the dialog and tap "Rename".
7.  **Deleting a Playlist**:
    *   On the "Playlists" tab, tap the "trash can" icon next to the playlist you want to delete.
    *   Confirm the deletion in the alert dialog. This action is irreversible.

### Song Library
*   Navigate to the "Library" tab to see all songs recognized by the app.
*   Use the search bar at the top to filter songs by title, artist, or album.
*   Tap a song to play it.
*   Tap the "playlist-plus" icon to add a song to one or more playlists.

### Theme Toggle
*   On the "Player" screen, find the theme toggle switch (usually near the top, labeled "Light Mode" / "Dark Mode").
*   Tap the switch to toggle between the app's light and dark themes. The UI will update immediately.

## Building for Android (APK)

Expo offers two main ways to build a standalone app: EAS Build (recommended) and the classic `expo build` (deprecated).

### Using EAS Build (Recommended)
EAS Build is Expo's modern cloud build service that provides more flexibility and power.

1.  **Install EAS CLI**:
    ```bash
    npm install -g eas-cli
    ```
2.  **Login to your Expo account**:
    ```bash
    eas login
    ```
3.  **Configure your project for EAS Build**:
    If you haven't already, create an `eas.json` file in your project root. You can do this by running:
    ```bash
    eas build:configure
    ```
    This will typically create a basic `eas.json` like:
    ```json
    {
      "cli": {
        "version": ">= 7.6.2"
      },
      "build": {
        "development": {
          "distribution": "internal",
          "android": {
            "gradleCommand": ":app:assembleDebug"
          },
          "ios": {
            "buildConfiguration": "Debug"
          }
        },
        "preview": {
          "distribution": "internal"
        },
        "production": {}
      },
      "submit": {
        "production": {}
      }
    }
    ```
    For an APK, you'll typically want a `production` or `preview` build.

4.  **Start the build**:
    To build an APK for Android:
    ```bash
    eas build -p android --profile preview
    # Or use --profile production for a production build
    ```
    EAS CLI will guide you through the process, which may include setting up an Android Keystore if you don't have one managed by Expo. EAS can generate one for you.

5.  **Monitor the build**:
    The build will run on Expo's servers. You can monitor its progress via the link provided in the terminal or on your [Expo dashboard](https://expo.dev/dashboard).

6.  **Download the APK**:
    Once the build is complete, you will get a link to download your APK. You can also find it on the build details page on the Expo dashboard.

### Signing Configuration
*   **EAS Build**: Manages your signing credentials (keystore for Android) automatically or allows you to upload your own. When you run `eas build` for the first time for Android, it will prompt you to either generate a new keystore or upload an existing one. This is securely stored with Expo.
*   **Classic `expo build`**: If you were using the deprecated `expo build:android`, Expo would also manage this. For local builds (not covered here), you'd manage this manually in your `android` directory.

### APK Retrieval Path
*   **EAS Build**: The downloadable APK link is provided at the end of the build process in your terminal and is also available on the build details page on your Expo dashboard.

### Classic Expo Build (`expo build:android`) - Deprecated
The `expo build:[android|ios]` commands are deprecated and will be removed in a future Expo SDK version. It's highly recommended to migrate to EAS Build.

## Project Structure
The project follows a standard React Native (Expo) structure:
```
zern-player/
├── src/
│   ├── assets/         # Static assets like images, fonts
│   ├── components/     # Reusable UI components (e.g., GlassCard, LyricsDisplay)
│   ├── contexts/       # React Context API providers (AudioPlayerContext, PlaylistContext, ThemeContext)
│   ├── hooks/          # Custom React Hooks (e.g., useAudioPlayer)
│   ├── navigation/     # Navigation setup (AppNavigator)
│   ├── screens/        # Top-level screen components (PlayerScreen, PlaylistsScreen, etc.)
│   ├── services/       # Modules for external interactions (lyricsService, playlistService)
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── App.tsx             # Main application entry point
├── DOCUMENTATION.md    # This file
├── babel.config.js     # Babel configuration
├── eas.json            # EAS Build configuration (if configured)
├── package.json        # Project dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## Future Enhancements
*   Stack navigation for playlist details.
*   User settings screen.
*   More advanced lyrics formatting (e.g., Markdown).
*   Import/Export lyrics as JSON.
*   Audio visualizer.
*   Fetching song metadata from local device storage.
*   More robust error handling and user feedback.
```
