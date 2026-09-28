# class-booking Specification (delta)

## Purpose

This delta is a **retrospective documentation-only correction** for the `class-booking` capability. The original PR #9 (`fix-upcoming-classes-booking-success-modal`) and the later revert (`revert(notifications): remove push notification, restore in-app SuccessCheckmark`) shipped a different post-booking feedback surface than the OpenSpec change originally described. This delta records the **current, actually-shipped behavior** so the live `class-booking` spec matches the running code, not the abandoned Modal direction.

It does NOT change the booking use case (`BookClass`), the literal FR-05 message (`¡Listo! Tu cupo está reservado`), or the persistence contract.

## ADDED Requirements

### Requirement: Post-booking feedback on UpcomingClassesScreen is an in-app animated overlay

After `BookClass` succeeds on `UpcomingClassesScreen`, the screen SHALL render the `SuccessCheckmark` shared/ui primitive (an `Animated.View` overlay, NOT a React Native platform `<Modal>`) carrying the FR-05 literal message (`¡Listo! Tu cupo está reservado`). The overlay SHALL auto-dismiss after a short delay (default 2500 ms) and SHALL hide automatically when the screen is unmounted by React Navigation — so switching tabs after a booking cannot leave a stacked native `<Modal>` over the next screen.

#### Scenario: Successful booking renders the FR-05 overlay

- **WHEN** the member confirms a booking via the `BookingGateSheet` and `BookClass.execute` resolves with success
- **THEN** the `SuccessCheckmark` overlay SHALL appear with the FR-05 literal message (`¡Listo! Tu cupo está reservado`).

#### Scenario: Overlay auto-dismisses

- **WHEN** the overlay is visible
- **AND** the configured dismiss timer elapses (default 2500 ms)
- **THEN** the overlay SHALL fade out and be removed from the tree.

#### Scenario: Tab switch does not stack the overlay

- **WHEN** the booking overlay is visible on `UpcomingClassesScreen`
- **AND** the user switches to another tab
- **THEN** the overlay SHALL disappear with the screen (because it is an `Animated.View` inside the screen's render tree, not a native `<Modal>`).

## MODIFIED Requirements

None.

## REMOVED Requirements

None.
