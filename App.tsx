/**
 * Backwards-compatibility shim.
 *
 * The Expo entry (`index.ts` → `registerRootComponent(App)`) still imports
 * `App`. Now that the routing tree lives under `src/app/` (file-based via
 * `expo-router`), `App` just re-exports the RootLayout so the existing entry
 * surface keeps working without changes.
 */
export { default } from './src/app/_layout';
