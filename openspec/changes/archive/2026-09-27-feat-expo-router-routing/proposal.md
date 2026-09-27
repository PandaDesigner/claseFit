## Why

The app currently mounts its two screens (`UpcomingClassesScreen`, `MyBookingsScreen`) through a hand-rolled `src/navigation/RootTabs.tsx` built on `@react-navigation/bottom-tabs`. That wiring lives outside the feature (so the feature cannot reach its own composition) and gives no place for future detail screens, deep links, or per-route layouts. We want file-based routing so every screen lives in one obvious place (`src/app/...`), future detail screens (`/clase/[claseId]`, `/reserva/[reservaId]`) are placeholders we can fill in later, and the routing layer stays **thin**: layouts and re-exports only, no business logic.

## What Changes

- **Add** `expo-router` (latest stable matching Expo SDK 57) plus its peer deps (`expo-linking`, `expo-constants`).
- **Add** `src/app/` with file-based routes:
  - `src/app/_layout.tsx` — `NativeTabs` root (two tabs) wrapping `<CompositionProvider>` + `<SafeAreaProvider>`.
  - `src/app/(proximas)/_layout.tsx` + `index.tsx` — Tab #1 ("Clases"), `index.tsx` re-exports `UpcomingClassesScreen`.
  - `src/app/(reservas)/_layout.tsx` + `index.tsx` — Tab #2 ("Mis reservas"), `index.tsx` re-exports `MyBookingsScreen`.
  - `src/app/(proximas)/clase/[claseId].tsx` and `src/app/(reservas)/reserva/[reservaId].tsx` — placeholder screens that render a thin "Class detail" / "Reservation detail" stub reading the dynamic param via `useLocalSearchParams`. **No business logic.**
- **Add** `scheme: "clasefit"` to `app.json` so deep links resolve.
- **Replace** the imperative `App.tsx` with a single default export `<RootLayout />` from `src/app/_layout.tsx` that owns hydration, the composition root, and the safe-area provider. The old `App.tsx` is removed.
- **Replace** the legacy `src/navigation/RootTabs.tsx` + `src/navigation/components/FloatingTabBar.tsx` and the `createBottomTabNavigator` glue. The floating tab bar moves to `src/app/(proximas)/_layout.tsx` as the `<NativeTabs>` tab bar slot, keeping the existing visual identity.
- **Remove** `@react-navigation/native` and `@react-navigation/bottom-tabs` from `package.json` once the new tree mounts.

The `src/features/class-booking/` tree (domain, application, infrastructure, presentation) is **untouched**. The composition root stays the single door to concrete adapters; `app/` only consumes `useComposition()` through the existing `CompositionProvider`.

## Capabilities

### New Capabilities

- `app-routing`: file-based routing for the ClaseFit app using `expo-router`. Covers the root `NativeTabs` layout, the two tab groups (`(proximas)`, `(reservas)`), their re-export screens, and the placeholder dynamic routes for `/clase/[claseId]` and `/reserva/[reservaId]`. Includes the `useLocalSearchParams` contract and the "no logic in `app/`" boundary rule.

### Modified Capabilities

- None. The `class-booking` capability and its domain contracts are untouched — this change is purely routing + composition bootstrap.

## Impact

- **Files added**: `src/app/_layout.tsx`, `src/app/(proximas)/_layout.tsx`, `src/app/(proximas)/index.tsx`, `src/app/(proximas)/clase/[claseId].tsx`, `src/app/(reservas)/_layout.tsx`, `src/app/(reservas)/index.tsx`, `src/app/(reservas)/reserva/[reservaId].tsx`.
- **Files removed**: `App.tsx`, `src/navigation/RootTabs.tsx`, `src/navigation/components/FloatingTabBar.tsx`, `src/navigation/components/TabBarIcons.tsx`. (Tab bar icons are re-implemented inside the `NativeTabs` tab bar slot using the same `View`-based compositions.)
- **Dependencies**: add `expo-router`, `expo-linking`, `expo-constants`. Remove `@react-navigation/native`, `@react-navigation/bottom-tabs`. React Navigation types (`@types/react-navigation/*`) are no longer needed.
- **Tests**: existing 96 tests stay green. Two new render tests cover the route shells (`render(<RootLayout />)` and `render(<ClaseDetail />)` reading the dynamic param). No domain or application test changes.
- **Bootstrap**: `index.ts` (Expo entry) keeps `registerRootComponent(App)` — but `App` now re-exports the router layout.
- **Tooling**: `pnpm typecheck`, `pnpm lint 0 warnings`, `pnpm test`, `npx expo export --platform android` must all pass. Web is out of scope.

## Non-goals

- No change to `domain/`, `application/`, `infrastructure/`, or any `presentation/components|hooks` inside `src/features/class-booking/`.
- No new bounded context, no new use case, no new query.
- No deep link *handler* business logic (placeholders only — the URL scheme is registered, but business actions on deep links are deferred).
- No web support (mobile-only).
- No animations, transitions, or gesture handling beyond what `NativeTabs` ships natively.
- No replacement of `src/shared/ui/` primitives.
- No extra optional `expo-router` integrations (typed routes, server actions, EAS Hosting, etc.) — just the file-based router and the dynamic route contract.
