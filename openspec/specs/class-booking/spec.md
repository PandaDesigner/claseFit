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

### Requirement: List upcoming class sessions within the three-day window

The system SHALL list class sessions whose start instant is strictly greater than the current instant and whose calendar date (America/Bogota) is today, tomorrow, or the day after tomorrow. Sessions MUST be sorted ascending by start instant. The list SHALL expose, for each session: identifier, display name, instructor, start date and time in America/Bogota, duration in minutes, total capacity, occupied by other members, available seats (capacity − other occupied − active reservations of the member for that session), and a derived status (`available` or `full`).

#### Scenario: Sessions that already started are hidden

- **WHEN** the current instant is `2026-03-02T13:00:00-05:00`
- **AND** a yoga session is scheduled to start at `2026-03-02T12:00:00-05:00`
- **THEN** the yoga session MUST NOT appear in the upcoming list.

#### Scenario: Sessions from today, tomorrow, and the day after tomorrow are returned

- **WHEN** the current instant is `2026-03-02T08:00:00-05:00`
- **AND** the catalog contains one session at `2026-03-02T18:00`, one at `2026-03-03T06:00`, one at `2026-03-04T18:00`, and one at `2026-03-05T06:00`
- **THEN** the upcoming list contains exactly the three sessions at `2026-03-02T18:00`, `2026-03-03T06:00`, and `2026-03-04T18:00`, in that order.

#### Scenario: Available seats are calculated from catalog occupancy and the member's active bookings

- **WHEN** a spinning session has `cupoTotal = 20`, `ocupados = 18`, and the member has zero active reservations for it
- **THEN** the listed `available` value is `2` and the status is `available`.

- **WHEN** the same spinning session already has an active reservation of the member
- **THEN** the listed `available` value is `1` and the status is `available` (the member may not double-book but the visual count reflects remaining slots for others).

### Requirement: Book a class session

The system SHALL allow the authenticated member to book a single future session, respecting the deterministic precedence RN-01, RN-02, RN-03. The system MUST reject bookings that fail any of those rules and MUST NOT mutate persisted state on rejection. On success the system SHALL publish a new active reservation and expose the literal success message `¡Listo! Tu cupo está reservado`. The system SHALL refuse any booking attempt while a previous booking command for the same session is still pending.

#### Scenario: Successful booking when capacity is available

- **WHEN** the member books a session with available seats, no active duplicate, and fewer than two active reservations for that calendar day
- **THEN** the system creates an active reservation, reduces the displayed available count by one, persists the new state, and surfaces `¡Listo! Tu cupo está reservado`.

#### Scenario: Rejection when no seats remain (RN-01)

- **WHEN** the member books a session whose displayed available seats are zero
- **THEN** the system rejects the booking, leaves persisted state untouched, and surfaces `Esta clase ya no tiene cupos.`.

#### Scenario: Rejection when the member already has an active booking for the same session (RN-02)

- **WHEN** the member books a session that already has an active reservation belonging to the member
- **THEN** the system rejects the booking, leaves persisted state untouched, and surfaces `Ya reservaste esta clase.`.

#### Scenario: Rejection when the daily limit of two active reservations is reached (RN-03)

- **WHEN** the member already holds two active reservations whose session calendar date (America/Bogota) equals the target session's calendar date
- **AND** the member books a third distinct session on that same calendar date
- **THEN** the system rejects the booking, leaves persisted state untouched, and surfaces `Solo puedes reservar 2 clases por día.`.

#### Scenario: Cancellation releases a daily-limit slot

- **WHEN** the member holds two active reservations for the same calendar date
- **AND** the member cancels one of them
- **AND** the member books another session on that calendar date
- **THEN** the booking succeeds.

#### Scenario: Rejection precedence is deterministic

- **WHEN** the member attempts to book a full session for which they already hold an active reservation on a date where the daily limit is also reached
- **THEN** the surfaced message is `Esta clase ya no tiene cupos.` (RN-01 wins over RN-02 and RN-03).

### Requirement: List active reservations

The system SHALL expose the member's active reservations sorted ascending by session start instant. When the member has no active reservations, the system SHALL surface the literal empty-state message `Aún no tienes reservas`.

#### Scenario: Empty state message is surfaced verbatim

- **WHEN** the member has no active reservations
- **THEN** the system displays `Aún no tienes reservas`.

#### Scenario: Active reservations are ordered by start time

- **WHEN** the member has two active reservations, one at `2026-03-04T06:00:00-05:00` and one at `2026-03-02T18:00:00-05:00`
- **THEN** the list shows the reservation at `2026-03-02T18:00` first and the reservation at `2026-03-04T06:00` second.

### Requirement: Cancel an active reservation

The system SHALL cancel an active reservation when the elapsed time between the cancel instant and the session start instant is **>= 2 hours**, and SHALL reject cancellations otherwise (RN-04). The cancellation MUST be confirmed against the canonical eligibility at the moment of execution, not at the moment the cancel UI was opened. Repeated cancellation attempts for the same reservation MUST NOT release additional capacity.

#### Scenario: Cancellation succeeds when the cancel instant is at least two hours before the session start

