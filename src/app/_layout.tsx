import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router/tabs';
import {
  buildProductionComposition,
  type Composition,
} from '@features/class-booking/composition';
import { CompositionProvider } from '@features/class-booking/compositionProvider';
import { FloatingTabBar } from '@features/class-booking/presentation/components/FloatingTabBar';

export default function RootLayout() {
  const [composition, setComposition] = useState<Composition | null>(null);

  useEffect(() => {
    const instance = buildProductionComposition({ storage: AsyncStorage });
    void (async () => {
      try {
        // TEMP: clear stale snapshot persisted from a previous run with
        // outdated baseDateBogota. Remove this line after the Tuesday demo.
        await AsyncStorage.clear();
        await instance.initializeBookings.execute();
      } finally {
        setComposition(instance);
      }
    })();
  }, []);

  if (!composition) {
    return (
      <SafeAreaProvider>
        <View style={styles.root}>
          <ActivityIndicator />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <CompositionProvider composition={composition}>
        <Tabs
          screenOptions={{ headerShown: false }}
          tabBar={(props) => <FloatingTabBar {...props} />}
        >
          <Tabs.Screen name="(proximas)" options={{ title: 'Clases' }} />
          <Tabs.Screen name="(reservas)" options={{ title: 'Mis reservas' }} />
        </Tabs>
      </CompositionProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});