## Why

Booking a class on `UpcomingClassesScreen` runs immediately on tap — there is no confirmation gate between the user pressing "Reservar →" and the booking being persisted. The post-booking success surface is a platform `<Modal>` whose title says "¡Listo!" and whose message body also begins with "¡Listo! Tu cupo está reservado", so the word "¡Listo!" appears twice in close vertical proximity inside the same modal — users perceive the modal as "duplicated" and the success feedback requires a manual tap to dismiss.

In parallel, the cancellation feedback on `MyBookingsScreen` was migrated from an absolute `<View>` toast to a platform `<SuccessSheet>` `<Modal>` in PR #5/6 (commit `04f010e`) to clear the floating tab bar. React Navigation's `Tab.Navigator` keeps both screens mounted simultaneously (no `lazy` / `freezeOnBlur` / `detachInactiveScreens`), so the two `<Modal>`s render in the same native window above the navigator — when the user cancels in `Mis reservas` and then reserves in `Clases`, the "Reserva cancelada" modal from the (still-mounted) `Mis reservas` screen and the "¡Listo!" modal from the active `Clases` screen overlap visibly.

After the previous changes in this proposal replaced both modal-based feedbacks with an in-app `SuccessCheckmark` `Animated.View` overlay (which fixes the cross-tab stacking), the user provided a reference design showing the desired feedback as a **native OS push notification** — the green app icon + "ClaseFit" title + "¡Listo! Tu cupo está reservado" body in the dark rounded card on the system notification surface. This change therefore replaces the in-app `Animated.View` overlay with a native local push notification (`expo-notifications`) for both the booking success and the cancellation success feedback, matching the provided visual reference and the user's stated UX intent.

## What Changes

- **Booking becomes a two-step flow.** Tapping "Reservar →" opens a confirmation gate (`BookingGateSheet`); only when the user taps "Sí, reservar" does the booking actually persist.
- **The gate is cancelable** in three ways: "Elegir otra" pill, backdrop tap, and Android hardware back button — all close the gate without booking.
- **After a successful booking**, the app fires a native local push notification with the FR-05 literal as the body — exactly matching the user-provided reference design (green app icon, "ClaseFit" title, dark rounded card).
- **After a successful cancellation**, the app fires a native local push notification with the cancellation outcome as the body (same chrome as the booking notification, body changes only).
- **Native permission flow** runs once on first launch (requesting `alert` + `sound` permissions via `useNotificationPermissions` hook) and is non-blocking — denied permissions mean the in-app feedback still works without a system notification.
- **The "duplicated ¡Listo!" copy** is gone: the gate's prompt is "Reservar esta clase?" and the success notification body is the FR-05 literal.
- **The cancellation feedback surface** is migrated from a platform `<Modal>` to the same native local push notification channel — eliminating the cross-tab modal stacking that occurred when both screens were mounted simultaneously.

## Capabilities

### New Capabilities

- `booking-confirmation-gate`: a platform `<Modal>` primitive that gates the `BookClass` use case. Renders the selected class as a preview and asks the user to confirm or pick another. Pattern mirrors `CancellationSheet`.
- `booking-success-notification`: a native OS local push notification fired after a successful `BookClass`, displaying the FR-05 literal as the body. Triggered from the presentation layer via a `NotificationsService` port + adapter pair (port in `application/ports`, adapter in `infrastructure/notifications`).

### Modified Capabilities

- `class-booking`: the booking flow on `UpcomingClassesScreen` SHALL require an explicit confirmation gate before persisting; on success, a native local push notification SHALL fire with the FR-05 literal as the body. The cancellation flow on `MyBookingsScreen` SHALL fire a native local push notification with the cancellation outcome as the body, NEVER as a platform `<Modal>`, so that switching tabs after a cancellation does not leave a native modal stacked over the next screen.

## Impact

- **`package.json`**: add `expo-notifications@~57.0.21`.
- **`app.json`**: add the `notification` plugin config (icon, color) — `expo-notifications` autolinks via Expo SDK 57.
- **`src/features/class-booking/application/ports/NotificationsService.ts`** _(new)_: port with `requestPermissions(): Promise<boolean>` + `scheduleBookingSuccess(): Promise<void>` + `scheduleCancellationSuccess(message: string): Promise<void>`.
- **`src/features/class-booking/infrastructure/notifications/ExpoNotificationsAdapter.ts`** _(new)_: implements the port via `expo-notifications` `scheduleNotificationAsync` with a 5-second trigger (so the notification fires immediately). Title `messages.brandWordmark` ("ClaseFit"), body from the message, identifier `"booking-success"` or `"cancel-success"`.
- **`src/features/class-booking/infrastructure/notifications/InMemoryNotificationsAdapter.ts`** _(new)_: test double that records every notification request.
- **`src/features/class-booking/composition.ts`**: add the `notifications: NotificationsService` field to `Composition`; wire `ExpoNotificationsAdapter` in `buildProductionComposition` and `InMemoryNotificationsAdapter` in `buildTestComposition`.
- **`src/features/class-booking/presentation/hooks/useBookingCommands.ts`**: accept the port as a third dependency; call `notifications.scheduleBookingSuccess()` when `book` resolves with `status: 'success'`; call `notifications.scheduleCancellationSuccess(result.message)` when `cancel` resolves with `status: 'success'`.
- **`src/shared/ui/components/SuccessCheckmark.tsx`** _(delete)_: the in-app overlay is no longer needed — its job is now done by the native push notification.
- **`__tests__/presentation/SuccessCheckmark.test.tsx`** _(delete)_.
- **`src/features/class-booking/presentation/screens/UpcomingClassesScreen.tsx`**: drop the `confirmedSessionId` state + `<SuccessCheckmark>` render. The `useBookingCommands` hook now handles the notification.
- **`src/features/class-booking/presentation/screens/MyBookingsScreen.tsx`**: drop the `cancelFeedback` state + `<SuccessCheckmark>` render. The `useBookingCommands` hook now handles the notification.
- **`__tests__/presentation/screens/UpcomingClassesScreen.test.tsx`**: replace the "FR-05 literal appears exactly once" assertion with "the notifications port received `scheduleBookingSuccess` exactly once after confirm". Assert the in-app overlay (FR-05 literal) is no longer in the tree.
- **`__tests__/presentation/screens/MyBookingsScreen.test.tsx`**: replace the `SuccessCheckmark` assertion with "the notifications port received `scheduleCancellationSuccess` exactly once after confirm". Assert no `<Modal>` from `MyBookingsScreen` displays the legacy "Reserva cancelada" title.
- **OpenSpec delta** at `openspec/changes/feat-booking-confirmation-gate/specs/class-booking/spec.md` covers the modified capability.

## Non-goals

- No celebration animation beyond the native notification chrome (no confetti, haptics, sound).
- No swipe-down-to-dismiss gesture on the gate (would require `react-native-gesture-handler` or `react-native-reanimated`, both out of scope per `feat-animations`).
- No remote / server-pushed notifications — only local notifications fired from the device.
- No notification inbox UI inside the app — users tap the notification to return to the app; the in-app overlay is gone.
- No light/dark mode split.
- No changes to React Navigation's tab behaviour (`lazy` / `detachInactiveScreens` etc.) — the surface migration is the fix, not the navigator config.
- No domain, application rule, or infrastructure persistence change — this change is presentation + a thin infrastructure port adapter.
