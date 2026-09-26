## Context

The class-booking feature has two surfaces that need to confirm or deny user actions:

- **Cancellation confirmation** — shown when the user taps "Cancelar" on a booking card in `MyBookingsScreen`. The current implementation (PR #1) is a custom absolute `<View>` overlay. It works in tests but visually crashes into the `FloatingTabBar` because the navigator renders the tab bar above the screen.
- **Booking success** — shown after `BookClass` succeeds on `UpcomingClassesScreen`. Currently a `feedback` toast at the bottom of the screen, which does not match the PRD FR-05 "show as a modal" intent and is also visually weak.

Both need to be real platform modals. React Native's `<Modal>` component is the standard primitive — it renders above the React tree (the navigator, the tab bar, everything), provides backdrop tap and Android back button for free, and gives a slide-up animation that matches the bottom-sheet pattern in the design.

## Goals / Non-Goals

**Goals:**

- `CancellationSheet` uses `<Modal transparent animationType="slide" onRequestClose={onKeep}>`.
- Tapping the dimmed backdrop calls `onKeep` (dismiss without cancelling).
- The Android hardware back button calls `onKeep`.
- A new `SuccessSheet` (in `shared/ui`) wraps `<Modal>` and exposes a compound API (`Root` / `Message` / `Actions`).
- `UpcomingClassesScreen` shows the success modal after `BookClass` succeeds, replacing the toast.
- The success modal shows the literal `¡Listo! Tu cupo está reservado` (FR-05) and a single `Listo` CTA.

**Non-Goals:**

- No navigation action from the success modal (e.g., "Ver mi reserva"). The success modal just confirms.
- No swipe-down-to-dismiss gesture.
- No celebration animation (confetti, etc.).
- No light/dark mode split.

## Decisions

### `<Modal>` primitive for every sheet

Both modals use `<Modal transparent animationType="slide" onRequestClose={onKeep / onDismiss}>`. This is the React Native standard. It puts the sheet above the navigator's tab bar (which the custom overlay could not), gives the slide animation, and handles back button + focus for free.

### Backdrop tap = dismiss (not cancel / not confirm)

For the cancellation modal: backdrop tap calls `onKeep` (NOT `onConfirm`). The user did not commit to the destructive action; tapping outside is "I changed my mind".

For the success modal: backdrop tap calls `onDismiss` (closes the sheet). Same rationale — the user already committed the action, dismissing the sheet just closes the feedback.

### Reusable `SuccessSheet` in `shared/ui/`

The success modal is generic enough that it lives in `shared/ui` instead of the feature. The compound API (`Root` / `Message` / `Actions`) mirrors `CancellationSheet` so contributors learn one pattern.

### `BookingSuccessSheet` in `features/class-booking/presentation/components/`

A thin wrapper that pre-fills the success copy for booking (`messages.successTitle`, `messages.successDefaultMessage`, `messages.successCta`) and composes the shared `SuccessSheet`. Keeps the generic component free of booking-specific strings.

### No icon in the success modal

The design model does not show a checkmark / illustration. A future change can add one. For now the modal is text-only, matching the existing design voice.

### Wire success modal in the screen

`UpcomingClassesScreen` already tracks `feedback: string | null` after a successful booking. Replace the existing toast rendering with `<BookingSuccessSheet.Root visible={Boolean(feedback)} onDismiss={() => setFeedback(null)}>`. No new state.

## Files to be created or modified

```
openspec/changes/feat-modal-polish/
├── proposal.md
├── design.md
├── tasks.md
└── specs/class-booking/spec.md

src/shared/ui/components/
├── CancellationSheet.tsx                      (moved from features/class-booking/presentation/components/)
└── SuccessSheet.tsx                           (new — shared/ui)

src/features/class-booking/presentation/components/
└── BookingSuccessSheet.tsx                    (new — wraps shared/ui SuccessSheet with booking-specific copy)

src/features/class-booking/presentation/
├── copy/messages.ts                            (modified — adds successTitle, successDefaultMessage, successCta)
├── components/CancellationSheet.tsx            (DELETE — moved to shared/ui/components/)
└── screens/UpcomingClassesScreen.tsx          (modified — uses BookingSuccessSheet, removes toast)

__tests__/presentation/
├── CancellationSheet.test.tsx                  (modified — import path moves with the file)
└── SuccessSheet.test.tsx                       (new — shared/ui generic)
```

The deletion + recreation of `CancellationSheet.tsx` is a refactor for code organization (it's now a shared primitive). The behavior contract (`Root` + `Title` + `Description` + `Actions`) is preserved. Test imports move accordingly.

## Affected ports

- None. `BookingRepository`, `BookingStateStore`, `Clock` are unchanged.

## TDD cycle per task

RED → GREEN → REFACTOR for each new behavior.

1. **Cancellation backdrop tap dismisses** — RED test (asserts `fireEvent.press` on the backdrop calls `onKeep`), then implement.
2. **Cancellation back button dismisses** — RED test (asserts `onRequestClose` calls `onKeep`), then implement.
3. **Cancellation uses platform `<Modal>`** — RED test (asserts a `Modal` host node is in the rendered tree), then implement.
4. **Success sheet shows FR-05 message + dismisses** — RED test, then implement.
5. **UpcomingClassesScreen wires the success sheet** — RED test on screen, then update.

The 76 existing tests must remain green at every step (78 → 80+ after new tests).

## Risks

- **`<Modal>` in test renderer** — `@testing-library/react-native` renders `<Modal>` into the same tree. `fireEvent.press` on the backdrop region works once we expose a `testID` for the backdrop. `onRequestClose` is invoked by calling the prop directly (mirrors the OS gesture).
- **Animation timing in tests** — `animationType="slide"` does not animate in the test renderer. Tests assert structural / behavioral outcomes, not animation.
- **Migration of CancellationSheet from features to shared** — the import path changes for `MyBookingsScreen.tsx` and its test. Single grep + replace, but worth noting in the commit body.

## Verification

- `pnpm typecheck` clean
- `pnpm lint` 0 warnings
- `pnpm test` 80/80 passing (76 baseline + new tests for backdrop, back button, Modal host, SuccessSheet)
- `npx expo export --platform android` bundles cleanly
- Manual check (post-merge): open the app, book a class, the success modal is on top of the tab bar; open cancellation modal, tab bar does not bleed into the sheet.

## Follow-up (not in this PR)

- "Ver mi reserva" navigation action in the success modal.
- Celebration animation (confetti / checkmark drawing).
- Swipe-down-to-dismiss gesture (needs `react-native-gesture-handler`).