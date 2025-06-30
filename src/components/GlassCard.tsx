import React, { ReactNode } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../contexts/ThemeContext'; // Import useAppTheme

interface GlassCardProps {
  children: ReactNode;
  style?: object;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default'; // tint for BlurView
}

const GlassCard: React.FC<GlassCardProps> = ({ children, style, intensity = 70, tint = 'default' }) => {
  const { theme, isDarkTheme } = useAppTheme(); // Use our custom theme context

  // Use pre-defined glass colors from the theme
  const cardBackgroundColor = isDarkTheme ? theme.colors.glassBackgroundDark : theme.colors.glassBackgroundLight;
  const cardBorderColor = isDarkTheme ? theme.colors.glassBorderDark : theme.colors.glassBorderLight;

  // Determine BlurView tint based on the app's theme
  const effectiveTint = tint === 'default' ? (isDarkTheme ? 'dark' : 'light') : tint;

  return (
    <View style={[styles.outerContainer, style]}>
      {Platform.OS === 'ios' || Platform.OS === 'android' ? (
        <BlurView
          intensity={intensity}
          tint={effectiveTint}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        // Fallback for web: use the semi-transparent background color directly
        <View style={[StyleSheet.absoluteFill, { backgroundColor: cardBackgroundColor }]} />
      )}
      {/* The actual content container with border */}
      {/* For native, we apply the cardBackgroundColor to the innerContainer as well for a layered effect,
          making sure it's semi-transparent to allow the BlurView to still contribute.
          For web (fallback), this inner container should be transparent as the outer already has the color.
      */}
      <View style={[
          styles.innerContainer,
          {
            borderColor: cardBorderColor,
            backgroundColor: (Platform.OS === 'ios' || Platform.OS === 'android') ? cardBackgroundColor : 'transparent'
          }
      ]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 20, // Slightly more rounded
    overflow: 'hidden',
    shadowColor: '#000', // Shadow color can be themed too if needed
    shadowOffset: {
      width: 0,
      height: 6, // Slightly larger offset
    },
    shadowOpacity: 0.15, // Slightly more opacity
    shadowRadius: 12,   // More diffused
    elevation: 10,      // For Android
    position: 'relative',
  },
  innerContainer: {
    // backgroundColor is now set dynamically based on platform (for BlurView vs fallback)
    padding: 15,
    borderRadius: 20, // Match outerContainer
    borderWidth: 1.5, // Slightly thicker border
    // borderColor is set dynamically from theme
  },
});

export default GlassCard;