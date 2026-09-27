# app-routing Specification

## Purpose
TBD - created by archiving change feat-expo-router-routing. Update Purpose after archive.
## Requirements
### Requirement: App boots through an expo-router file-based tree

The application SHALL mount its UI through an `expo-router` file-based routing tree located at `src/app/`. The root layout file `src/app/_layout.tsx` SHALL be the only component that builds the production `Composition` (calling `buildProductionComposition`) and SHALL render `<CompositionProvider>` plus `<SafeAreaProvider>` exactly once around the routed children. The composition object MUST be built synchronously on first render (via a `useState` initializer) so the routed children mount immediately. `initializeBookings.execute()` MUST be triggered in the background (fire-and-forget) on mount; the rendering of routed children MUST NOT be blocked on its resolution. A failure of `initializeBookings.execute()` MUST be swallowed and surfaced by the feature layer; it MUST NOT unmount the root layout.

#### Scenario: First-launch mount happens immediately

- **WHEN** the application starts and AsyncStorage has no persisted snapshot
- **THEN** the system SHALL render the routed children on first render, wrapped in `<CompositionProvider>` and `<SafeAreaProvider>`
- **AND** `initializeBookings.execute()` SHALL run in the background without blocking the first render.

#### Scenario: Persistence failure does not block mount

- **WHEN** `initializeBookings.execute()` rejects with a recoverable error
- **THEN** the routed children SHALL remain mounted
- **AND** the error SHALL be reachable from the existing feature recovery flow without crashing the root layout
- **AND** the root layout SHALL keep rendering the routed children.

### Requirement: The app exposes two top-level tabs via NativeTabs

The root layout SHALL mount a `<NativeTabs>` navigator with exactly two tabs:

1. Tab **"Clases"** routed to the group `src/app/(proximas)/`, whose `index.tsx` re-exports `UpcomingClassesScreen` from `@features/class-booking/presentation/screens/UpcomingClassesScreen`.
2. Tab **"Mis reservas"** routed to the group `src/app/(reservas)/`, whose `index.tsx` re-exports `MyBookingsScreen` from `@features/class-booking/presentation/screens/MyBookingsScreen`.

Both tab groups SHALL define their own `_layout.tsx` that is responsible only for stack-level configuration (`Stack` with `headerShown: false`). The floating tab bar visual identity (black pill, safe-area bottom inset, active-tab highlight) MUST be preserved exactly as shipped by the previous React Navigation implementation (`src/navigation/components/FloatingTabBar.tsx`); the visual contract is owned by `src/shared/ui/` and is NOT modified by this change.

#### Scenario: Default tab is the upcoming classes tab

- **WHEN** the routed children render after hydration
- **THEN** the "Clases" tab SHALL be active by default
- **AND** the screen SHALL display the `UpcomingClassesScreen` from the feature
- **AND** the floating tab bar SHALL be visible at the bottom of the viewport, respecting the bottom safe-area inset.

#### Scenario: Switching to the reservations tab preserves state

- **WHEN** the user taps the "Mis reservas" tab
- **THEN** the system SHALL render the `MyBookingsScreen` from the feature
- **AND** switching back to "Clases" SHALL render the previous `UpcomingClassesScreen` content without losing local component state.

### Requirement: Routing layer is thin — no business logic in src/app/

Every file under `src/app/` SHALL be limited to:

- layout composition (providers, `<Stack>`, `<NativeTabs>`);
- routing primitives (`<Link>`, `useRouter`, `useLocalSearchParams`);
- re-exports of feature screens via `export { X } from '<concrete path>'`;
- placeholder visual stubs for dynamic routes that render only text + the dynamic param.

The `src/app/` tree MUST NOT import from `src/features/class-booking/domain/`, `src/features/class-booking/application/`, or `src/features/class-booking/infrastructure/`. The tree MUST NOT call any use case, query, or state adapter directly. The tree MUST NOT re-implement booking validation, capacity math, or eligibility — those responsibilities remain owned exclusively by the feature.

#### Scenario: Tab index files only re-export feature screens

- **WHEN** the file `src/app/(proximas)/index.tsx` is inspected
- **THEN** its body SHALL contain a single named re-export of `UpcomingClassesScreen` from `@features/class-booking/presentation/screens/UpcomingClassesScreen`
- **AND** it SHALL NOT define any local component, hook, or business logic.

#### Scenario: Layout files do not import domain or application layers

- **WHEN** any file under `src/app/` is inspected
- **THEN** its imports SHALL be limited to `expo-router`, `expo-router/unstable-native-tabs` (or equivalent NativeTabs export), `@features/class-booking/compositionProvider`, `@features/class-booking/composition`, `@features/class-booking/presentation/screens/<name>`, and `react-native-safe-area-context`
- **AND** it SHALL NOT import from `@features/class-booking/domain/...` or `@features/class-booking/application/...`.

