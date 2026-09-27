import { Stack } from 'expo-router';

/**
 * Stack layout for the "Clases" tab.
 *
 * The Tabs surface is mounted at `src/app/(tabs)/_layout.tsx`. This layout
 * only owns stack-level screen configuration for routes inside the
 * `(tabs)/proximas` subtree (e.g. `(tabs)/proximas/clase/[claseId].tsx`).
 */
export default function ProximasLayout(): React.ReactElement {
  return <Stack screenOptions={{ headerShown: false }} />;
}
