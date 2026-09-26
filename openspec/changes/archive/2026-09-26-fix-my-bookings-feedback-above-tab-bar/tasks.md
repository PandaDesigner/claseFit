# Tasks: fix-my-bookings-feedback-above-tab-bar

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

| Unit | Goal                                                                                                                                                                                                                                       | Commit           |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| 1    | Author proposal.md, design.md, tasks.md and specs/class-booking/spec.md for the merged PR #8 implementation, retrospectively corrected to describe the in-app `SuccessCheckmark` overlay that is currently shipped (post-revert `1d0a59b`) | `docs(openspec)` |

## Phase 1: PR #8 (original Modal fix — completed and later superseded)

- [x] 1.1 PR #8 wired `<SuccessSheet>` (Modal) into `MyBookingsScreen` (commit `04f010e`).
- [x] 1.2 Removed the unused `feedback` / `feedbackText` styles and the `PrimaryButton` import.
- [x] 1.3 PR #8 left the OpenSpec change folder empty — no proposal / design / tasks / specs were committed for `fix-my-bookings-feedback-above-tab-bar`.

## Phase 2: Revert (cross-tab modal-stacking resolution)

- [x] 2.1 The push-notification experiment introduced native Modal stacking across tabs.
- [x] 2.2 Commit `1d0a59b revert(notifications): remove push notification, restore in-app SuccessCheckmark` removed the Modal, restored the `Animated.View` overlay in `MyBookingsScreen`, and removed `SuccessSheet`'s use here.

## Phase 3: Retrospective OpenSpec artifacts (this update)

- [x] 3.1 Author `proposal.md` describing the change (the empty folder is the bug being fixed).
- [x] 3.2 Author `design.md` with the full context (PR #8 + the revert) and the goals / non-goals.
- [x] 3.3 Author `tasks.md` (this file).
- [x] 3.4 Author `specs/class-booking/spec.md` as a delta that records the live contract (in-app `SuccessCheckmark` overlay carrying the cancellation outcome message).

## Verification (must pass before archive)

- [x] `openspec validate fix-my-bookings-feedback-above-tab-bar` → valid.
- [x] `pnpm typecheck` clean (no production code touched).
- [x] `pnpm lint` 0 warnings.
- [x] `pnpm test` 96/96.
- [x] `npx expo export --platform android` bundles cleanly.

## Follow-up (not in this PR)

- If the team ever wants the Modal direction back for the cancellation feedback, open a new OpenSpec change (do not resurrect this one).
- Strengthen the screen test by mocking `SuccessCheckmark` and asserting it was rendered (instead of relying on the inner-content tests in `SuccessCheckmark.test.tsx`).
