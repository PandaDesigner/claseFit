# booking-success-notification Specification (delta)

## Purpose

Defines the native OS local push notification triggered as the post-action feedback surface for a successful booking (FR-05) and a successful cancellation. Lives behind a `NotificationsService` port (`application/ports/`) with an `ExpoNotificationsAdapter` production implementation and an `InMemoryNotificationsAdapter` test double.

Replacing the previous in-app `Animated.View` overlay (which itself replaced the previous platform `<Modal>`-based feedback) with a native notification is the explicit user-requested design — the visual reference provided by the user is the system notification surface (green app icon + "ClaseFit" title + "¡Listo! Tu cupo está reservado" body in a dark rounded card).

## ADDED Requirements

### Requirement: Booking success fires a native local notification with the FR-05 literal

After a successful `BookClass.execute`, the `NotificationsService.scheduleBookingSuccess` port SHALL be invoked exactly once. The adapter SHALL schedule a native local notification with title `ClaseFit` and body `¡Listo! Tu cupo está reservado`. The notification SHALL fire within a few seconds of scheduling (via a 5-second `TIME_INTERVAL` trigger).

#### Scenario: Successful booking triggers the FR-05 notification

- **WHEN** the member confirms a booking via the confirmation gate
- **AND** `BookClass.execute` resolves with `status: 'success'`
- **THEN** the `NotificationsService.scheduleBookingSuccess` port SHALL be invoked exactly once
- **AND** the production adapter SHALL call `Notifications.scheduleNotificationAsync` with `title: 'ClaseFit'`, `body: '¡Listo! Tu cupo está reservado'`, and `identifier: 'booking-success'`.

### Requirement: Cancellation success fires a native local notification with the outcome

After a successful `CancelBooking.execute`, the `NotificationsService.scheduleCancellationSuccess` port SHALL be invoked exactly once with the cancellation outcome message as the body. The adapter SHALL schedule a native local notification with title `ClaseFit` and the provided message as the body.

#### Scenario: Successful cancellation triggers a notification with the outcome message

- **WHEN** the member confirms a cancellation via the `CancellationSheet` gate
- **AND** `CancelBooking.execute` resolves with `status: 'success'`
- **THEN** the `NotificationsService.scheduleCancellationSuccess` port SHALL be invoked exactly once with the result message
- **AND** the production adapter SHALL call `Notifications.scheduleNotificationAsync` with `title: 'ClaseFit'`, `body: <message>`, and `identifier: 'cancel-success'`.

### Requirement: Permission request returns the user's grant decision

The `NotificationsService.requestPermissions` port SHALL return `true` when the user has granted (at least provisional) alert permission and `false` otherwise. The production adapter SHALL use `expo-notifications`'s `getPermissionsAsync` and (if needed) `requestPermissionsAsync`.

#### Scenario: First-time launch prompts for permission

- **WHEN** the app starts for the first time and the OS has not yet recorded a permission decision
- **THEN** `requestPermissions` SHALL display the OS permission prompt and return `true` only if the user grants.

#### Scenario: Cached grant does not re-prompt

- **WHEN** the OS has already cached a grant decision (granted or denied)
- **THEN** `requestPermissions` SHALL return immediately without re-prompting.

### Requirement: Notification port is independent of presentation tree

The `NotificationsService` port SHALL be invoked from the presentation-layer command hook (`useBookingCommands`) and SHALL NOT depend on any component's render tree being mounted. Triggering the notification on a tab that the user is not currently viewing SHALL still deliver the notification to the OS notification center.

#### Scenario: Notification fires regardless of which tab is active

- **WHEN** the user triggers a booking confirmation while viewing `Mis reservas`
- **AND** then switches to the `Clases` tab
- **THEN** the booking notification SHALL still appear in the OS notification center
- **AND** no component on `Mis reservas` SHALL re-render to "show" the notification (there is no in-app overlay).
