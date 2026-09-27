import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Placeholder root layout — replaced in Phase 2 with the hydration gate.
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <ActivityIndicator />
      </View>
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
