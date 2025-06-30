import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme, ActivityIndicator, Paragraph } from 'react-native-paper';

interface LyricsDisplayProps {
  lyrics: string | null;
  isLoading: boolean;
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ lyrics, isLoading }) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator animating={true} color={theme.colors.primary} />
        <Paragraph style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>Loading lyrics...</Paragraph>
      </View>
    );
  }

  if (!lyrics) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>No lyrics available for this song.</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContentContainer}>
        <Text style={[styles.lyricsText, { color: theme.colors.onSurface }]}>
          {lyrics}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200, // Fixed height for the display area
    paddingVertical: 8, // Add some padding if Card's content padding is removed
    // backgroundColor: 'transparent', // Ensure this container itself doesn't block the GlassCard blur
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    maxHeight: 180,
  },
  scrollContentContainer: {
    paddingBottom: 10,
  },
  lyricsText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 5, // Add some horizontal padding if Card is removed
  },
});

export default LyricsDisplay;
