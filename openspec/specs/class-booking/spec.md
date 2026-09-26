# class-booking Specification

## Purpose
TBD - created by archiving change feat-booking-confirmation-gate. Update Purpose after archive.
## Requirements
### Requirement: Booking flow requires an explicit confirmation gate before persistence

The `UpcomingClassesScreen` SHALL present the user with a confirmation gate before invoking the `BookClass` use case. The gate SHALL render a preview of the selected session and require an explicit confirm action ("Sí, reservar") before `BookClass.execute` is called. The gate SHALL be cancelable via a dismiss action ("Elegir otra"), a backdrop tap, and the Android hardware back button — all of which MUST close the gate without persisting any state change.

This requirement is layered on top of the existing "Book a class session" requirement. It does not change the business rules (RN-01, RN-02, RN-03) or the persistence behavior; it only changes the presentation contract that gates the call to `BookClass.execute`.

#### Scenario: First tap on Reservar opens the gate without persisting

- **WHEN** the user taps "Reservar" on a `ClassCard` whose underlying session is eligible (available, not duplicate, under the daily limit)
- **THEN** the booking gate SHALL be displayed
- **AND** the persisted snapshot SHALL remain unchanged (no new booking is created).

#### Scenario: Tapping Sí, reservar invokes BookClass and persists on success

- **WHEN** the booking gate is displayed
- **AND** the user taps "Sí, reservar"
- **THEN** the gate SHALL close
- **AND** `BookClass.execute` SHALL be invoked with the selected session id
- **AND** on a `status: 'success'` result the persisted snapshot SHALL contain a new active reservation for the selected session.

#### Scenario: Tapping Elegir otra, the backdrop, or pressing back closes the gate without persisting

- **WHEN** the booking gate is displayed
- **AND** the user dismisses the gate via the "Elegir otra" pill, a backdrop tap, or the Android hardware back button
- **THEN** the gate SHALL close
- **AND** `BookClass.execute` SHALL NOT be invoked
- **AND** the persisted snapshot SHALL remain unchanged.

### Requirement: Post-action feedback uses a native local push notification, never a platform Modal

The booking flow on `UpcomingClassesScreen` and the cancellation flow on `MyBookingsScreen` SHALL surface their post-action success feedback through a native OS local push notification triggered via the `NotificationsService` port, NOT through a React Native platform `<Modal>`. The native notification surface is owned by the OS — switching tabs after a booking or cancellation cannot leave a stacked native `<Modal>` over the next screen.

#### Scenario: Booking success fires a native local notification

- **WHEN** the user confirms a booking via the gate
- **AND** `BookClass.execute` resolves with `status: 'success'`
- **THEN** the `NotificationsService.scheduleBookingSuccess` port SHALL be invoked exactly once
- **AND** the system SHALL schedule a native local notification with title `ClaseFit` and body `¡Listo! Tu cupo está reservado` (FR-05).
- **AND** the system SHALL NOT render any platform `<Modal>` or in-app overlay carrying the FR-05 feedback.

#### Scenario: Cancellation success fires a native local notification

- **WHEN** the user confirms a cancellation via the `CancellationSheet` gate
- **AND** `CancelBooking.execute` resolves with `status: 'success'`
- **THEN** the `NotificationsService.scheduleCancellationSuccess` port SHALL be invoked exactly once with the cancellation result message
- **AND** the system SHALL schedule a native local notification with title `ClaseFit` and the cancellation outcome as the body.
- **AND** the system SHALL NOT render any platform `<Modal>` or in-app overlay carrying the cancellation feedback.

#### Scenario: Switching tabs after feedback never stacks native modals

- **WHEN** the user has just received a cancellation notification on `MyBookingsScreen`
- **AND** the user switches to the "Clases" tab and triggers a booking notification
- **THEN** both notifications SHALL appear in the OS notification center as expected
- **AND** no platform `<Modal>` from either screen SHALL be displayed (because none is rendered — feedback is via native notification).

### Requirement: Notification permissions are requested once at app launch

The application SHALL request native local-notification permissions (alert + sound) once at app launch via `useBookingCommands.requestNotificationPermissions()` (typically from `App.tsx` mount). The request is idempotent: if the OS has a cached decision, no prompt appears. If the user denies, the in-app flow still completes — the booking/cancellation just does not trigger a notification. The application SHALL NOT re-prompt after a denial within the same session.

#### Scenario: First-launch prompt asks for permission

- **WHEN** the app starts for the first time on a device
- **THEN** the OS SHALL display the system permission prompt
- **AND** the booking and cancellation flows SHALL work regardless of the user's choice (the in-app state is the source of truth).

#### Scenario: Granted permission enables notification scheduling

- **WHEN** the user grants the alert + sound permissions
- **AND** the user confirms a booking via the gate
- **THEN** the OS SHALL display a native notification with title `ClaseFit` and body `¡Listo! Tu cupo está reservado`.

