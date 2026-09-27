## 1. Bootstrap

- [x] 1.1 Crear rama `feat/expo-router-routing` desde `develop` y sincronizar con `origin/develop`
- [x] 1.2 Agregar `expo-router@^4`, `expo-linking@~7` y `expo-constants@~17` a `package.json` (dependencies)
- [x] 1.3 Agregar `"scheme": "clasefit"` a `app.json` bajo el nodo `expo`
- [x] 1.4 Habilitar `experiments.typedRoutes: true` en `app.json`
- [x] 1.5 Crear `src/app/` con un `index.ts` mínimo que re-exporte `<RootLayout />` (placeholder hasta Phase 2)
- [x] 1.6 Actualizar `index.ts` de raíz para que `App` re-exporte el layout desde `src/app/_layout.tsx` (temporalmente un placeholder)

## 2. Root layout — hidratación y composition boundary

Specs: `App boots through an expo-router file-based tree`.

- [x] 2.1 RED — Crear `src/app/__tests__/RootLayout.test.tsx` que renderiza `<RootLayout />` con `useComposition` mockeado; asserta que muestra `<ActivityIndicator />` antes de que `initializeBookings.execute()` resuelva
- [x] 2.2 RED (mismo archivo) — Asserta que después de que `initializeBookings.execute()` resuelve, el árbol renderiza `<CompositionProvider>` y los children aparecen
- [x] 2.3 GREEN — Crear `src/app/_layout.tsx` con el effect de hidratación, `<CompositionProvider>` y `<SafeAreaProvider>`; mantener `<ActivityIndicator />` mientras `isHydrating === true`
- [x] 2.4 GREEN — Mover `buildProductionComposition({ storage: AsyncStorage })` desde `App.tsx` a `src/app/_layout.tsx` (composition root sigue siendo el único que conoce adaptadores concretos)
- [x] 2.5 REFACTOR — Extraer el loading state a un hook interno `useHydratedComposition()` si la lógica crece

## 3. NativeTabs root — tab groups y floating tab bar

Specs: `The app exposes two top-level tabs via NativeTabs`.

- [x] 3.1 RED — Crear `src/app/__tests__/RootLayout.tabs.test.tsx` que asserta que el árbol renderizado contiene dos `<NativeTabs.Trigger>` con labels "Clases" y "Mis reservas"
- [x] 3.2 GREEN — Crear `src/app/(proximas)/_layout.tsx` con `<Stack screenOptions={{ headerShown: false }}>` (sin contenido adicional todavía)
- [x] 3.3 GREEN — Crear `src/app/(reservas)/_layout.tsx` con `<Stack screenOptions={{ headerShown: false }}>` (sin contenido adicional todavía)
- [x] 3.4 GREEN — Agregar `<NativeTabs>` en `src/app/_layout.tsx` con dos `<NativeTabs.Screen>` apuntando a `(proximas)` y `(reservas)`
- [x] 3.5 GREEN — Implementar el slot `tabBar` inline (re-implementación de `FloatingTabBar` con `View` + íconos `View`; sin librerías nuevas; respeta `insets.bottom`)
- [x] 3.6 REFACTOR — Confirmar que los colores, padding y radio son byte-equivalentes al `FloatingTabBar.tsx` original (comparación visual lado a lado contra el APK previo)

## 4. Index re-exports thin

Specs: `Routing layer is thin — no business logic in src/app/`.

- [x] 4.1 Crear `src/app/(proximas)/index.tsx` con `export { UpcomingClassesScreen } from '@features/class-booking/presentation/screens/UpcomingClassesScreen'` (named re-export, no `default`)
- [x] 4.2 Crear `src/app/(reservas)/index.tsx` con `export { MyBookingsScreen } from '@features/class-booking/presentation/screens/MyBookingsScreen'`
- [x] 4.3 RED — Crear `src/app/__tests__/re-exports.test.tsx` que importa cada `index.tsx` y asserta que el módulo exporta exactamente el screen esperado (sin default export)
- [x] 4.4 GREEN — Si los imports fallan, ajustar paths concretos a los screens de feature (sin barrels)

## 5. Dynamic placeholders

Specs: `Dynamic route placeholders exist for future detail screens`, `URL scheme is registered for deep linking`.

