# class-booking Specification (delta)

## Purpose

This delta extends the `class-booking` capability with the **motion vocabulary** that confirms each user action. It does NOT change business rules or the cancellation flow.

## ADDED Requirements

### Requirement: Pill components compress slightly on press

The shared `Pill` component SHALL respond to press with both a `0.85` opacity change AND a `scale(0.97)` transform. The visual identity (color, label, optional arrow) does not change.

#### Scenario: Pressing a Pill produces a perceptible scale affordance

- **WHEN** the user presses the `Reservar →` pill on a Clases card
- **THEN** the pill renders at `scale 0.97` while the press is held
- **AND** returns to `scale 1.0` on release.

### Requirement: The BrandHeader fades and slides in on first paint

The `BrandHeader` SHALL render initially at `opacity: 0` and `translateY: -8`. On mount, an `Animated.parallel` runs both values to `opacity: 1` and `translateY: 0` over 320 ms with `useNativeDriver: true`.

#### Scenario: BrandHeader settles to its final position within 320 ms

- **WHEN** the user opens the app or switches to a screen that mounts a `BrandHeader`
- **THEN** the header is fully visible at `translateY: 0` within 320 ms.

### Requirement: Day section headers ease in

In `UpcomingClassesScreen` and `MyBookingsScreen`, the section header (`Hoy` / `Mañana` / formatted date) SHALL animate from `opacity: 0` to `opacity: 1` over 180 ms when it first becomes visible.

#### Scenario: Day heading fades in as the user scrolls past

- **WHEN** the user opens a screen with bookings grouped by day
- **THEN** each section header becomes fully visible within 180 ms of first being laid out.

## MODIFIED Requirements

None.

## REMOVED Requirements

None.