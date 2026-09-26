# class-booking Specification (delta)

## Purpose

This delta extends the `class-booking` capability with the visual contract for the **Mis reservas** surface (the active-reservation list and its card). It does NOT change business rules or the cancellation use case.

The functional contract references RFC-002 decisions that the user has approved in writing:

- Cancellation is allowed when the elapsed time between the cancel instant and the session start is **>= 2 hours**. Cancellations **< 2 hours before start** are rejected with RN-04.
- Cancellation is reachable only from Mis reservas, never from the Clases screen (see `ui-redesign-clases-screen/design.md`).

## ADDED Requirements

### Requirement: The Mis reservas screen presents each active reservation as a card matching the Clases card archetype

The Mis reservas screen SHALL render each active reservation as a card with the same visual archetype as the Clases screen card:

- 2-column layout: text column on the left, sport-icon image cutout on the right (175×150, contained, no overlap with text).
- Background tinted by the session's category color (the same pastel used in Clases).
- `PixelPattern` decoration overlaid on the background at low opacity.
- Instructor avatar (with initials-circle fallback) next to the instructor name and the `INSTRUCTOR` / `INSTRUCTORA` eyebrow.

The card SHALL expose exactly one pill button at the bottom-right corner with the literal label `Cancelar` and the destructive visual variant (light red background, dark red text). Tapping it SHALL trigger the cancellation confirmation flow (the modal). The pill SHALL be disabled (and visually de-emphasized) when `cancellable = false` per the existing contract (booking within the 2-hour cancellation window).

#### Scenario: Active reservation card renders the Cancel pill in the destructive variant

- **WHEN** the member opens the Mis reservas screen with at least one active reservation
- **THEN** each card shows a `Cancelar` pill in the destructive variant at the bottom-right of the card. Tapping it opens the cancellation sheet.

#### Scenario: Cancelling triggers the existing modal

- **WHEN** the member taps `Cancelar`
- **THEN** the existing `CancellationSheet` opens with the session preview card (built in `ui-redesign-clases-screen`) and the two actions `Mantener reserva` (primary) and `Sí, cancelar` (destructive).

### Requirement: The Mis reservas screen groups active reservations by day with safe-area-aware list padding

The Mis reservas screen SHALL group active reservations by their session calendar date relative to today (in America/Bogota):

- Today → section title `Hoy`.
- Tomorrow → section title `Mañana`.
- Later → section title formatted via `toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })`.

The list `contentContainerStyle.paddingBottom` SHALL be at least `max(insets.bottom, 12) + 88 + 16` so the last card clears the floating tab bar on every device.

The screen SHALL render the `BrandHeader` at the top, before the section list.

#### Scenario: Today and tomorrow are labeled with literal Spanish words

- **WHEN** the current instant is `2026-03-02T13:00:00-05:00`
- **AND** the active reservations include sessions at `2026-03-02T18:00` and `2026-03-03T07:00`
- **THEN** the today section title is `Hoy` and the tomorrow section title is `Mañana`.

#### Scenario: Last booking card is not overlapped by the floating tab bar

- **WHEN** the screen renders more bookings than fit in the viewport
- **AND** the user scrolls to the bottom
- **THEN** the last booking card is fully visible above the floating tab bar.

## MODIFIED Requirements

None.

## REMOVED Requirements

None.
