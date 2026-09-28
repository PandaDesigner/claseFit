# feat-expo-router-routing — design

## Context

The app shipped PRs #1–#3 with two screens (`UpcomingClassesScreen`,
`MyBookingsScreen`) wired through a hand-rolled `src/navigation/RootTabs.tsx` on
top of `@react-navigation/bottom-tabs`. That wiring lived **outside** the
feature folder, gave no obvious place for future detail screens or per-route
layouts, and forced `package.json` to point at `App.tsx` + `index.ts` mounted
with `registerRootComponent`.

This change moves the app to **file-based routing** with `expo-router`, drops
the hand-rolled `RootTabs`, deletes the dead `App.tsx` / `index.ts`, and keeps
the routing layer (`src/app/`) **thin**: layouts and re-exports only, no
business logic. The `class-booking` feature and its domain / application /
infrastructure trees are untouched.

Constraints that shaped every decision below:

- Expo SDK 57 + React Native 0.86 (do not force a peer-dep cascade).
- `<Tabs>` JS wrapper, not `<NativeTabs>` (the installed SDK does not export
  `unstable-native-tabs`; switching would require upgrading expo-router).
- The composition bootstrap stays the **single door** to concrete adapters;
  `src/app/` only consumes `useComposition()` through `CompositionProvider`.
- All previously-green tests must remain green at every commit.
- `pnpm typecheck`, `pnpm lint 0 warnings`, `pnpm test`,
  `npx expo export --platform android` must all pass.

## Goals / Non-Goals

**Goals:**

- File-based routes under `src/app/` for the root `<Tabs>` and two tab groups
  (`(proximas)`, `(reservas)`), each group owning its own `<Stack>` shell ready
  for future detail screens.
- Canonical entry point `expo-router/entry` (no hand-written `App.tsx`,
  no `index.ts` with `registerRootComponent`).
- `FloatingTabBar` and `TabBarIcons` moved into
  `src/features/class-booking/presentation/components/` — presentational JSX
  belongs to the feature, not the routing layer.
- Babel config that lets `expo-router`'s `Route.js` resolve routes through
  `babel-preset-expo` (the Expo default for SDK 57).
- Boot the dev server with `expo start --android` / `--ios` (matches the
  `expo` CLI conventions; the old `expo start` default is acceptable but the
  per-platform scripts are the canonical launch path).

**Non-Goals:**

- No change to `domain/`, `application/`, `infrastructure/`, or any
  `presentation/components|hooks` inside `src/features/class-booking/`.
- No new bounded context, no new use case, no new query.
- **No detail routes yet.** No `(proximas)/clase/[claseId].tsx` or
  `(reservas)/reserva/[reservaId].tsx` — the feature does not have those
  screens today, and adding speculative plumbing would violate the thin-shell
  rule.
- No deep-link *handler* business logic (the URL scheme is registered, but
  actions on deep links are deferred).
- No web support (mobile-only).
- No `<NativeTabs>`, no typed routes, no EAS Hosting — none ship in the
  installed SDK 57 + expo-router 4.0.22 combo.
- No replacement of `src/shared/ui/` primitives.
- **No merge to `develop`** from this session. Everything stays on
  `feature/setup-expo-typescript` until the change is verified.

## Decisions

### 1. `expo-router@4.0.22` + JS `<Tabs>`, not `<NativeTabs>`

The installed `expo-router` does **not** export `unstable-native-tabs`; that
API lives on later versions. Upgrading was out of scope because it would force
a peer-dep cascade across Expo SDK 57 + React Native 0.86. The JS `<Tabs>`
wrapper keeps the existing `FloatingTabBar` visual identity byte-equivalent
and ships behind a single `tabBar` prop — zero new code on the presentation
side.

### 2. Routing layer is a thin shell — `FloatingTabBar` lives in the feature

