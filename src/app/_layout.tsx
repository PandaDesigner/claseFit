import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { buildProductionComposition, type Composition } from '@features/class-booking/composition';
import { CompositionProvider } from '@features/class-booking/compositionProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FloatingTabBar } from './_components/tabs/FloatingTabBar';

/**
 * RootLayout is the only place that builds the production composition.
 *
 * Lifecycle:
 *  1. On mount, the composition object is built synchronously inside the
 *     useState initializer and stored in state. As soon as the first render
 *     commits, the route tree (Tabs) is rendered inside <CompositionProvider>,
 *     so feature screens can call useComposition() immediately.
 *  2. `initializeBookings.execute()` runs in the background (fire-and-forget)
 *     to hydrate the AsyncStorage snapshot. A failure is logged but does NOT
 *     block mount — the feature layer is responsible for surfacing it and
 *     offering a recovery path.
 *
 * The composition is built exactly once because the useState initializer runs
 * only on the first render.
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
        <Tabs
          tabBar={(props) => <FloatingTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen
            name="(proximas)"
            options={{
              title: 'Clases',
              tabBarAccessibilityLabel: 'Clases',
            }}
          />
          <Tabs.Screen
            name="(reservas)"
            options={{
              title: 'Mis reservas',
              tabBarAccessibilityLabel: 'Mis reservas',
            }}
          />
        </Tabs>
      </CompositionProvider>
    </SafeAreaProvider>
  );
}
