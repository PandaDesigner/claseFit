# Tasks: feat-expo-router-routing

## Review Workload Forecast

| Field                   | Value                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| Estimated changed lines | 250–350 (5 new route files, 2 moved components, package.json, babel.config.js, patches, app.json) |
| 400-line budget risk     | None — at the upper end but under budget; the diff is wiring, not logic                            |
| Chained PRs recommended | No — single PR; the change ships only after `expo export --platform android` bundles cleanly       |
| Delivery strategy       | Setup-only (no business logic touched)                                                             |

Decision needed before apply: No — the change is already shipped on
`feature/setup-expo-typescript`; this document retroactively records the
work units.
Chained PRs recommended: No
Chain strategy: single PR
400-line budget risk: None

## Suggested Work Units (mapped to commits)

| Unit | Goal                                                            | Commit                                                                 |
| ---- | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1    | Routing scaffolding: `src/app/`, move `FloatingTabBar`          | `2469e42 feat(routing)`                                                |
| 2    | Canonical entry, drop dead `App.tsx` / `index.ts`               | `55b8351 fix(routing)`                                                 |
| 3    | `TAB_CONFIG.routeName` aligned with expo-router screen names    | `5e57f25 fix(tab-bar)`                                                 |
| 4    | Add `expo-router` + peers (`expo-linking`, `expo-constants`)    | `52dd2f3 chore(deps)`                                                  |
| 5    | `query-string` declared direct (phantom dep)                    | `c145e82 fix(deps)`                                                    |
| 6    | `@expo/metro-runtime` ESM/CJS interop patch                     | `3b4877a fix(deps)`                                                    |
| 7    | `babel-preset-expo` declared direct                             | `e2eb946 fix(deps)`                                                    |
| 8    | Drop obsolete `expo-*` packages, align to SDK 57                | `d8a7a40 fix(deps)`                                                    |
| 9    | Regenerate `pnpm-lock` after stack install                      | `67dc144 chore(deps)`                                                  |
| 10   | `babel.config.js` with `babel-preset-expo`                      | `4af67b9 fix(setup)`                                                   |
| 11   | Dev scripts use `expo start --android` / `--ios`                | `6997c61 chore(scripts)`                                               |
| 12   | `Composition.test.ts` snapshot length matches extended fixture  | `be6f1c4 test(composition)`                                            |
| 13   | OpenSpec `proposal.md` aligned with shipped implementation      | `5b83ee8 docs(openspec)`                                               |
| 14   | OpenSpec `design.md` + `tasks.md` + `specs/app-routing/spec.md` | `docs(openspec)`                                                       |

## Phase 1: Routing scaffolding

- [x] 1.1 Install `expo-router` + peers and create `src/app/_layout.tsx`
      with `<CompositionProvider>`, `<SafeAreaProvider>`, and `<Tabs>`.
- [x] 1.2 Add `src/app/(proximas)/_layout.tsx` + `index.tsx` re-exporting
      `UpcomingClassesScreen`.
- [x] 1.3 Add `src/app/(reservas)/_layout.tsx` + `index.tsx` re-exporting
      `MyBookingsScreen`.
- [x] 1.4 Move `src/navigation/components/FloatingTabBar.tsx` and
      `TabBarIcons.tsx` into `src/features/class-booking/presentation/components/`.
- [x] 1.5 Set `app.json` `expo.scheme = "clasefit"`.

## Phase 2: Dependency stack (SDK 57 + expo-router 4.0.22)

- [x] 2.1 Add `expo-router@4.0.22`, `expo-linking@7.0.5`,
      `expo-constants@17.0.8` as direct dependencies.
- [x] 2.2 Add `query-string@^9.5.1` as a direct dependency (phantom dep
      of `expo-router@4.0.22`); Metro can now resolve
      `expo-router/build/fork/getPathFromState.js`.
- [x] 2.3 Add the `patches/@expo+metro-runtime+*.patch` override forcing
      CJS entry under RN 0.86; `pnpm install` re-applies it.
- [x] 2.4 Add `babel-preset-expo` as a direct `devDependency`.
- [x] 2.5 Drop obsolete `expo-*` packages no longer referenced after the
      SDK 57 alignment.
- [x] 2.6 Regenerate `pnpm-lock.yaml` after the stack install.
- [x] 2.7 Remove `@react-navigation/native` (no consumer after the
      routing layer migrates to expo-router's `<Tabs>`); keep
      `@react-navigation/bottom-tabs` for `BottomTabBarProps`.

## Phase 3: Babel setup

- [x] 3.1 Add `babel.config.js` exporting `babel-preset-expo` so Metro
      picks up the Expo default and `expo-router`'s `Route.js` can
      resolve routes through it.

## Phase 4: Dev scripts

- [x] 4.1 Replace the bare `expo start` with `expo start --android` and
      `expo start --ios` so each platform script launches directly
      into the platform-specific dev client.

## Phase 5: Composition test snapshot

- [x] 5.1 Update `Composition.test.ts` snapshot length to match the
      extended fixture (C-11/C-12/C-13 added in 67a4d76). RED → GREEN
      was a single character in the assertion; no REFACTOR needed.

## Phase 6: Canonical entry + dead code removal

- [x] 6.1 Set `package.json#main` to `"expo-router/entry"`.
- [x] 6.2 Delete `App.tsx` and `index.ts` (both were dead with the
      canonical entry; the routing layer migrates off `registerRootComponent`).
- [x] 6.3 Delete `src/navigation/RootTabs.tsx` and the empty
      `src/navigation/` folder.
- [x] 6.4 Align `TAB_CONFIG.routeName` with the expo-router screen
      names so `FloatingTabBar` highlights the correct tab on first
      render.

## Phase 7: OpenSpec change artifacts

- [x] 7.1 `proposal.md` aligned with the shipped implementation
      (decisions, impact, non-goals).
- [x] 7.2 `design.md` with context, decisions, files, risks,
      verification.
- [x] 7.3 `tasks.md` (this file) with phases, work-unit mapping,
      verification, follow-up.
- [x] 7.4 `specs/app-routing/spec.md` with the delta spec for the
      `app-routing` capability.

## Verification (must pass before archive)

- [x] `pnpm typecheck` clean
- [x] `pnpm lint` 0 warnings
- [x] `pnpm test` 96/96 passing (`Composition.test.ts` snapshot updated
      in Phase 5)
- [x] `npx expo export --platform android` produces a 2.1 MB Hermes
      bytecode bundle (`entry-*.hbc`, not `index-*.hbc` — confirms Metro
      resolved through `expo-router/entry`)

## Follow-up (not in this change)

- Drop the `query-string` direct dep once `expo-router` declares it as
  a peer. Track upstream PR.
- Drop the `@expo/metro-runtime` interop patch once the SDK 57 release
  ships a CJS entry. Track upstream PR.
- Per-class and per-booking detail routes
  (`(proximas)/clase/[claseId].tsx`,
  `(reservas)/reserva/[reservaId].tsx`) when the feature grows those
  screens.
- Deep-link handlers — the `clasefit://` scheme is registered but no
  business actions are wired.
- Migrate to `<NativeTabs>` after the expo-router upgrade lands.
- **No merge to `develop`** from this session — the change stays on
  `feature/setup-expo-typescript` until verified.