`src/app/_layout.tsx` only owns hydration, `<CompositionProvider>`,
`<SafeAreaProvider>`, and the `<Tabs>` surface. The tab groups
`(proximas)/_layout.tsx` and `(reservas)/_layout.tsx` are `<Stack>` shells
with no logic. The screen `index.tsx` files re-export the feature screens
without wrapping or transforming them. `FloatingTabBar` and `TabBarIcons`
live under `src/features/class-booking/presentation/components/` because
they are presentational JSX tied to the class-booking feature — not routing
plumbing.

### 3. `expo-router/entry` is the canonical entry — no `App.tsx`, no `index.ts`

`registerRootComponent` from `expo` mounts `App` directly, bypassing
expo-router's `RootContainer` which supplies `CurrentRouteContext`. Without
that context, `useRouteNode()` returns `null` and `useContextKey()` throws
`No filename found. This is likely a bug in expo-router.` at first render.
`expo-router/entry` is the canonical entry: it runs
`renderRootComponent(App)` with the qualified `App` from
`expo-router/build/qualified-entry`, which wires `RootContainer` and
auto-discovers `src/app/_layout.tsx`. Bundle output switched from
`index-*.hbc` to `entry-*.hbc`, confirming Metro resolved through
`expo-router/entry`. The previous `App.tsx` (one-line re-export) and
`index.ts` were dead code; both deleted.

### 4. `query-string` declared as a direct dependency (phantom dep)

`expo-router@4.0.22` performs `require("query-string")` but does NOT declare
it in `dependencies` or `peerDependencies`. pnpm's strict resolution does
not expose it at `node_modules/query-string`, so Metro bundling for Android
fails with `Unable to resolve "query-string" from
expo-router/build/fork/getPathFromState.js`. Fix: add `query-string@^9.5.1`
as a direct dependency. Bundle succeeds (`npx expo export --platform android`
produces a 2.1 MB Hermes bytecode bundle).

### 5. `@react-navigation/bottom-tabs` stays as a direct dependency

`FloatingTabBar` consumes `BottomTabBarProps` directly. `@react-navigation/native`
is dropped — nothing in the new tree uses `NavigationContainer` or its hooks
after the routing layer migrates to expo-router's `<Tabs>`.

### 6. `babel-preset-expo` as a direct devDependency + `babel.config.js`

The Expo default for SDK 57 is `babel-preset-expo`, but it does not come
transitively through `expo` in this pnpm setup. Without an explicit
`babel.config.js` declaring the preset, Metro picks up no babel config and
`expo-router`'s `Route.js` cannot resolve routes. Fix is two pieces:
declare `babel-preset-expo` as a direct `devDependency`, and add a minimal
`babel.config.js` that exports it.

### 7. Patch `@expo/metro-runtime` ESM/CJS interop on RN 0.86

`@expo/metro-runtime` shipped an ESM-only build that does not interop with
the CommonJS resolver path Metro uses under RN 0.86. Runtime crashes on
first render with `Unable to resolve module @expo/metro-runtime`. Fix is
a `patches/` override that forces the CJS entry; the patch is a single
`package.json#exports` remap. Patch lives in `patches/` so `pnpm install`
re-applies it deterministically (verified via `pnpm install` clean run).

### 8. Drop obsolete `expo` packages after SDK 57 alignment

After aligning to Expo SDK 57, several `expo-*` packages left over from
SDK 51 are no longer referenced. They are dropped to keep `package.json`
honest and to remove phantom peer warnings.

### 9. Composition snapshot length aligned with the extended fixture

`Composition.test.ts` asserts the size of the hydrated class list. The
fixture was extended (C-11/C-12/C-13 added in 67a4d76) but the assertion
was not updated, so the test failed against the shipped code. Fix is
mechanical: bump the expected length in the snapshot.

### 10. Dev scripts switch to `expo start --android` / `--ios`

`expo start` (no flag) opens the dev menu picker; `--android` and `--ios`
launch directly into the platform-specific dev client. Per-platform
scripts are the canonical launch path on a developer machine and match
the Expo docs for SDK 57.

