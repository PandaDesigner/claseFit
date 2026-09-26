import { StyleSheet, View } from 'react-native';
import { designTokens } from '../tokens';

export interface PixelPatternProps {
  readonly accent?: string;
  readonly opacity?: number;
}

export function PixelPattern({
  accent = designTokens.color.pixelAccent,
  opacity = 0.6,
}: PixelPatternProps) {
  const pixelStyle = (overrides: object) => [
    styles.pixel,
    { backgroundColor: accent, opacity },
    overrides,
  ];
  return (
    <View
      style={styles.container}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no"
    >
      <View style={pixelStyle(styles.pixelA)} />
      <View style={pixelStyle(styles.pixelB)} />
      <View style={pixelStyle(styles.pixelC)} />
      <View style={pixelStyle(styles.pixelD)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  pixel: {
    position: 'absolute',
  },
  pixelA: {
    width: 14,
    height: 14,
    top: 12,
    right: 14,
  },
  pixelB: {
    width: 10,
    height: 10,
    top: 26,
    right: 28,
  },
  pixelC: {
    width: 20,
    height: 20,
    top: 8,
    right: 48,
  },
  pixelD: {
    width: 8,
    height: 8,
    top: 30,
    right: 64,
  },
});