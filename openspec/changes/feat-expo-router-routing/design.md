## Context

ClaseFit currently mounts its two screens through a hand-rolled navigation tree at `src/navigation/RootTabs.tsx` built on `@react-navigation/bottom-tabs`. The composition bootstrap (`CompositionProvider`, `SafeAreaProvider`, hydration of `initializeBookings`) lives in `App.tsx` and references `RootTabs` directly. The two feature screens — `UpcomingClassesScreen` and `MyBookingsScreen` — already exist inside the hexagonal feature and are wired correctly through `useComposition`.

This change is a **routing restructure** only. The goal is to:

- move from imperative `RootTabs` glue to **file-based routing** via `expo-router`;
- keep every existing screen, component, hook, and the entire hexagonal feature **byte-for-byte equivalent** (the visual design is untouchable per project rules);
- prepare the tree for future detail screens (deep links, dynamic routes) without committing to their business behavior yet;
- drop the `@react-navigation/*` packages once the new tree mounts.

The hexagonal dependency rule (`presentation → application → domain`) and the composition-root boundary (`composition.ts` is the only door to concrete adapters) remain in force. `src/app/` is a new layer that **only** mounts, hydrates, and re-exports — it owns no business logic.

## Goals / Non-Goals

**Goals**

- Replace `App.tsx` + `src/navigation/RootTabs.tsx` + `FloatingTabBar.tsx` + `TabBarIcons.tsx` with an `expo-router` file-based tree at `src/app/`.
- Mount a `<NativeTabs>` root with two tabs (`(proximas)`, `(reservas)`) that re-export the existing feature screens.
- Register `expo-router` as the Expo entry by exporting `RootLayout` from `src/app/_layout.tsx` through the existing `index.ts`.
- Preserve the floating tab bar visual identity (black pill, bottom safe-area inset, active-tab highlight) by re-implementing the same `View` composition inside the `NativeTabs` `tabBar` slot.
- Prepare two dynamic route placeholders (`(proximas)/clase/[claseId].tsx`, `(reservas)/reserva/[reservaId].tsx`) that render only the dynamic param.
- Register the URL scheme `clasefit` in `app.json` so deep links resolve.
- Remove `@react-navigation/native`, `@react-navigation/bottom-tabs`, and related types from `package.json`.

**Non-Goals**

- No change to `src/features/class-booking/{domain,application,infrastructure,presentation}/**`.
- No new use case, query, port, or adapter.
- No real implementation of the placeholder detail screens — they remain text stubs.
- No deep-link dispatcher for business actions.
- No web support (mobile-only).
- No typed-routes codegen, no server actions, no `expo-router` plugin beyond the default.

## Decisions

### D1 — Use `expo-router` 4.x stable on Expo SDK 57

`expo-router` 4.x is the latest stable line matching Expo SDK 57 (peer-compatible with React 19, React Native 0.86, `react-native-screens` 4.26). 5.x is experimental at this SDK. We pin to the 4.x line for stability; bumping to 5.x is a separate change.

**Alternatives considered**

- Stay on `@react-navigation/bottom-tabs`. Rejected: doesn't give file-based routing, dynamic placeholders, or future-proof deep links.
- `@react-navigation/native-stack` + custom file resolver. Rejected: reinvents expo-router with no upside.

### D2 — `src/app/` colocated with the feature, not at the repo root

The router tree lives at `src/app/` (not `./app/` at the repo root) so:

- `tsconfig.json` `paths` (`@features/*`, `@shared/*`) keep working without new root entries;
- the import rule "no barrels, concrete paths only" is preserved (each screen is re-exported via `export { X } from '@features/class-booking/presentation/screens/<name>'`);
- the visual design system in `src/shared/ui/` keeps its existing aliases.

The Expo entry stays the same: `index.ts` continues to `registerRootComponent(App)`, but `App` now re-exports `RootLayout` from `src/app/_layout.tsx`. This keeps `expo export --platform android` working without changing the public entry surface.

### D3 — `<NativeTabs>` root, not `<Stack>` + manual tabs

`<NativeTabs>` ships native-feeling bottom tabs on iOS/Android and accepts a `tabBar` slot for custom rendering. We use it because:

- it removes the need for a manual `<NavigationContainer>`;
- the floating tab bar fits inside `tabBar` as a styled `View` with the same metrics as the old `FloatingTabBar`;
- it gives a native headerless tab surface that matches the existing UX (no header above the lists, custom floating bar below).

**Alternatives considered**

- `<Tabs>` (web-style). Rejected: looks wrong on mobile.
- `<Stack>` with manual tab implementation. Rejected: more code, same UX, no upside.

### D4 — Routing boundary: `src/app/` is re-exports and layouts only

To enforce the hexagonal rule and the new "routing thin" principle, every file under `src/app/` is restricted to:

- provider composition (`SafeAreaProvider`, `CompositionProvider`, hydration `useEffect`);
- `<NativeTabs>`, `<Stack>`, `<Tabs.Trigger>`;
- `<Link>`, `useRouter`, `useLocalSearchParams`;
- `export { X } from '<concrete path>'` for the two index files.

`src/app/` is forbidden from importing:

- `@features/class-booking/domain/**`;
- `@features/class-booking/application/**`;
- `@features/class-booking/infrastructure/**`.

This is enforced by code review (GGA) and by `pnpm lint` rules — no new ESLint plugin in this change.

### D5 — CompositionProvider boundary is preserved