- **WHEN** the current instant is `2026-03-02T13:00:00-05:00`
- **AND** the member cancels a reservation for a session at `2026-03-02T15:00:00-05:00`
- **THEN** the system transitions the reservation to a terminal cancelled state, releases the seat, and removes it from the active list.

#### Scenario: Cancellation succeeds exactly at the two-hour boundary

- **WHEN** the current instant is `2026-03-02T13:00:00-05:00`
- **AND** the member cancels a reservation for a session at `2026-03-02T15:00:00-05:00`
- **THEN** the system accepts the cancellation (the duration equals two hours exactly).

#### Scenario: Cancellation rejected when less than two hours remain (RN-04)

- **WHEN** the current instant is `2026-03-02T13:30:00-05:00`
- **AND** the member cancels a reservation for a session at `2026-03-02T15:00:00-05:00`
- **THEN** the system rejects the cancellation, leaves the reservation active, and surfaces `Ya no puedes cancelar: faltan menos de 2 horas.`.

#### Scenario: Cancellation rejected for a session that has already started

- **WHEN** the current instant is `2026-03-02T18:00:00-05:00`
- **AND** the member cancels a reservation for a session at `2026-03-02T18:00:00-05:00`
- **THEN** the system rejects the cancellation and surfaces `Ya no puedes cancelar: faltan menos de 2 horas.`.

#### Scenario: Repeated cancellation does not release extra seats

- **WHEN** the member has just cancelled a reservation
- **AND** the member attempts to cancel the same reservation again
- **THEN** the system rejects the second attempt (the reservation is in the cancelled state, which is terminal) and no seat is released.

### Requirement: Persist and resume reservations safely

The system SHALL persist the catalog snapshot (resolved sessions and a Bogota base date), the member's reservations, and a schema/dataset version under a single versioned key. The system SHALL NOT write a default empty state before hydration completes. The system MUST preserve the original session dates after midnight rollover or app restart. On read or parse errors the system SHALL keep the previously persisted data intact, expose a recoverable error to the UI, and refuse new mutations until the user retries.

#### Scenario: Cold restart restores active reservations unchanged

- **WHEN** the member has an active reservation for `C-09` scheduled on `2026-03-04T08:00:00-05:00`
- **AND** the application is killed and relaunched the next day
- **THEN** the reservation for `C-09` is still present in the active list with the same start instant.

#### Scenario: Invalid JSON keeps the previous snapshot intact

- **WHEN** the persisted payload contains malformed JSON
- **THEN** the system keeps the last valid snapshot in memory, surfaces a recoverable error, and blocks new bookings and cancellations until the user retries.

#### Scenario: Unknown schema version keeps the data

- **WHEN** the persisted payload has a `schemaVersion` the system does not recognize
- **THEN** the system does NOT delete the persisted data automatically; the system MUST refuse to use it and surface a recoverable error that requires explicit user action.

#### Scenario: Hydration completes before any command is accepted

- **WHEN** the application starts and persisted data exists
- **THEN** the system MUST finish hydration (load, parse, rebuild domain entities) before exposing any booking or cancellation command to the UI.

### Requirement: Serialize mutation commands per feature

The system SHALL execute booking and cancellation commands through a single per-feature command queue. While a command is in flight, additional incompatible commands for the same session MUST be rejected without invoking the domain rules. On success or failure the queue MUST release so subsequent commands can run.

#### Scenario: Concurrent duplicate booking attempts are serialized

- **WHEN** the member taps the book action twice in quick succession for the same session
- **THEN** the first attempt creates the reservation and the second attempt is rejected by the queue (no duplicate booking, no double decrement of available seats).

#### Scenario: Command queue recovers from a domain rejection

- **WHEN** the member attempts to book a full session
- **THEN** the queue releases immediately after the rejection so the next attempt on a different session can run.

### Requirement: Refresh eligibility when the application returns to the foreground

The system SHALL re-evaluate the eligibility of displayed sessions and active reservations when the application regains focus. Bookings on sessions whose start instant is now in the past MUST be reported as ineligible; cancellations on sessions closer than two hours MUST also be reported as ineligible. The presentation layer SHALL surface these updates without forcing a full app restart.

#### Scenario: Crossing a session start time while the app is in the background

- **WHEN** the member has an active reservation for a session at `2026-03-02T18:00:00-05:00`
- **AND** the application is backgrounded and resumed at `2026-03-02T18:05:00-05:00`
- **THEN** the cancel action for that reservation is disabled and the active list labels the reservation as already started.

### Requirement: Use deterministic time injection for eligibility

Eligibility decisions (booking window, cancellation window, three-day window, daily limit by Bogota date) SHALL rely on a `Clock` port that returns the current instant. In production the adapter is `SystemClock`; in tests it is `FixedClock` so scenarios can exercise exact instants without depending on wall-clock time.

#### Scenario: Deterministic two-hour boundary test

- **WHEN** the `Clock` returns `2026-03-02T13:00:00-05:00`
- **AND** a reservation exists for a session at `2026-03-02T15:00:00-05:00`
- **THEN** the cancel use case returns a successful cancellation.

- **WHEN** the `Clock` returns `2026-03-02T13:00:00-05:01`
- **THEN** the cancel use case rejects the cancellation with RN-04.