## Files created or modified

```
openspec/changes/feat-expo-router-routing/
├── proposal.md                       (existing — aligned with shipped impl)
├── design.md                         (this file)
├── tasks.md
└── specs/app-routing/spec.md

src/app/_layout.tsx                    (new — root layout, hydration, <Tabs>)
src/app/(proximas)/_layout.tsx        (new — <Stack> shell)
src/app/(proximas)/index.tsx          (new — re-exports UpcomingClassesScreen)
src/app/(reservas)/_layout.tsx        (new — <Stack> shell)
src/app/(reservas)/index.tsx          (new — re-exports MyBookingsScreen)

src/features/class-booking/presentation/components/
├── FloatingTabBar.tsx                (moved from src/navigation/components/)
└── TabBarIcons.tsx                   (moved from src/navigation/components/)

src/navigation/RootTabs.tsx           (deleted)
src/navigation/                       (folder deleted — empty)
App.tsx                               (deleted — dead with canonical entry)
index.ts                              (deleted — dead with canonical entry)

app.json                              (scheme: "clasefit")
babel.config.js                       (new — exports babel-preset-expo)
package.json                          (main: "expo-router/entry"; scripts: --android/--ios; deps: expo-router, expo-linking, expo-constants, query-string, babel-preset-expo; removed @react-navigation/native)
patches/@expo+metro-runtime+*.patch   (new — ESM/CJS interop override)
```

## Affected ports

- None. `BookingRepository`, `BookingStateStore`, `Clock`,
  `AsyncStorageBookingRepository`, `buildProductionComposition` are
  unchanged. `src/app/_layout.tsx` consumes the same `useComposition()`
  hook through the existing `CompositionProvider`.

## TDD cycle per task

Routing changes are wiring + composition bootstrap, not behavior. Existing
tests must remain green at every step. The one test that had to change is
`Composition.test.ts`, where the snapshot length assertion was updated to
match the extended fixture (see Decision #9). RED → GREEN was a single
character in the assertion; no REFACTOR was needed.

## Risks

- **`<Tabs>` JS wrapper renders on JS thread.** Performance is identical to
  the previous `@react-navigation/bottom-tabs` setup, so no regression; if a
  future change needs `<NativeTabs>`, the upgrade is gated behind a separate
  change (SDK upgrade).
- **Phantom-dep patches rot.** `query-string` and the `@expo/metro-runtime`
  patch both assume upstream does not declare the missing peer. If
  `expo-router` ships a fixed release, the patch must be removed and the
  direct dep dropped. Documented in `Follow-up`.
- **`FloatingTabBar` visual drift.** Moving the component into the feature
  keeps its imports identical (still pulls `BottomTabBarProps` from
  `@react-navigation/bottom-tabs`), so the visual output is byte-equivalent.
  Verified with screenshot comparison against PR #3 baseline.
- **Schema change to `app.json`.** Adding `scheme: "clasefit"` does not break
  any existing URL (the app has no prior scheme). No deeplink handlers are
  added in this change.

## Verification

- `pnpm typecheck` clean
- `pnpm lint` 0 warnings
- `pnpm test` 96/96 passing (composition snapshot updated; 67dc144 regenerated
  the lockfile after stack install)
- `npx expo export --platform android` produces a 2.1 MB Hermes bundle
  (`entry-*.hbc`, not `index-*.hbc`)

## Follow-up (not in this PR)

- Drop the `query-string` direct dep once `expo-router` declares it as a
  peer. Track upstream PR.
- Drop the `@expo/metro-runtime` interop patch once the SDK 57 release ships
  a CJS entry. Track upstream PR.
- Per-class and per-booking detail routes
  (`(proximas)/clase/[claseId].tsx`, `(reservas)/reserva/[reservaId].tsx`)
  when the feature grows those screens.
- Deep-link handlers (URL scheme `clasefit://` is registered but no business
  actions wired).
- Migrate to `<NativeTabs>` after the expo-router upgrade lands.