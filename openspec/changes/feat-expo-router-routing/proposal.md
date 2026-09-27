## Why

The app currently mounts its two screens (`UpcomingClassesScreen`, `MyBookingsScreen`) through a hand-rolled `src/navigation/RootTabs.tsx` built on `@react-navigation/bottom-tabs`. That wiring lives outside the feature, gives no place for future detail screens, deep links, or per-route layouts, and forces the floating tab bar to be re-implemented as a JS `View` composition every time the design shifts.

We want file-based routing so every screen lives in one obvious place (`src/app/...`), future detail screens are placeholders we can fill in later, and the routing layer stays **thin**: layouts and re-exports only, no business logic.

## What Changes

- **Add** `expo-router` (latest stable matching Expo SDK 57) plus its peer deps (`expo-linking`, `expo-constants`).
- **Add** `src/app/` with file-based routes:
  - `src/app/_layout.tsx` — root layout owning hydration, `<CompositionProvider>`, `<SafeAreaProvider>`, and the `<NativeTabs>` surface (two tabs).
  - `src/app/(proximas)/_layout.tsx` + `index.tsx` — Tab #1 ("Clases"); `index.tsx` re-exports `UpcomingClassesScreen`.
  - `src/app/(reservas)/_layout.tsx` + `index.tsx` — Tab #2 ("Mis reservas"); `index.tsx` re-exports `MyBookingsScreen`.
  - `src/app/(proximas)/clase/[claseId].tsx` and `src/app/(reservas)/reserva/[reservaId].tsx` — placeholder screens that render a thin "Class detail" / "Reservation detail" stub reading the dynamic param via `useLocalSearchParams`. **No business logic.**
- **Add** `scheme: "clasefit"` to `app.json` so deep links resolve.
- **Replace** the imperative `App.tsx` with a one-liner that re-exports `RootLayout` from `src/app/_layout.tsx`. The old multi-line composition bootstrap moves into the layout itself.
- **Replace** `src/navigation/RootTabs.tsx` + `src/navigation/components/FloatingTabBar.tsx` + `src/navigation/components/TabBarIcons.tsx`. The native iOS UITabBar / Android Material 3 bottom navigation supplied by `<NativeTabs>` replaces the JS floating pill. **Visual identity changes** (decision 2026-09-27: native tabs over JS tabs).
- **Remove** `@react-navigation/native`, `@react-navigation/bottom-tabs`, and the `react-navigation`-only types from `package.json` once the new tree mounts.

The `src/features/class-booking/` tree (domain, application, infrastructure, presentation) is **untouched**. The composition root stays the single door to concrete adapters; `src/app/` only consumes `useComposition()` through the existing `CompositionProvider`.

## Capabilities

### New Capabilities

- `app-routing`: file-based routing for the ClaseFit app using `expo-router`. Covers the root `<NativeTabs>` layout, the two tab groups (`(proximas)`, `(reservas)`), their re-export screens, the placeholder dynamic routes for `/clase/[claseId]` and `/reserva/[reservaId]`, and the "no logic in `src/app/`" boundary rule.

### Modified Capabilities

- None. The `class-booking` capability and its domain contracts are untouched — this change is purely routing + composition bootstrap.

## Impact

- **Files added**:
  - `src/app/_layout.tsx`
  - `src/app/(proximas)/_layout.tsx`, `src/app/(proximas)/index.tsx`
  - `src/app/(proximas)/clase/[claseId].tsx` (and a `__tests__/ClaseDetail.test.tsx`)
  - `src/app/(reservas)/_layout.tsx`, `src/app/(reservas)/index.tsx`
  - `src/app/(reservas)/reserva/[reservaId].tsx` (and a `__tests__/ReservaDetail.test.tsx`)
  - `src/app/__tests__/RootLayout.test.tsx`
  - `src/app/__tests__/RootLayout.tabs.test.tsx`
  - `src/app/__tests__/re-exports.test.tsx`
  - `src/app/__tests__/no-legacy-navigation.test.ts`
- **Files removed**: `App.tsx`, `src/navigation/RootTabs.tsx`, `src/navigation/components/FloatingTabBar.tsx`, `src/navigation/components/TabBarIcons.tsx`. The `src/navigation/` folder is removed if empty after the retires.
- **Dependencies**: add `expo-router`, `expo-linking`, `expo-constants`. Remove `@react-navigation/native`, `@react-navigation/bottom-tabs`. React Navigation types (`@types/react-navigation/*`) are no longer needed.
- **Tests**: existing 96 tests stay green. New render tests cover the route shells and the legacy-import guard.
- **Bootstrap**: `index.ts` (Expo entry) keeps `registerRootComponent(App)` — `App` now re-exports the router layout.
- **Tooling**: `pnpm typecheck`, `pnpm lint 0 warnings`, `pnpm test`, `npx expo export --platform android` must all pass. Web is out of scope.

## Non-goals

- No change to `domain/`, `application/`, `infrastructure/`, or any `presentation/components|hooks` inside `src/features/class-booking/`.
- No new bounded context, no new use case, no new query.
- No deep link *handler* business logic (placeholders only — the URL scheme is registered, but business actions on deep links are deferred).
- No web support (mobile-only).
- No custom tab bar, no gesture handling, no swipe-down dismiss — we use the native tab bar that `<NativeTabs>` ships with.
- No replacement of `src/shared/ui/` primitives.
- No extra optional `expo-router` integrations (typed routes, server actions, EAS Hosting, etc.) beyond the file-based router and the dynamic route contract.
- **No merge to `develop`** from this session. Everything stays on `feature/setup-expo-typescript` until the change is verified.