### Requirement: Dynamic route placeholders exist for future detail screens

The tree SHALL include two dynamic route placeholders that consume URL parameters via `useLocalSearchParams`:

- `src/app/(proximas)/clase/[claseId].tsx` — class detail placeholder.
- `src/app/(reservas)/reserva/[reservaId].tsx` — reservation detail placeholder.

Both placeholders SHALL render a thin visual stub that displays the dynamic param value verbatim (e.g. `Class detail: <claseId>`) and MUST NOT execute any use case, query, or state mutation. They exist so future changes can fill in the real detail screen without restructuring the router.

#### Scenario: Class detail placeholder reads the dynamic param

- **WHEN** the user navigates to `/clase/<any-id>`
- **THEN** the placeholder component SHALL render the literal id passed in the URL
- **AND** it SHALL NOT call `useComposition` or any feature hook.

#### Scenario: Reservation detail placeholder reads the dynamic param

- **WHEN** the user navigates to `/reserva/<any-id>`
- **THEN** the placeholder component SHALL render the literal id passed in the URL
- **AND** it SHALL NOT call `useComposition` or any feature hook.

### Requirement: URL scheme is registered for deep linking

The Expo configuration at `app.json` SHALL declare the URL scheme `clasefit` under `expo.scheme`. Any future change that wires deep-link handlers MUST do so in the routed screen components themselves; the root layout does not own a deep-link dispatcher in this change.

#### Scenario: Config declares the scheme

- **WHEN** `app.json` is inspected
- **THEN** the `expo.scheme` field SHALL equal `clasefit`
- **AND** no other scheme SHALL be declared by this change.

#### Scenario: Deep-link placeholder route is reachable

- **WHEN** the OS opens a `clasefit://clase/<id>` URL
- **THEN** the router SHALL mount the placeholder at `src/app/(proximas)/clase/[claseId].tsx`
- **AND** the placeholder SHALL render the `<id>` param without invoking any business logic.

### Requirement: Legacy React Navigation tree and App.tsx are removed

After the new router mounts and the routed screens are reachable, the legacy tree SHALL be deleted in a single work-unit:

- `App.tsx` at the repository root is removed; `src/app/_layout.tsx` replaces it via `index.ts` (`registerRootComponent`).
- `src/navigation/RootTabs.tsx` is removed.
- `src/navigation/components/FloatingTabBar.tsx` is removed; its visual identity is re-implemented inside the `NativeTabs` `tabBar` slot using the same colors, radius, and safe-area logic.
- `src/navigation/components/TabBarIcons.tsx` is removed; its two icons are re-implemented as inline `View` compositions inside the `NativeTabs` tab definitions.

The packages `@react-navigation/native`, `@react-navigation/bottom-tabs`, and any `@types/react-navigation/*` are removed from `package.json` once no other source file imports them.

#### Scenario: Source tree contains no legacy navigation imports

- **WHEN** `pnpm typecheck` runs after the retire phase
- **THEN** the system SHALL report zero unresolved imports from `@react-navigation/*`
- **AND** `pnpm lint` SHALL report zero warnings.

#### Scenario: Package manifest no longer references React Navigation

- **WHEN** `package.json` is inspected after the retire phase
- **THEN** `dependencies` and `devDependencies` SHALL NOT contain `@react-navigation/native`, `@react-navigation/bottom-tabs`, or `@types/react-navigation/*`.

### Requirement: Routing change preserves existing test suite

The change MUST keep all existing tests green (96 tests across 21 suites) and MUST NOT modify any test under `src/features/class-booking/`. New render tests are added in `src/app/__tests__/`:

- `RootLayout.test.tsx` — asserts the root layout (1) calls `buildProductionComposition` exactly once with `AsyncStorage`-shaped storage, (2) mounts the route tree on first render, (3) keeps the route tree mounted when `initializeBookings` rejects, (4) fires `initializeBookings.execute()` in the background, and (5) exposes the composition value through the `CompositionProvider` context boundary.
- `ClaseDetail.test.tsx` — asserts the placeholder reads `claseId` from `useLocalSearchParams` and renders it verbatim.

Domain, application, and infrastructure tests SHALL remain untouched.

#### Scenario: Full test suite remains green

- **WHEN** `pnpm test` runs after the change
- **THEN** the suite SHALL report all 96 prior tests passing plus the new render tests passing
- **AND** no test file under `src/features/class-booking/` SHALL be modified by this change.

#### Scenario: Quality gates pass

- **WHEN** `pnpm typecheck`, `pnpm lint`, and `npx expo export --platform android` run after the change
- **THEN** all three SHALL succeed with zero errors and zero warnings.

