# app-routing Specification (delta)

## Purpose

This delta adds the **`app-routing`** capability: file-based routing for the
ClaseFit app using `expo-router`. The routing layer (`src/app/`) is a thin
shell that owns hydration, providers, the `<Tabs>` surface, and re-export
screens — it does NOT contain business logic. The `class-booking` feature
and its domain / application / infrastructure trees are untouched.

## ADDED Requirements

### Requirement: File-based routes live under `src/app/`

The app SHALL mount screens through `expo-router` file-based routes under
`src/app/`. The root layout (`src/app/_layout.tsx`) SHALL own hydration,
`<CompositionProvider>`, `<SafeAreaProvider>`, and the `<Tabs>` surface.
There SHALL be two tab groups: `(proximas)` (Tab #1, "Clases") and
`(reservas)` (Tab #2, "Mis reservas"). Each group SHALL own a
`<Stack>`-shaped `_layout.tsx` plus an `index.tsx` that re-exports the
matching feature screen (`UpcomingClassesScreen` and
`MyBookingsScreen` respectively) without wrapping or transforming it.

#### Scenario: Opening the app routes to the Clases tab

- **WHEN** the user launches the app on Android or iOS
- **THEN** the root layout renders `<Tabs>` with `(proximas)` as the
  default route
- **AND** the `UpcomingClassesScreen` feature screen mounts unchanged
  inside the `(proximas)` group.

#### Scenario: Tapping the "Mis reservas" tab switches to the bookings group

- **WHEN** the user taps the "Mis reservas" tab in `FloatingTabBar`
- **THEN** `<Tabs>` mounts the `(reservas)` group
- **AND** the `MyBookingsScreen` feature screen renders unchanged
  inside that group.

### Requirement: Canonical entry point is `expo-router/entry`

`package.json#main` SHALL be `"expo-router/entry"`. There SHALL be NO
hand-written `App.tsx` or `index.ts` that mounts the app via
`registerRootComponent` from `expo` — that path bypasses expo-router's
`RootContainer` and every nested layout throws `No filename found.
This is likely a bug in expo-router.` at first render.

#### Scenario: Metro resolves through `expo-router/entry`

- **WHEN** `npx expo export --platform android` runs
- **THEN** the produced Hermes bundle is named `entry-*.hbc` (not
  `index-*.hbc`)
- **AND** `useContextKey()` resolves `CurrentRouteContext` on the first
  render without throwing.

### Requirement: The deep-link URL scheme is registered

`app.json#expo.scheme` SHALL be `"clasefit"`. No business actions are
wired to deep links in this change — the scheme is registered so future
routes resolve.

#### Scenario: A future `clasefit://...` URL resolves to the app

- **WHEN** the OS receives a `clasefit://...` URL after this change
  ships
- **THEN** Android / iOS launch the app through the registered scheme
- **AND** the routing layer receives the URL (no handler is wired yet
  in this change).

### Requirement: Routing layer (`src/app/`) contains no business logic

Files under `src/app/` SHALL only host layouts, providers, and re-exports.
Validation, capacity math, eligibility checks, and state mutations SHALL
NOT live in `src/app/`. The composition bootstrap inside
`src/app/_layout.tsx` SHALL consume `useComposition()` through the
existing `CompositionProvider` — concrete adapters are wired by
`composition.ts` and remain invisible to the routing layer.

#### Scenario: A reviewer grepping `src/app/` finds no domain imports

- **WHEN** the reviewer greps `src/app/**/*.{ts,tsx}` for imports from
  `src/features/class-booking/domain` or
  `src/features/class-booking/application`
- **THEN** no matches are found
- **AND** the only feature import in `src/app/` is the re-export of the
  screen component.

### Requirement: `FloatingTabBar` lives in the feature, not in the routing layer

`FloatingTabBar.tsx` and `TabBarIcons.tsx` SHALL live under
`src/features/class-booking/presentation/components/`. They SHALL NOT
live under `src/app/` or any `src/navigation/` folder.

#### Scenario: The presentation components ship with the feature

- **WHEN** the reviewer inspects the file tree
- **THEN** `src/features/class-booking/presentation/components/FloatingTabBar.tsx`
  exists
- **AND** `src/features/class-booking/presentation/components/TabBarIcons.tsx`
  exists
- **AND** no `src/navigation/` folder remains.

### Requirement: `expo-router` peer deps and phantom deps are declared direct

`package.json` SHALL declare as direct dependencies everything that
`expo-router@4.0.22` requires at runtime:

- `expo-router`
- `expo-linking`
- `expo-constants`
- `query-string` (phantom dep of `expo-router@4.0.22`'s
  `getPathFromState.js`)
- `babel-preset-expo` (devDependency — the Expo default for SDK 57)

The `@expo/metro-runtime` ESM/CJS interop patch SHALL live under
`patches/` so `pnpm install` re-applies it on a clean checkout.

#### Scenario: A clean `pnpm install` produces a bundleable app

- **WHEN** a reviewer runs `pnpm install` from scratch on a clone
- **THEN** `pnpm-lock.yaml` resolves all of the above packages
- **AND** `npx expo export --platform android` produces a 2.1 MB
  Hermes bytecode bundle without `Unable to resolve "query-string"`
  or `Unable to resolve module @expo/metro-runtime`.

## MODIFIED Requirements

None.

## REMOVED Requirements

None.