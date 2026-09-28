# Feature: expo-router routing

Branch: `feature/setup-expo-typescript` (current)
Owner: orchestrator + worker subagents
Decision 2026-09-27: user picked **NativeTabs** (`expo-router/unstable-native-tabs`) over the JS-only `<Tabs>` from the previous attempt. Visual identity WILL change to native iOS UITabBar / Android Material 3 bottom navigation — `FloatingTabBar` and `TabBarIcons` get retired (no reuse).

## Goal

Replace `@react-navigation/bottom-tabs` + hand-rolled `RootTabs` with a file-based `expo-router` tree at `src/app/`. Two top-level tabs (`Clases`, `Mis reservas`) become native tabs. The hexagonal feature is untouched; only the routing layer + `App.tsx` change. After the change, no `@react-navigation/*` package is referenced anywhere.

## Non-goals

- No new use case, port, adapter, or domain rule.
- No detail-screen implementation (placeholders only).
- No typedRoutes codegen, no server actions, no web support.
- No merge to `develop` from this session. Everything stays on `feature/setup-expo-typescript`.

## Hexagonal guardrails

- `src/app/` is a new thin routing layer: layouts, providers, re-exports. **Forbidden imports**: `@features/class-booking/{domain,application,infrastructure}/**`.
- `buildProductionComposition({ storage })` lives in `src/app/_layout.tsx` — the composition root boundary is preserved (only `composition.ts` knows concrete adapters).
- `App.tsx` becomes a one-liner re-export of the layout.
- The four open OpenSpec changes (`feat-animations`, `feat-modal-polish`, `redesign-booking-card`, `ui-redesign-clases-screen`) MUST stay green.

## Work units (mirror the OpenSpec tasks.md)

| # | Unit | Commit prefix | Status |
| - | ---- | ------------- | ------ |
| 1 | Bootstrap (deps + scheme + placeholder layout) | `chore(routing)` | pending |
| 2 | Root layout with hydration + composition gate | `feat(routing)` | pending |
| 3 | NativeTabs root (drop FloatingTabBar) | `feat(routing)` | pending |
| 4 | Index re-exports | `feat(routing)` | pending |
| 5 | Dynamic placeholders | `feat(routing)` | pending |
| 6 | Retire legacy navigation + drop @react-navigation/* | `refactor(routing)` | pending |
| 7 | Verification (typecheck + lint + 96+ tests + expo export) | `test(routing)` | pending |

Each unit closes with a Conventional Commit (no `Co-Authored-By:`). The feature stays on the branch until every unit is green.

## Verification gates (run after every unit)

- `pnpm typecheck` → 0 errors
- `pnpm lint` → 0 warnings
- `pnpm test` → 96 prior tests + new red→green tests, all passing
- `npx expo export --platform android` → exits 0

## OpenSpec change

`openspec/changes/feat-expo-router-routing/` carries the proposal, design, delta spec, and task breakdown that mirrors this document. The previous attempt's artifacts are recoverable from git history (`bf8a558^:openspec/changes/feat-expo-router-routing/...`) and serve as the seed — they are re-validated and adjusted for the **NativeTabs** decision before being committed.

## Evidence

- Implementation commits land with `odd/tasks/feat-expo-router-routing.md` updated in the same commit body.
- OpenSpec artifacts stay in sync: when a task flips to `done` here, the matching checkbox in `openspec/changes/feat-expo-router-routing/tasks.md` flips too.
- Final unit (`test(routing)`) records the four CLI exit codes (typecheck / lint / test / expo export) plus the OpenSpec validate output.

## Next step

Generate the OpenSpec change artifacts (proposal / design / specs / tasks) and commit them on `feature/setup-expo-typescript`. Then start Unit 1.