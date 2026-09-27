import { Stack } from 'expo-router';

/**
 * Stack layout for the "Mis reservas" tab.
 *
 * The Tabs surface is mounted at `src/app/(tabs)/_layout.tsx`. This layout
 * only owns stack-level screen configuration for routes inside the
 * `(tabs)/reservas` subtree (e.g. `(tabs)/reservas/reserva/[reservaId].tsx`).
 */
export default function ReservasLayout(): React.ReactElement {
  return <Stack screenOptions={{ headerShown: false }} />;
}
