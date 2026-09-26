# Tasks: feat-animations

## Review Workload Forecast

| Field                   | Value                                |
| ----------------------- | ------------------------------------ |
| Estimated changed lines | 80–120 (3 files, mostly styles + a small `Animated` block) |
| 400-line budget risk    | None                                 |
| Chained PRs recommended | No                                   |
| Delivery strategy       | UX-only                              |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single PR
400-line budget risk: None

## Suggested Work Units (mapped to commits)

| Unit | Goal                                                              | Commit              |
| ---- | ----------------------------------------------------------------- | ------------------- |
| 1    | Pill press scale (`transform: scale(0.97)` on press)              | `feat(ux)`          |
| 2    | BrandHeader fade + slide-in on mount (`Animated.timing`)          | `feat(ux)`          |
| 3    | Day section headers fade in (`Animated.View` + `onLayout`)          | `feat(ux)`          |
| 4    | OpenSpec change artifacts                                         | `docs(openspec)`    |

## Phase 1: Pill press scale

- [x] 1.1 Update the Pill `pressed` style to include `transform: [{ scale: 0.97 }]`.

## Phase 2: BrandHeader fade + slide-in

- [x] 2.1 Initialize `Animated.Value`s for opacity (0 → 1) and translateY (-8 → 0).
- [x] 2.2 On mount, run `Animated.parallel` with `useNativeDriver: true`, duration 320 ms.
- [x] 2.3 Wrap the inner `View` in `Animated.View`; the outer `SafeAreaView` stays static.

## Phase 3: Day section headers

- [x] 3.1 Build a small `<FadeInOnView>` helper that runs `Animated.timing(opacity, { toValue: 1, duration: 180 })` on first mount or first onLayout within 80 % of the list viewport.
- [x] 3.2 Use the helper in `UpcomingClassesScreen` and `MyBookingsScreen` `renderSectionHeader`.

## Phase 4: OpenSpec change artifacts

- [x] 4.1 `proposal.md`, `design.md`, `tasks.md`, `specs/class-booking/spec.md`.

## Verification (must pass before archive)

- [x] `pnpm typecheck` clean
- [x] `pnpm lint` 0 warnings
- [x] `pnpm test` 76/76 passing
- [x] `npx expo export --platform android` bundles cleanly

## Follow-up (not in this PR)

- Per-card entry animation (e.g., staggered fade-in on first paint). Currently out of scope to keep the cards still while scanning.
- Reduced-motion handling (`AccessibilityInfo.isReduceMotionEnabled` → skip animations). Needs product sign-off first.
- Cancellation sheet animation (currently relies on React Native's `Modal` default).