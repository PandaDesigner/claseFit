# feat-expo-router-routing — proposal

## Why

The app currently mounts its two screens (`UpcomingClassesScreen`, `MyBookingsScreen`) through a hand-rolled `src/navigation/RootTabs.tsx` built on `@react-navigation/bottom-tabs`. That wiring lives outside the feature and gives no obvious place for future detail screens or per-route layouts.

We want file-based routing so every screen lives in one place (`src/app/...`), and the routing layer stays **thin**: layouts and re-exports only, no business logic.

## What Changes

- **Add** `expo-router` (latest stable matching Expo SDK 57) plus its peer deps (`expo-linking`, `expo-constants`).
- **Add** `src/app/` with file-based routes:
  - `src/app/_layout.tsx` — root layout owning hydration, `<CompositionProvider>`, `<SafeAreaProvider>`, and the `<Tabs>` surface.
  - `src/app/(proximas)/_layout.tsx` + `index.tsx` — Tab #1 ("Clases"); `index.tsx` re-exports `UpcomingClassesScreen`.
  - `src/app/(reservas)/_layout.tsx` + `index.tsx` — Tab #2 ("Mis reservas"); `index.tsx` re-exports `MyBookingsScreen`.
- **Add** `scheme: "clasefit"` to `app.json` so future deep links resolve.
- **Replace** the imperative `App.tsx` with a one-liner that re-exports `RootLayout` from `src/app/_layout.tsx`. The multi-line composition bootstrap moves into the layout itself.
- **Move** `src/navigation/components/FloatingTabBar.tsx` and `TabBarIcons.tsx` to `src/features/class-booking/presentation/components/`. They are presentation JSX belonging to the feature, not the routing layer.
- **Remove** `src/navigation/RootTabs.tsx`. The folder is deleted once empty.
- **Drop** `@react-navigation/native` from `package.json` (no longer used; `<Tabs>` from `expo-router` is the new root). `@react-navigation/bottom-tabs` stays — `FloatingTabBar` consumes `BottomTabBarProps` from it.

The `src/features/class-booking/` domain / application / infrastructure trees are **untouched**. The composition root stays the single door to concrete adapters; `src/app/` only consumes `useComposition()` through the existing `CompositionProvider`.

## Capabilities

### New Capabilities

- `app-routing`: file-based routing for the ClaseFit app using `expo-router`. Covers the root `<Tabs>` layout, two tab groups (`(proximas)`, `(reservas)`), their re-export screens, and the "no logic in `src/app/`" boundary rule.

### Modified Capabilities

- None. The `class-booking` capability and its domain contracts are untouched — this change is purely routing + composition bootstrap.

## Impact

- **Files added**:
  - `src/app/_layout.tsx`
  - `src/app/(proximas)/_layout.tsx`, `src/app/(proximas)/index.tsx`
  - `src/app/(reservas)/_layout.tsx`, `src/app/(reservas)/index.tsx`
- **Files relocated** (rename, not delete):
  - `src/navigation/components/FloatingTabBar.tsx` → `src/features/class-booking/presentation/components/FloatingTabBar.tsx`
  - `src/navigation/components/TabBarIcons.tsx` → `src/features/class-booking/presentation/components/TabBarIcons.tsx`
- **Files removed**: `src/navigation/RootTabs.tsx`, `src/navigation/` (folder).
- **Files trimmed**: `App.tsx` shrinks from bootstrap to a one-line re-export.
- **Dependencies**: add `expo-router`, `expo-linking`, `expo-constants`. Remove `@react-navigation/native`. Keep `@react-navigation/bottom-tabs` for the `BottomTabBarProps` type.
- **Tests**: existing 96 tests stay green. `Composition.test.ts` length assertion aligned with the 13-class fixture (commit 67a4d76 added C-11/C-12/C-13).
- **Bootstrap**: `index.ts` (Expo entry) keeps `registerRootComponent(App)` — `App` now re-exports the router layout.
- **Tooling**: `pnpm typecheck`, `pnpm lint 0 warnings`, `pnpm test`, `npx expo export --platform android` must all pass. Web is out of scope.

## Non-goals

- No change to `domain/`, `application/`, `infrastructure/`, or any `presentation/components|hooks` inside `src/features/class-booking/`.
- No new bounded context, no new use case, no new query.
- **No detail routes yet.** There are no per-class or per-booking screens in the feature today, so adding `(proximas)/clase/[claseId].tsx` or `(reservas)/reserva/[reservaId].tsx` would be speculative plumbing. The groups stay as `<Stack>` shells ready for detail screens when the feature grows them.
- No deep link *handler* business logic (the URL scheme is registered, but business actions on deep links are deferred).
- No web support (mobile-only).
- No replacement of `src/shared/ui/` primitives.
- No extra optional `expo-router` integrations (typed routes, server actions, EAS Hosting, etc.) beyond the file-based router and the dynamic route contract.
- **No merge to `develop`** from this session. Everything stays on `feature/setup-expo-typescript` until the change is verified.

## Decision Log

- **`expo-router@4.0.22` + `<Tabs>` (JS)** instead of `<NativeTabs>`:
  Decision 2026-09-27 (during implementation). The installed `expo-router` does not export `unstable-native-tabs`; that API lives on later versions. Upgrading was out of scope because it would force a peer-dep cascade across Expo SDK 57 + react-native 0.86. Switching to the JS `<Tabs>` wrapper keeps the existing `FloatingTabBar` visual identity byte-equivalent and ships behind a single `tabBar` prop.
- **FloatingTabBar lives in the feature, not the routing layer**:
  Decision 2026-09-27. Routing layer (`src/app/`) stays a thin shell (layouts + re-exports); `FloatingTabBar` and `TabBarIcons` are presentational JSX tied to the class-booking feature.
- **`@react-navigation/bottom-tabs` stays as a direct dependency**:
  Decision 2026-09-27. `FloatingTabBar` consumes `BottomTabBarProps` directly. The `@react-navigation/native` peer that ships with it is dropped because nothing in the new tree uses `NavigationContainer` or its hooks.
