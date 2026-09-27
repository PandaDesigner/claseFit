import { Tabs } from 'expo-router';
import { FloatingTabBar } from '../_components/tabs/FloatingTabBar';

/**
 * Tabs layout — owns the bottom-tab surface for the whole app.
 *
 * File naming follows the canonical expo-router v4 tabs pattern: a single
 * `(tabs)` group with one route per tab. Each tab is a sibling folder under
 * `(tabs)` with its own `_layout.tsx` (Stack) and `index.tsx`.
 *
 * Why one `(tabs)` group instead of two sibling groups (`(proximas)` and
 * `(reservas)`): when two sibling groups both have an `index.tsx`, expo-router
 * v4 cannot resolve which file backs the root URL `/` and throws
 * "No filename found. This is likely a bug in expo-router." at runtime.
 *
 * Tab names MUST match the file basenames (no parentheses), so:
 *   - `(tabs)/proximas/index.tsx`  →  Tabs.Screen name="proximas"
 *   - `(tabs)/reservas/index.tsx`  →  Tabs.Screen name="reservas"
 */
export default function TabsLayout(): React.ReactElement {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="proximas"
        options={{
          title: 'Clases',
          tabBarAccessibilityLabel: 'Clases',
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: 'Mis reservas',
          tabBarAccessibilityLabel: 'Mis reservas',
        }}
      />
    </Tabs>
  );
}
