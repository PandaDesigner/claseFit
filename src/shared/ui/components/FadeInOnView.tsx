import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, type LayoutChangeEvent, type ViewStyle } from 'react-native';

export interface FadeInOnViewProps {
  readonly children: ReactNode;
  readonly style?: ViewStyle;
  readonly duration?: number;
  readonly threshold?: number;
}

/**
 * Fades in once the element enters the viewport.
 *
 * On mount, fires the animation immediately (the element is on screen).
 * On `onLayout`, fires it when the element's `y` falls within
 * `threshold * windowHeight` of the top of the screen.
 *
 * Uses the native driver (`opacity` only) so it does not block the JS thread.
 */
export function FadeInOnView({
  children,
  style,
  duration = 180,
  threshold = 0.8,
}: FadeInOnViewProps) {
  const [opacity] = useState(() => new Animated.Value(0));
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, [opacity, duration]);

  const handleLayout = (event: LayoutChangeEvent) => {
    if (fired.current) return;
    const { y } = event.nativeEvent.layout;
    // window isn't passed through LayoutChangeEvent in RN, so we approximate
    // the visibility check with the layout y. The header is always near the
    // top of a section, so y < 600 (typical phone) is a reasonable proxy.
    if (y < 600 * threshold) {
      fired.current = true;
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <Animated.View style={[style, { opacity }]} onLayout={handleLayout}>
      {children}
    </Animated.View>
  );
}
