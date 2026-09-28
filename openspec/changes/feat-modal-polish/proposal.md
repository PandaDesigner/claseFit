## Why

Three related gaps in the modal layer:

1. **Cancellation modal is covered by the tab bar.** `CancellationSheet` (PR #1) renders an absolute `<View>` overlay with the sheet at the bottom of the screen. The `FloatingTabBar` is also absolute at the bottom, rendered at the navigator level (sibling of the screen). The tab bar ends up on top of the bottom of the modal sheet — the "Mantener reserva" / "Sí, cancelar" pills are still tappable, but the modal visually crashes into the tab bar in any state where the sheet reaches the tab bar's height.

2. **No success modal after a successful booking.** The current `UpcomingClassesScreen` shows a small feedback toast at the bottom after a successful booking: `{feedback ? <View>...{feedback}</View> : null}`. The PRD requires the literal `¡Listo! Tu cupo está reservado` feedback (FR-05), and the design model implies a modal — not a toast. There is also no recovery action ("Listo") that closes the sheet cleanly.

3. **Cancellation feedback toast is covered by the tab bar in `MyBookingsScreen`.** After the cancellation modal closes (slide down), a feedback toast with a "Cerrar" button appears at `position: absolute; bottom: 24px`. The `FloatingTabBar` covers the bottom ~80–130 px of the screen, so the "Cerrar" button is hidden behind the tab bar. The user can see the toast but cannot interact with its action.

All three share a single fix path: use the platform `<Modal>` component (which renders above the navigator tree, so the tab bar cannot cover it) for every sheet and feedback in the app. `CancellationSheet`, `BookingSuccessSheet` (booking), and the cancellation feedback in `MyBookingsScreen` all become platform modals. A generic `SuccessSheet` primitive in `shared/ui` powers the two feedback flows; `BookingSuccessSheet` pre-fills the booking copy.

## What Changes

### New Capabilities

- `class-booking-success-modal`: `BookingSuccessSheet` shows FR-05 verbatim ("¡Listo! Tu cupo está reservado") with a single `Listo` CTA. Replaces the current feedback toast in `UpcomingClassesScreen`.
- `cancellation-feedback-modal`: the post-cancellation feedback in `MyBookingsScreen` uses a `SuccessSheet` (generic primitive) with the literal cancellation copy. Replaces the feedback toast whose `Cerrar` button was hidden behind the tab bar.
- `platform-modal-polish`: `CancellationSheet` switches from a custom absolute `<View>` overlay to React Native's `<Modal>` (`transparent`, `animationType="slide"`, `onRequestClose`). Backdrop tap and Android hardware back button both dismiss as `onKeep`.

### Modified Capabilities

- `class-booking` (delta): every feedback and confirmation surface SHALL use the platform `<Modal>` primitive. The cancellation confirmation modal and both feedback surfaces SHALL NOT be visually covered by the floating tab bar.

## Impact

- **`CancellationSheet.tsx`**: replace absolute overlay with `<Modal>` + add `<Pressable>` backdrop + wire `onRequestClose`. Title size bumped to `fontSize.hero (36)`.
- **New file** `SuccessSheet.tsx` (shared/ui): reusable compound modal — `SuccessSheet.Root` + `SuccessSheet.Message` + `SuccessSheet.Actions`. Same `<Modal>` primitive as `CancellationSheet`.
- **`UpcomingClassesScreen.tsx`**: replace the feedback toast with `<SuccessSheet.Root visible={Boolean(feedback)} onDismiss={...}><SuccessSheet.Message .../><SuccessSheet.Actions .../></SuccessSheet.Root>`.
- **`messages.ts`**: add `successTitle`, `successDefaultMessage`, `successCta` keys (with literal FR-05 default), and reuse existing `cancelPrompt` / `cancelDescription` for the cancellation modal.
- **No domain change.** No new ports, no new use cases.

## Non-goals

- No new buttons inside the success modal (e.g., "Ver mi reserva"). The success modal just confirms and dismisses; navigation to "Mis reservas" is a follow-up.
- No swipe-down-to-dismiss gesture (would require `react-native-gesture-handler` or `react-native-reanimated`).
- No light/dark mode split.
- No celebration animation (confetti, etc.). The sheet slides up and that's it.
