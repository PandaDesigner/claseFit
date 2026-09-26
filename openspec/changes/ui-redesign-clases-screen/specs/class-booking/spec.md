# class-booking Specification (delta)

## Purpose

This delta extends the `class-booking` capability with UI/UX presentation requirements. Business rules (RN-01, RN-02, RN-03, RN-04, FR-05, FR-06) and data contracts are unchanged.

## ADDED Requirements

### Requirement: The Clases screen presents three visible button states per session

The Clases screen SHALL display each upcoming session as a card with a single pill button whose label and styling communicate the booking state:

- `available`: pill labeled `Reservar →` (black background, white text, right-arrow) — calls `onBook(sessionId)` on press.
- `full`: pill labeled `Llena` (grey background, white text) — non-interactive.
- `reserved`: pill labeled `Reservada` (dark green background, light green text) — non-interactive; cancellation is reachable only from Mis reservas.

The Clases screen SHALL NOT offer a Cancel action.

#### Scenario: Available session shows a Reservar pill with an arrow

- **WHEN** the upcoming list contains a Spinning session with available seats
- **THEN** the card shows a black `Reservar →` pill that calls `onBook(sessionId)` when pressed.

#### Scenario: Full session shows a Llena pill

- **WHEN** the upcoming list contains a Yoga session with `available = 0`
- **THEN** the card shows a grey `Llena` pill that is non-interactive (tapping does not invoke any handler).

#### Scenario: Reserved session shows a non-interactive Reservada pill

- **WHEN** the upcoming list contains a session that the member has already reserved
- **THEN** the card shows a dark green `Reservada` pill that is non-interactive (no Cancel handler, screen reader announces it as `text`).

### Requirement: The Clases screen groups sessions by day with safe-area-aware list padding

The Clases screen SHALL group sessions by their calendar date relative to today (in America/Bogota):

- Today → section title `Hoy`.
- Tomorrow → section title `Mañana`.
- Later → section title formatted via `toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })`.

The list `contentContainerStyle.paddingBottom` SHALL be at least `max(insets.bottom, 12) + 88 + 16` so the last card clears the floating tab bar on every device.

#### Scenario: Today and tomorrow are labeled with literal Spanish words

- **WHEN** the current instant is `2026-03-02T13:00:00-05:00`
- **AND** the list contains sessions at `2026-03-02T18:00` and `2026-03-03T07:00`
- **THEN** the today section title is `Hoy` and the tomorrow section title is `Mañana`.

#### Scenario: Last card is not overlapped by the floating tab bar

- **WHEN** the screen renders more sessions than fit in the viewport
- **AND** the user scrolls to the bottom
- **THEN** the last card is fully visible above the floating tab bar.

### Requirement: The cancellation sheet shows a session preview card

When the user triggers cancellation from the Mis reservas screen, the modal SHALL show a preview card inside the sheet with: class name, day label (`Hoy` / `Mañana` / formatted date) · `HH:MM` · `N min`, and instructor name. The preview card SHALL use the same pastel category color as the original session card. The sheet SHALL offer two pill actions:

- `Mantener reserva` — primary (black) — dismisses the sheet without cancelling.
- `Sí, cancelar` — destructive (light red background, dark red text) — confirms the cancellation.

#### Scenario: Confirmation message follows PRD FR-05 verbatim

- **WHEN** the user confirms the cancellation
- **THEN** the sheet dismisses and the cancellation use case executes.

## MODIFIED Requirements

None.

## REMOVED Requirements

None.
