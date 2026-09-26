# Tasks: fix-upcoming-classes-booking-success-modal

## Review Workload Forecast

| Field                   | Value                                              |
| ----------------------- | -------------------------------------------------- |
| Estimated changed lines | 15–25 (one screen, plus OpenSpec artifacts)        |
| 400-line budget risk    | None                                               |
| Chained PRs recommended | No                                                 |
| Delivery strategy       | bugfix (half-done migration from PR #8)              |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single PR
400-line budget risk: None

## Suggested Work Units (mapped to commits)

| Unit | Goal                                                              | Commit              |
| ---- | ----------------------------------------------------------------- | ------------------- |
| 1    | Wire `BookingSuccessSheet` in `UpcomingClassesScreen`, remove the toast | `fix(classes)` |
| 2    | OpenSpec change artifacts                                          | `docs(openspec)`    |

## Phase 1: Fix

- [x] 1.1 Replace the `{feedback ? <View>...toast...</View> : null}` block with `<BookingSuccessSheet visible onDismiss={...}>`.
- [x] 1.2 Add the `BookingSuccessSheet` import.
- [x] 1.3 Remove the unused `feedback` and `feedbackText` styles.

## Phase 2: OpenSpec change artifacts

- [x] 2.1 `proposal.md`, `design.md`, `tasks.md`.

## Verification (must pass before archive)

- [x] `pnpm typecheck` clean
- [x] `pnpm lint` 0 warnings
- [x] `pnpm test` 81/81
- [x] `npx expo export --platform android` bundles cleanly

## Follow-up (not in this PR)

- Strengthen the screen test by mocking `BookingSuccessSheet` and asserting it was rendered (instead of relying on the inner-content tests in `SuccessSheet.test.tsx`).
- Avoid splitting screen-wiring commits from component-creation commits in the future. Validate each commit's diff before pushing.