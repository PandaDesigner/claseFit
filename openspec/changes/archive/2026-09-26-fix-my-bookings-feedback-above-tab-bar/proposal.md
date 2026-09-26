## Why

This is a **retrospective documentation update** for the post-cancellation feedback surface on `MyBookingsScreen`. The original PR #8 (`fix/my-bookings-feedback-above-tab-bar`) wired `<SuccessSheet>` (Modal) into the screen, but the later push-notification experiment and its revert (`1d0a59b revert(notifications): remove push notification, restore in-app SuccessCheckmark`) restored the in-app `SuccessCheckmark` `Animated.View` overlay and removed the Modal path. The current tree therefore ships an in-app overlay, not a Modal — and the `MyBookingsScreen` no longer imports `SuccessSheet`.

The original PR #8 OpenSpec change folder was empty (no proposal / design / tasks / specs), but the work was real and the change name was on the PR title. This change creates the missing artifacts so the merged implementation has a traceable home, with a delta spec that records the **currently shipped behavior** rather than the abandoned Modal direction.

## What Changes

### New Capabilities

None.

### Modified Capabilities

- `class-booking` (delta): the post-cancellation feedback in `MyBookingsScreen` SHALL be the in-app `SuccessCheckmark` overlay (carrying the cancellation outcome message from `CancelBooking.execute`). The original Modal direction is superseded.

## Impact

- **`MyBookingsScreen.tsx`** — currently renders `<SuccessCheckmark visible onDismiss={...} label={cancelFeedback.message} testID="cancel-success-checkmark" />` after a successful cancellation. The original Modal (`<SuccessSheet>`) import is gone (the revert removed `SuccessSheet`'s use here).
- **Tests**: existing 96 tests stay green.

## Non-goals

- No change to the cancellation use case (`CancelBooking`).
- No change to the cancellation confirmation modal (`CancellationSheet`, already a platform `<Modal>` from `feat-modal-polish`).
- No re-introduction of the Modal direction for the post-cancellation feedback.
