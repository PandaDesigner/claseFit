# class-booking Specification (delta)

## Purpose

This delta extends the `class-booking` capability with two modal polish items: (1) the cancellation confirmation modal MUST be a real platform `<Modal>` so it renders above the floating tab bar, and (2) the booking success feedback MUST be a modal (not a toast) showing the literal FR-05 message.

It does NOT change business rules.

## ADDED Requirements

### Requirement: The booking success feedback is a real modal, not a toast

After `BookClass` succeeds on `UpcomingClassesScreen`, the system SHALL show a modal with:

- A drag handle at the top of the sheet (same visual as `CancellationSheet`).
- A title (literal: `¡Listo!`).
- The body message — literal from PRD FR-05: `¡Listo! Tu cupo está reservado`.
- A single pill action labeled `Listo` that dismisses the modal (calls `onDismiss`).

Tapping the dimmed backdrop or pressing the Android hardware back button SHALL also dismiss (calls `onDismiss`).

The modal SHALL render above the floating tab bar so the CTA is always reachable.

#### Scenario: Successful booking shows the success modal

- **WHEN** the member books a class and `BookClass` succeeds
- **THEN** the success modal opens with title `¡Listo!` and body `¡Listo! Tu cupo está reservado`.

#### Scenario: Tapping `Listo` dismisses the modal

- **WHEN** the success modal is visible
- **AND** the member taps `Listo`
- **THEN** the modal closes and `onDismiss` is called.

### Requirement: The cancellation modal renders above the floating tab bar

The cancellation confirmation modal (`CancellationSheet`) SHALL be implemented using React Native's `<Modal>` primitive — NOT a custom absolute `<View>` overlay — so it renders above the floating tab bar.

The Modal's `onRequestClose` SHALL be wired to `onKeep` so pressing the Android hardware back button dismisses without cancelling.

Tapping the dimmed backdrop region outside the sheet SHALL call `onKeep`.

#### Scenario: Backdrop tap dismisses the cancellation modal without cancelling

- **WHEN** the cancellation modal is visible
- **AND** the user taps the dimmed backdrop region
- **THEN** `onKeep` is called
- **AND** `onConfirm` is NOT called.

#### Scenario: Hardware back button dismisses the cancellation modal without cancelling

- **WHEN** the cancellation modal is visible on Android
- **AND** the user presses the hardware back button
- **THEN** the Modal's `onRequestClose` fires
- **AND** `onKeep` is called
- **AND** `onConfirm` is NOT called.

## MODIFIED Requirements

None.

## REMOVED Requirements

None.