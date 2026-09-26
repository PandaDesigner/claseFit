## Context

PR #8 (`Merge pull request #8 from PandaDesigner/fix/my-bookings-feedback-above-tab-bar`) merged two related changes:

1. The cancellation confirmation modal was migrated to a platform `<Modal>` and a generic `SuccessSheet` primitive landed in `shared/ui`. The OpenSpec change folder `feat-modal-polish` captures that wider modal polish.
2. The post-cancellation feedback in `MyBookingsScreen` was migrated from an absolute `<View>` toast (whose `Cerrar` action was hidden behind the floating tab bar) to `<SuccessSheet>` (Modal). This narrower fix is the change name on the PR title: `fix/my-bookings-feedback-above-tab-bar`.

But PR #8 left the OpenSpec change folder empty for `fix-my-bookings-feedback-above-tab-bar`. The work was real, the merge happened, but no proposal / design / tasks / delta spec was committed.

Later, the push-notification experiment (`2d2c0ae`, `02d5022`, `79dab8e`) introduced cross-tab modal-stacking issues that were resolved by **reverting to the in-app `SuccessCheckmark` `Animated.View` overlay** (commit `1d0a59b`). The current tree therefore ships an in-app overlay, not a Modal. `MyBookingsScreen` no longer imports `SuccessSheet` for the post-cancellation feedback.

This change is the missing OpenSpec trail for PR #8, retrospectively corrected to describe what is actually shipped today (in-app `SuccessCheckmark` overlay), not the abandoned Modal direction.

## Goals / Non-Goals

**Goals:**

- Restore the traceable OpenSpec artifacts for PR #8 (which was merged but had no OpenSpec folder).
- Reflect the **currently shipped behavior** (in-app `SuccessCheckmark` overlay) in the proposal, design, and delta spec.
- Mark the change as Completed so the OpenSpec dashboard reports it accurately.

**Non-Goals:**

- No re-introduction of the Modal direction for the post-cancellation feedback.
- No change to the cancellation confirmation modal (`CancellationSheet`) — that swap is owned by `feat-modal-polish`.
- No change to the cancellation use case (`CancelBooking`).

## Decisions

### Document what shipped, not what was originally planned

The delta spec under `specs/class-booking/spec.md` describes the in-app `SuccessCheckmark` overlay. The proposal / design / tasks point at the revert as the source of truth for current behavior.

### No new tests

The 96-test suite already covers:

- `SuccessCheckmark.test.tsx` — the overlay renders the label, auto-dismisses, accessibility role is `alert`.
- `MyBookingsScreen.test.tsx` — the cancellation message renders after a successful cancellation.

No new behavior assertions are required for this retrospective documentation update.

## Files to be created or modified

```
openspec/changes/fix-my-bookings-feedback-above-tab-bar/
├── proposal.md       (new — points at the revert as the final state)
├── design.md         (new)
├── tasks.md          (new — phases for the original PR #8 fix and the revert)
└── specs/class-booking/spec.md   (new — describes SuccessCheckmark overlay)
```

No production code change. No test changes. The implementation already merged in PR #8 / survived the revert.

## Affected ports

None. `BookingRepository`, `BookingStateStore`, `Clock` are unchanged.

## Risks

- **Drift between the OpenSpec change name and the shipped behavior** — the change name still says "feedback-above-tab-bar", but the shipped surface is an `Animated.View` overlay, not a Modal. Mitigation: this very file documents the drift. The original PR #8 problem (CTA hidden behind the tab bar) is solved by the in-app overlay being unmounted with the screen on tab switch.
- **Empty change folder would otherwise stay on the dashboard** — without this retrospective, `openspec view` would keep reporting `fix-my-bookings-feedback-above-tab-bar` as a draft with no tasks.

## Verification

- `openspec validate fix-my-bookings-feedback-above-tab-bar` → valid.
- `openspec validate --all` → no failures attributable to this change.
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `npx expo export --platform android` all pass (no production code touched).
