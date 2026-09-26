## Why

This is a **retrospective documentation update** for the post-booking feedback surface on `UpcomingClassesScreen`. The original PR #9 (`fix-upcoming-classes-booking-success-modal`, commits `54126a8` and `0901c40`) migrated the legacy absolute toast to a `BookingSuccessSheet` platform `<Modal>`, but the later push-notification experiment (`2d2c0ae`, `02d5022`, `79dab8e`) introduced cross-tab modal-stacking issues that were resolved by **reverting to the in-app `SuccessCheckmark` `Animated.View` overlay** (commit `1d0a59b revert(notifications): remove push notification, restore in-app SuccessCheckmark`). The `BookingSuccessSheet.tsx` file no longer exists in the codebase.

The live `class-booking` capability spec must reflect the **currently shipped behavior** (in-app `SuccessCheckmark` overlay), not the abandoned Modal direction. This change:

- Records the current behavior in a delta spec under `specs/class-booking/spec.md`.
- Notes that the prior Modal direction was superseded by the revert.
- Keeps the OpenSpec change in `Completed` state and ready to archive.

## What Changes

### New Capabilities

None.

### Modified Capabilities

- `class-booking` (delta): the post-booking feedback in `UpcomingClassesScreen` SHALL be the in-app `SuccessCheckmark` overlay (FR-05 literal: `¡Listo! Tu cupo está reservado`). The original Modal direction is superseded — the `BookingSuccessSheet.tsx` file is no longer in the tree.

## Impact

- **`UpcomingClassesScreen.tsx`** — renders `<SuccessCheckmark visible onDismiss={...} label={messages.success} testID="booking-success-checkmark" />` after a successful booking. Removes the unused `feedback` / `feedbackText` styles. The `BookingSuccessSheet` import is gone.
- **Tests**: existing 96 tests stay green.

## Non-goals

- No change to the booking use case (`BookClass`). No change to the messages.
- No change to the cancellation feedback (also `SuccessCheckmark` overlay since the revert).
- No re-introduction of the Modal direction. The revert is the final shipped behavior.
