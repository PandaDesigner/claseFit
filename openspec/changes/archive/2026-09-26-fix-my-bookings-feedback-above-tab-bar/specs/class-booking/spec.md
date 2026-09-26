# class-booking Specification (delta)

## Purpose

This delta is a **retrospective documentation-only correction** for the `class-booking` capability. The original PR #8 (`fix/my-bookings-feedback-above-tab-bar`, commit `04f010e`) migrated the post-cancellation feedback in `MyBookingsScreen` from an absolute `<View>` toast (whose `Cerrar` action was hidden behind the floating tab bar) to `<SuccessSheet>` (Modal). The later push-notification experiment and its revert (`1d0a59b revert(notifications): remove push notification, restore in-app SuccessCheckmark`) restored the in-app `SuccessCheckmark` `Animated.View` overlay. The current tree therefore ships an in-app overlay, not a Modal.

This delta records the **currently shipped behavior** so the live `class-booking` spec matches the running code, not the abandoned Modal direction. It does NOT change the cancellation use case (`CancelBooking`), the cancellation confirmation modal (already a platform `<Modal>` from `feat-modal-polish`), or the persistence contract.

## ADDED Requirements

### Requirement: Post-cancellation feedback on MyBookingsScreen is an in-app animated overlay

After `CancelBooking` succeeds on `MyBookingsScreen`, the screen SHALL render the `SuccessCheckmark` shared/ui primitive (an `Animated.View` overlay, NOT a React Native platform `<Modal>`) carrying the cancellation outcome message returned by `CancelBooking.execute`. The overlay SHALL auto-dismiss after a short delay (default 2500 ms) and SHALL hide automatically when the screen is unmounted by React Navigation — so switching tabs after a cancellation cannot leave a stacked native `<Modal>` over the next screen.

#### Scenario: Successful cancellation renders the overlay

- **WHEN** the member confirms a cancellation via the `CancellationSheet` and `CancelBooking.execute` resolves with success
- **THEN** the `SuccessCheckmark` overlay SHALL appear with the cancellation outcome message.

#### Scenario: Overlay auto-dismisses

- **WHEN** the overlay is visible
- **AND** the configured dismiss timer elapses (default 2500 ms)
- **THEN** the overlay SHALL fade out and be removed from the tree.

#### Scenario: Tab switch does not stack the overlay

- **WHEN** the cancellation overlay is visible on `MyBookingsScreen`
- **AND** the user switches to another tab
- **THEN** the overlay SHALL disappear with the screen (because it is an `Animated.View` inside the screen's render tree, not a native `<Modal>`).

## MODIFIED Requirements

None.

## REMOVED Requirements

None.
