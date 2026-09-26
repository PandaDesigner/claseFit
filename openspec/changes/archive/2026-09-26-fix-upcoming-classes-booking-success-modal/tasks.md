# Tasks: fix-upcoming-classes-booking-success-modal

## Review Workload Forecast

| Field                   | Value                                  |
| ----------------------- | -------------------------------------- |
| Estimated changed lines | docs only (no production code change)  |
| 400-line budget risk    | None                                   |
| Chained PRs recommended | No                                     |
| Delivery strategy       | retrospective documentation correction |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single PR
400-line budget risk: None

## Suggested Work Units (mapped to commits)

| Unit | Goal                                                                                                                                                                      | Commit           |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 1    | Rewrite `proposal.md`, `design.md`, and `specs/class-booking/spec.md` to describe the in-app `SuccessCheckmark` overlay that is currently shipped (post-revert `1d0a59b`) | `docs(openspec)` |

## Phase 1: PR #9 (original Modal fix — completed and later superseded)

- [x] 1.1 PR #9 wired `<BookingSuccessSheet>` (Modal) into `UpcomingClassesScreen` (commit `0901c40`).
- [x] 1.2 Removed the unused `feedback` / `feedbackText` styles.
- [x] 1.3 `proposal.md`, `design.md`, `tasks.md` originally authored describing the Modal fix.

## Phase 2: Revert (cross-tab modal-stacking resolution)

- [x] 2.1 The push-notification experiment introduced native Modal stacking across tabs.
- [x] 2.2 Commit `1d0a59b revert(notifications): remove push notification, restore in-app SuccessCheckmark` removed the Modal, restored the `Animated.View` overlay, and removed `BookingSuccessSheet.tsx`.

## Phase 3: Retrospective documentation correction (this update)

- [x] 3.1 `proposal.md` rewritten to point at the revert as the final shipped behavior.
- [x] 3.2 `design.md` rewritten with the same context, goals, risks.
- [x] 3.3 `specs/class-booking/spec.md` rewritten as a delta that records the live contract (in-app `SuccessCheckmark` overlay carrying the FR-05 literal).

## Verification (must pass before archive)

- [x] `openspec validate fix-upcoming-classes-booking-success-modal` → valid.
- [x] `pnpm typecheck` clean (no production code touched).
- [x] `pnpm lint` 0 warnings.
- [x] `pnpm test` 96/96.
- [x] `npx expo export --platform android` bundles cleanly.

## Follow-up (not in this PR)

- If the team ever wants the Modal direction back, open a new OpenSpec change (do not resurrect this one).
- Strengthen the screen test by mocking `SuccessCheckmark` and asserting it was rendered (instead of relying on the inner-content tests in `SuccessCheckmark.test.tsx`).
