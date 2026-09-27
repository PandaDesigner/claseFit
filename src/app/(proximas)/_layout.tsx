import { Stack } from 'expo-router';

/**
 * Stack layout for the "Clases" tab.
 *
 * The tab itself is mounted at src/app/_layout.tsx. This layout only owns
 * stack-level screen configuration for screens inside the (proximas) group
 * (no header, native modal feel).
 */
export default function ProximasLayout(): React.ReactElement {
  return <Stack screenOptions={{ headerShown: false }} />;
}
