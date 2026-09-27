import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { buildProductionComposition, type Composition } from '@features/class-booking/composition';
import { CompositionProvider } from '@features/class-booking/compositionProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * RootLayout is the only place that builds the production composition.
 *
 * Lifecycle:
 *  1. On mount, the composition object is built synchronously inside the
 *     useState initializer and stored in state. As soon as the first render
 *     commits, the route tree (Stack → (tabs) group → Tabs) is rendered inside
 *     <CompositionProvider>, so feature screens can call useComposition()
 *     immediately.
 *  2. `initializeBookings.execute()` runs in the background (fire-and-forget)
 *     to hydrate the AsyncStorage snapshot. A failure is logged but does NOT
 *     block mount — the feature layer is responsible for surfacing it and
 *     offering a recovery path.
 *
 * The composition is built exactly once because the useState initializer runs
 * only on the first render.
 *
 * Note: this layout does NOT own the bottom tab bar. The Tabs surface lives
 * in `src/app/(tabs)/_layout.tsx` (the canonical expo-router v4 pattern: a
 * single `(tabs)` group with one route per tab). Sibling groups at the same
 * level both resolving to URL `/` confuse expo-router v4 ("No filename found"),
 * so all tabbed screens live under `(tabs)`.
 */
export default function RootLayout(): React.ReactElement {
  const [composition] = useState<Composition>(() => {
    const instance = buildProductionComposition({ storage: AsyncStorage });
    void instance.initializeBookings.execute().catch(() => {
      // Persistence failure is surfaced by the feature; do not block mount.
    });
    return instance;
  });

  if (!composition) {
    return (
      <SafeAreaProvider>
        <View
          testID="app-shell-loading"
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <CompositionProvider composition={composition}>
        <Stack screenOptions={{ headerShown: false }} />
      </CompositionProvider>
    </SafeAreaProvider>
  );
}
