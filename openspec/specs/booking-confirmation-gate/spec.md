# booking-confirmation-gate Specification

## Purpose

TBD - created by archiving change feat-booking-confirmation-gate. Update Purpose after archive.

## Requirements

### Requirement: Booking requires an explicit confirmation gate

The booking action on `UpcomingClassesScreen` SHALL NOT invoke `BookClass.execute` directly. Instead, it SHALL open a `BookingGateSheet` platform `<Modal>` that renders the selected session and asks the member to confirm or pick another. The gate SHALL be cancelable via three independent dismiss paths: the "Elegir otra" pill, a backdrop tap, and the Android hardware back button. The `BookClass` use case SHALL only be invoked when the user taps "Sí, reservar" on the gate.

#### Scenario: First tap on Reservar opens the gate without persisting

- **WHEN** the member taps the "Reservar" action on a `ClassCard` whose underlying session has available seats, no duplicate, and is under the daily limit
- **THEN** the `BookingGateSheet` SHALL appear with the gate prompt visible
- **AND** the persisted snapshot SHALL remain unchanged (zero new bookings).

#### Scenario: Tapping Sí, reservar persists the booking

- **WHEN** the gate is visible
- **AND** the member taps "Sí, reservar"
- **THEN** the gate SHALL close
- **AND** the `BookClass.execute` use case SHALL be invoked
- **AND** on success the persisted snapshot SHALL contain a new active reservation for the selected session.

#### Scenario: Tapping Elegir otra dismisses the gate without persisting

- **WHEN** the gate is visible
- **AND** the member taps "Elegir otra"
- **THEN** the gate SHALL close
- **AND** the persisted snapshot SHALL remain unchanged.

#### Scenario: Backdrop tap dismisses the gate without persisting

- **WHEN** the gate is visible
- **AND** the member taps the backdrop
- **THEN** the gate SHALL close
- **AND** the persisted snapshot SHALL remain unchanged.

#### Scenario: Android hardware back dismisses the gate without persisting

- **WHEN** the gate is visible
- **AND** the member presses the Android hardware back button
- **THEN** the gate SHALL close
- **AND** the persisted snapshot SHALL remain unchanged.

#### Scenario: Concurrent duplicate Sí, reservar taps are serialized

- **WHEN** the gate is visible
- **AND** the member taps "Sí, reservar" twice in quick succession for the same session
- **THEN** the first tap SHALL create the reservation and the second tap SHALL be coalesced by the `BookClass` command queue (no duplicate booking, no double decrement of available seats).

### Requirement: Gate renders a preview of the selected session

The gate SHALL render a preview card containing the selected session's display name, category color, date label, start time, duration in minutes, and instructor — mirroring the `CancellationSheet.SessionPreview` shape so the member can verify which class they are about to book.

#### Scenario: Preview card shows the selected session

- **WHEN** the gate is visible
- **AND** the member opened the gate from the Spinning session at `2026-03-02T06:00:00-05:00` with instructor "Andrés Restrepo"
- **THEN** the preview card SHALL display "Spinning", a date label derived from the session start, the local time `06:00`, the duration, and the instructor name "Andrés Restrepo".
