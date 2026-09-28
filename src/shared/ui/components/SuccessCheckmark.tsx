import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { designTokens } from '../tokens';

export interface SuccessCheckmarkProps {
  readonly visible: boolean;
  readonly onDismiss: () => void;
  readonly label: string;
  readonly durationMs?: number;
  readonly testID?: string;
  readonly children?: ReactNode;
}

/**
 * Transient, auto-dismissing animated checkmark overlay.
 *
 * Used as the post-action feedback surface for the booking flow (FR-05)
 * and the cancellation flow. Lives in `shared/ui` as a reusable primitive
 * with no domain knowledge.
 *
 * Rendered as an `Animated.View` inside the screen's render tree — NOT a
 * React Native platform `<Modal>` — so that when React Navigation hides
 * the screen, the checkmark hides with it (no native-modal stacking
 * across tabs).
 *
 * @param visible   When `true`, the overlay animates in and auto-dismisses.
 * @param onDismiss Called when the overlay finishes its visible window.
 * @param label     The text shown below the checkmark glyph (e.g. FR-05 literal).
 * @param durationMs Auto-dismiss delay in ms. Default 2500.
 */
export function SuccessCheckmark({
  visible,
  onDismiss,
  label,
  durationMs = 2500,
  testID,
}: SuccessCheckmarkProps) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.85));
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep latest onDismiss in a ref so the timer callback doesn't capture a stale closure
  // and so we don't have to re-arm the timer on every render.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const clearTimer = useCallback(() => {
    if (dismissTimer.current !== null) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      clearTimer();
      // Fade out, then settle.
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
      return undefined;
    }

    // Fade in + spring-scale to draw the eye.
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    clearTimer();
    const timer = setTimeout(() => {
      // Reset the ref so a stale callback can't fire after a fresh unmount path.
      dismissTimer.current = null;
      onDismissRef.current();
    }, durationMs);
    dismissTimer.current = timer;

    return () => {
      clearTimeout(timer);
      dismissTimer.current = null;
    };
  }, [visible, durationMs, opacity, scale, clearTimer]);

  if (!visible) return null;

  return (
    <Animated.View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      testID={testID}
      pointerEvents="none"
      style={[styles.wrapper, { opacity, transform: [{ scale }] }]}
    >
      <View style={styles.card}>
        <Text style={styles.glyph} testID={testID ? `${testID}-glyph` : undefined}>
          ✓
        </Text>
        <Text style={styles.label} testID={testID ? `${testID}-label` : undefined}>
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: '30%',
    left: designTokens.spacing.lg,
    right: designTokens.spacing.lg,
    alignItems: 'center',
    zIndex: 10,
  },
  card: {
    backgroundColor: designTokens.color.cardSurface,
    borderRadius: designTokens.radius.card,
    paddingHorizontal: designTokens.spacing.xl,
    paddingVertical: designTokens.spacing.lg,
    alignItems: 'center',
    gap: designTokens.spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    minWidth: 220,
  },
  glyph: {
    fontSize: 56,
    lineHeight: 64,
    color: designTokens.color.successText,
    fontWeight: '900',
  },
  label: {
    fontSize: designTokens.fontSize.bodyLg,
    fontWeight: '700',
    color: designTokens.color.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});