`CompositionProvider` (defined in `src/features/class-booking/compositionProvider.tsx`) keeps its single responsibility: expose the composition object built by `composition.ts`. The root layout (`src/app/_layout.tsx`) is the only place that calls `buildProductionComposition({ storage: AsyncStorage })`. Feature screens keep calling `useComposition()` exactly as today. No port or adapter changes.

### D6 — Dynamic placeholders are render-only stubs

`src/app/(proximas)/clase/[claseId].tsx` and `src/app/(reservas)/reserva/[reservaId].tsx` render a single `<Text>` with the dynamic param read via `useLocalSearchParams<{ claseId: string }>()`. They do not call `useComposition`, do not import feature modules, and do not trigger navigation effects. They exist so that future changes can fill them in without re-plumbing the router.

**Alternatives considered**

- Skip the placeholders and add them later. Rejected: the user explicitly asked to keep the dynamic route flow prepared, even though the business logic lives in the feature.
- Render a real screen that calls a feature query. Rejected: violates "routing thin" and would creep feature behavior into `src/app/`.

### D7 — URL scheme registered for future deep links

`expo.scheme: "clasefit"` is added to `app.json` so deep links like `clasefit://clase/C-09` resolve. This change registers the scheme but does **not** wire a deep-link dispatcher to business actions. Wiring a dispatcher is a future change that will own its own OpenSpec cycle.

### D8 — Floating tab bar visuals re-implemented inline

The old `src/navigation/components/FloatingTabBar.tsx` and `TabBarIcons.tsx` are deleted; their visual identity is rebuilt inside the `NativeTabs` `tabBar` slot as a styled `View` + two inline `View`-based icons (no SVG library). The colors, radius, padding, and safe-area math are byte-equivalent to the original implementation, satisfying the "design is untouchable" rule.

### D9 — TDD with red tests for routing behaviors

Every behavior introduced in this change gets a red test first:

- The hydration gate (loading indicator before children) — red test in `RootLayout.test.tsx`.
- The dynamic-param stub (`useLocalSearchParams`) — red test in `ClaseDetail.test.tsx`.
- The legacy-navigation retire — red test that asserts no `@react-navigation/*` imports remain (a `grep`-style assertion plus `pnpm typecheck`).

Domain and application tests are not modified — they remain green throughout.

## Risks / Trade-offs

- **[Risk] expo-router minor upgrades can break file conventions** → Pin to `^4.x` in `package.json`; revisit only in a dedicated upgrade change.
- **[Risk] `<NativeTabs>` API churn between minor versions** → Same mitigation; tests pin the surface (`tabBar` slot, default tab).
- **[Risk] Re-exporting a screen changes its `default` export to a named re-export** → Use `export { UpcomingClassesScreen } from '<path>'`, never `export default`. The feature screens already use named exports.
- **[Risk] Stale references to `App.tsx` in tests or tooling** → `App.tsx` becomes a one-liner that re-exports `RootLayout`; `pnpm test` and `pnpm typecheck` will catch leftovers.
- **[Risk] Visual drift on the tab bar** → Re-implement the same `View` metrics (`paddingBottom = insets.bottom + md`, active highlight `rgba(255,255,255,0.10)`); manual visual diff vs. the previous APK is part of the verification gate.
- **[Risk] Placeholders may be wired to business logic later without an OpenSpec change** → The "routing thin" rule + GGA review prevent this; if a future change wants real behavior, it will live in `src/app/.../[id].tsx` only after proposing its own change.

## Migration Plan

The change ships in **one branch** in **seven phases**, each one a work-unit commit. Every phase ends with `pnpm typecheck && pnpm lint && pnpm test` green before moving on.

1. **Phase 1 — Install.** Add `expo-router`, `expo-linking`, `expo-constants`. Update `app.json` (`scheme`, `experiments.typedRoutes`). Set `main` to `expo-router/entry` via `index.ts`. Verify with `npx expo export --platform android`.
2. **Phase 2 — Root layout.** Write `RootLayout.test.tsx` (red), add `src/app/_layout.tsx` (green) wrapping `<CompositionProvider>` + `<SafeAreaProvider>` + `<NativeTabs>` and the hydration effect. Refactor for clarity.
3. **Phase 3 — Tab groups.** Add `src/app/(proximas)/_layout.tsx` + `src/app/(reservas)/_layout.tsx` with `<Stack screenOptions={{ headerShown: false }}>` and the floating tab bar inline.
4. **Phase 4 — Index re-exports.** Add `src/app/(proximas)/index.tsx` and `src/app/(reservas)/index.tsx`, each a single named re-export of the feature screen.
5. **Phase 5 — Dynamic placeholders.** Add `ClaseDetail.test.tsx` (red), add `src/app/(proximas)/clase/[claseId].tsx` (green), add `src/app/(reservas)/reserva/[reservaId].tsx`.
6. **Phase 6 — Retire legacy.** Update `App.tsx` to re-export `RootLayout`. Delete `src/navigation/RootTabs.tsx`, `src/navigation/components/FloatingTabBar.tsx`, `src/navigation/components/TabBarIcons.tsx`. Remove `@react-navigation/*` from `package.json`. Run `pnpm typecheck` to confirm zero unresolved imports.
7. **Phase 7 — Verify.** `pnpm typecheck`, `pnpm lint 0 warnings`, `pnpm test` (96 + 2 = 98 tests), `npx expo export --platform android`.

**Rollback.** Every phase is a separate work-unit commit on the branch. To abort, revert the branch to the commit before Phase 1; the legacy tree and `App.tsx` remain intact until Phase 6 deletes them.

## Open Questions

None for this change. Deep-link dispatcher wiring, real detail-screen implementations, and web support are explicit non-goals and will get their own OpenSpec cycles when prioritized.
