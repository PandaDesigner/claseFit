## Context

PR #9 (`fix-upcoming-classes-booking-success-modal`, commits `54126a8` and `0901c40`) wired `<BookingSuccessSheet>` (Modal) into `UpcomingClassesScreen` to replace the legacy absolute toast. The later push-notification experiment (`2d2c0ae`, `02d5022`, `79dab8e`) introduced cross-tab modal-stacking issues (a native Modal could outlive its screen) and was reverted by commit `1d0a59b revert(notifications): remove push notification, restore in-app SuccessCheckmark`. The revert restored the in-app `SuccessCheckmark` overlay and removed `BookingSuccessSheet.tsx`. The current tree therefore ships an in-app `Animated.View` overlay, not a Modal.

The original OpenSpec change artifacts for `fix-upcoming-classes-booking-success-modal` describe the Modal direction. This change is a **retrospective documentation-only correction**: the proposal / design / tasks are updated to describe what is actually shipped today, and the delta spec under `specs/class-booking/spec.md` is rewritten to record the live behavior (in-app `SuccessCheckmark` overlay).

## Goals / Non-Goals

**Goals:**

- The OpenSpec change `fix-upcoming-classes-booking-success-modal` reflects the **currently shipped behavior** (in-app `SuccessCheckmark` overlay).
- The delta spec captures the live contract so `openspec validate` keeps passing and downstream archival succeeds.

**Non-Goals:**

- No re-introduction of the Modal direction. The revert is the final shipped behavior.
- No change to the booking use case (`BookClass`), the FR-05 literal message, or the persistence contract.
- No new test (the existing `UpcomingClassesScreen.test.tsx` and `SuccessCheckmark.test.tsx` already cover the in-app overlay contract).

## Decisions

### Document what shipped, not what was originally planned

The delta spec is rewritten to describe the in-app `SuccessCheckmark` overlay. The proposal / design / tasks are updated to point at the revert as the source of truth for current behavior.

### No new tests

The 96-test suite already covers:

- `SuccessCheckmark.test.tsx` — the overlay renders the label, auto-dismisses, accessibility role is `alert`.
- `UpcomingClassesScreen.test.tsx` — the success message renders after a successful booking.
- `MyBookingsScreen.test.tsx` — the cancellation message renders after a successful cancellation.

No new behavior assertions are required for this retrospective documentation update.

## Files to be created or modified

```
openspec/changes/fix-upcoming-classes-booking-success-modal/
├── proposal.md       (updated — points at the revert as the final state)
├── design.md         (updated — same)
├── tasks.md          (already marked complete from PR #9)
└── specs/class-booking/spec.md   (rewritten — describes SuccessCheckmark overlay)
```

No production code change. No test changes.

## Affected ports

None. `BookingRepository`, `BookingStateStore`, `Clock` are unchanged.

## Risks

- **Drift between the OpenSpec change name and the shipped behavior** — the change name still says "booking-success-modal", but the shipped surface is an `Animated.View` overlay, not a Modal. Mitigation: this very file documents the drift. If the team ever wants the Modal direction back, the right path is a new OpenSpec change (do not resurrect this one).

## Verification

- `openspec validate fix-upcoming-classes-booking-success-modal` → valid.
- `openspec validate --all` → no failures attributable to this change.
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `npx expo export --platform android` all pass (no production code touched).
