import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { designTokens } from '../tokens';
import { messages } from '@features/class-booking/presentation/copy/messages';

export interface BrandHeaderProps {
  readonly tagline?: string;
}

export function BrandHeader(_props: BrandHeaderProps = {}) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea} accessibilityRole="header">
      <View style={styles.container}>
        <View style={styles.brandColumn}>
          <Text style={styles.wordmark}>
            <Text style={styles.wordmarkLight}>Clase</Text>
            <Text style={styles.wordmarkItalic}>Fit</Text>
          </Text>
          <Text style={styles.venue}>{messages.brandVenue}</Text>
        </View>
        <View style={styles.rightCluster}>
          <View style={styles.taglineColumn}>
            <Text style={styles.tagline}>{messages.taglineLine1}</Text>
            <Text style={styles.tagline}>{messages.taglineLine2}</Text>
            <Text style={styles.tagline}>{messages.taglineLine3}</Text>
          </View>
          <View
            style={styles.pixelMark}
            accessible={false}
            importantForAccessibility="no"
          >
            <View style={[styles.pixel, styles.pixelA]} />
            <View style={[styles.pixel, styles.pixelB]} />
            <View style={[styles.pixel, styles.pixelC]} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: designTokens.color.background,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: designTokens.spacing.lg,
    paddingTop: designTokens.spacing.xs,
    paddingBottom: designTokens.spacing.sm,
    gap: designTokens.spacing.md,
  },
  brandColumn: {
    flexDirection: 'column',
    flexShrink: 0,
    gap: 2,
  },
  wordmark: {
    fontSize: 26,
    fontWeight: '800',
    color: designTokens.color.textPrimary,
    letterSpacing: -0.6,
    lineHeight: 30,
  },
  wordmarkLight: {
    fontWeight: '600',
  },
  wordmarkItalic: {
    fontStyle: 'italic',
    fontWeight: '800',
  },
  venue: {
    fontSize: designTokens.fontSize.label,
    fontWeight: '500',
    color: designTokens.color.textSecondary,
    letterSpacing: 0.1,
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: designTokens.spacing.sm,
    flexShrink: 1,
    paddingTop: 2,
  },
  taglineColumn: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 1,
  },
  tagline: {
    fontSize: designTokens.fontSize.eyebrow,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: designTokens.color.textSecondary,
    lineHeight: 13,
    textAlign: 'right',
  },
  pixelMark: {
    width: 30,
    height: 30,
  },
  pixel: {
    position: 'absolute',
    backgroundColor: designTokens.color.pixelAccent,
    opacity: 0.6,
    borderRadius: 1,
  },
  pixelA: {
    width: 9,
    height: 9,
    top: 0,
    right: 8,
  },
  pixelB: {
    width: 14,
    height: 14,
    top: 6,
    right: 0,
  },
  pixelC: {
    width: 6,
    height: 6,
    top: 22,
    right: 16,
  },
});