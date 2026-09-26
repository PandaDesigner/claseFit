import { useEffect, useState } from 'react';
import { CompositionProvider } from '@features/class-booking/compositionProvider';
import { buildProductionComposition, type Composition } from '@features/class-booking/composition';
import { RootTabs } from './src/navigation/RootTabs';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [composition, setComposition] = useState<Composition | null>(null);

  useEffect(() => {
    const instance = buildProductionComposition({ storage: AsyncStorage });
    void (async () => {
      try {
        await instance.initializeBookings.execute();
      } finally {
        setComposition(instance);
      }
    })();
  }, []);

  if (!composition) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <CompositionProvider composition={composition}>
        <RootTabs />
      </CompositionProvider>
    </SafeAreaProvider>
  );
}
