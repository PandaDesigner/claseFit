import { Stack } from 'expo-router';

/**
 * Stack layout for the "Mis reservas" tab.
 *
 * The tab itself is mounted at src/app/_layout.tsx. This layout only owns
 * stack-level screen configuration for screens inside the (reservas) group
 * (no header, native modal feel).
 */
export default function ReservasLayout(): React.ReactElement {
  return <Stack screenOptions={{ headerShown: false }} />;
}
