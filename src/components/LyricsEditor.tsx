import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, TextInput, Button, useTheme, Text, ActivityIndicator } from 'react-native-paper';

interface LyricsEditorProps {
  visible: boolean;
  onDismiss: () => void;
  initialLyrics: string | null;
  onSave: (lyrics: string) => Promise<void>; // Make onSave async
  songTitle: string;
  isSaving: boolean; // Add isSaving prop
}

const LyricsEditor: React.FC<LyricsEditorProps> = ({
  visible,
  onDismiss,
  initialLyrics,
  onSave,
  songTitle,
  isSaving,
}) => {
  const theme = useTheme();
  const [lyricsText, setLyricsText] = useState(initialLyrics || '');

  useEffect(() => {
    setLyricsText(initialLyrics || '');
  }, [initialLyrics, visible]); // Reset text when modal becomes visible or initialLyrics change

  const handleSave = async () => {
    await onSave(lyricsText);
    // onDismiss(); // Keep modal open until saving is complete, then dismiss from parent
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.elevation.level3 }]}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Edit Lyrics for "{songTitle}"
          </Text>
          <TextInput
            label="Lyrics"
            value={lyricsText}
            onChangeText={setLyricsText}
            multiline
            numberOfLines={10}
            style={styles.textInput}
            mode="outlined"
            scrollEnabled={true} // Important for multiline TextInput within ScrollView
          />
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.button}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.button}
              loading={isSaving}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </View>
          {isSaving && <ActivityIndicator style={styles.savingIndicator} animating={true} />}
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%', // Ensure modal doesn't take full screen
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  textInput: {
    minHeight: 200, // Minimum height for text input
    maxHeight: 300, // Maximum height before scrolling within input
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  button: {
    marginLeft: 8,
  },
  savingIndicator: {
    marginTop: 10,
  }
});

export default LyricsEditor;