- [x] 5.1 RED — Crear `src/app/(proximas)/clase/__tests__/ClaseDetail.test.tsx` con un mock de `useLocalSearchParams` que devuelve `{ claseId: "C-09" }`; asserta que el componente renderiza `Class detail: C-09`
- [x] 5.2 GREEN — Crear `src/app/(proximas)/clase/[claseId].tsx` con `useLocalSearchParams<{ claseId: string }>()` y un `<Text>` que muestra `Class detail: ${claseId}`
- [x] 5.3 RED — Crear `src/app/(reservas)/reserva/__tests__/ReservaDetail.test.tsx` con el mismo patrón, param `reservaId`
- [x] 5.4 GREEN — Crear `src/app/(reservas)/reserva/[reservaId].tsx` con el mismo patrón
- [x] 5.5 REFACTOR — Verificar que ambos archivos no importan `@features/class-booking/{domain,application,infrastructure}/**` (regla hexagonal)

## 6. Retire legacy

Specs: `Legacy React Navigation tree and App.tsx are removed`.

- [x] 6.1 Reemplazar `App.tsx` por una sola línea: `export { RootLayout as default } from './src/app/_layout'` (named re-export, no business logic)
- [x] 6.2 Eliminar `src/navigation/RootTabs.tsx`
- [x] 6.3 Eliminar `src/navigation/components/FloatingTabBar.tsx`
- [x] 6.4 Eliminar `src/navigation/components/TabBarIcons.tsx`
- [x] 6.5 Eliminar `src/navigation/` si queda vacío
- [x] 6.6 Eliminar `@react-navigation/native`, `@react-navigation/bottom-tabs` y `@types/react-navigation/*` de `package.json`
- [x] 6.7 RED — Crear `src/app/__tests__/no-legacy-navigation.test.ts` que greppea el repo por `@react-navigation/` y asserta cero matches en `src/` y `App.tsx`
- [x] 6.8 GREEN — Confirmar que `pnpm typecheck` reporta cero errores (los retires no rompieron nada)

## 7. Verification

Specs: `Routing change preserves existing test suite`, `Quality gates pass`.

- [x] 7.1 `pnpm typecheck` — debe pasar sin errores
- [x] 7.2 `pnpm lint` — debe pasar con cero warnings
- [x] 7.3 `pnpm test` — debe reportar los 96 tests previos verdes + los nuevos (al menos: `RootLayout.test.tsx`, `RootLayout.tabs.test.tsx`, `ClaseDetail.test.tsx`, `ReservaDetail.test.tsx`, `re-exports.test.tsx`, `no-legacy-navigation.test.ts`)
- [x] 7.4 `npx expo export --platform android` — debe finalizar sin errores (verifica que `expo-router` resuelve el árbol y que la exportación web está desactivada)
- [x] 7.5 `openspec validate feat-expo-router-routing` — debe pasar sin errores
- [x] 7.6 Verificación visual manual (o screenshots automatizados) — el `tabBar` re-implementado coincide con el `FloatingTabBar` previo (colores, radio, padding, safe-area)

## Suggested Work Units (mapeados a commits)

Cada task cerrada termina con un commit de Conventional Commits (sin `Co-Authored-By:`), branch `feat/expo-router-routing`, base `develop`. Cada commit es revisable de forma aislada y deja la suite verde.

| Work unit | Tasks | Commit prefix | Ejemplo |
| --- | --- | --- | --- |
| Bootstrap | 1.1–1.6 | `chore(routing)` | `chore(routing): install expo-router and register scheme` |
| Root layout | 2.1–2.5 | `feat(routing)` | `feat(routing): add RootLayout with hydration gate` |
| NativeTabs root | 3.1–3.6 | `feat(routing)` | `feat(routing): add NativeTabs with floating tab bar` |
| Re-exports | 4.1–4.4 | `feat(routing)` | `feat(routing): re-export feature screens from app router` |
| Dynamic placeholders | 5.1–5.5 | `feat(routing)` | `feat(routing): add dynamic placeholders for detail routes` |
| Retire legacy | 6.1–6.8 | `refactor(routing)` | `refactor(routing): drop @react-navigation/* legacy tree` |
| Verification | 7.1–7.6 | `test(routing)` | `test(routing): add legacy-import guard test` |

Una vez todas las tasks marcadas `[x]`, archivar el change con `openspec archive feat-expo-router-routing --yes` y abrir PR desde `feat/expo-router-routing` hacia `develop` (PR queda en `draft` hasta que el usuario lo revise).
