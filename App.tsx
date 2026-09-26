import { useEffect, useState } from 'react';
import { CompositionProvider } from '@features/class-booking/compositionProvider';
import { buildProductionComposition, type Composition } from '@features/class-booking/composition';
import { RootTabs } from './src/navigation/RootTabs';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureForegroundNotificationHandler } from '@features/class-booking/infrastructure/notifications/ExpoNotificationsAdapter';

// Configure the foreground notification handler exactly once at module load.
// Without this, iOS suppresses notifications while the app is in the foreground,
// which would hide our booking / cancellation success feedback from the user.
configureForegroundNotificationHandler();

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
      // Request notification permissions once the app boots so the booking and
      // cancellation flows can fire native notifications without a runtime
      // prompt interrupting the user mid-interaction.
      void instance.notifications.requestPermissions();
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
