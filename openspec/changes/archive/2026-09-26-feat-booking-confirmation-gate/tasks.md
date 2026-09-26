## 1. BookingGateSheet primitive (shared/ui)

- [x] 1.1 **RED** — Add `__tests__/presentation/BookingGateSheet.test.tsx` covering: (a) renders prompt + description (default copy), (b) "Elegir otra" pill calls `onCancel`, (c) "Sí, reservar" pill calls `onConfirm`, (d) backdrop press calls `onCancel`, (e) preview card renders when `sessionPreview` is provided. Mirror `CancellationSheet.test.tsx` shape. *(ref: `booking-confirmation-gate` spec §"Booking requires an explicit confirmation gate" + §"Gate renders a preview of the selected session")*
- [x] 1.2 **GREEN** — Create `src/shared/ui/components/BookingGateSheet.tsx` mirroring `CancellationSheet.tsx`.
- [x] 1.3 **REFACTOR** — Verify the compound API matches `CancellationSheet`. Add `accessibilityViewIsModal` on the `<Modal>`.

## 2. NotificationsService port + adapter (application + infrastructure)

- [ ] 2.1 **RED** — Add `__tests__/infrastructure/Notifications.test.ts` (or extend `Composition.test.ts`) asserting that:
  - `InMemoryNotificationsAdapter` records every call to `scheduleBookingSuccess` and `scheduleCancellationSuccess`.
  - `ExpoNotificationsAdapter.scheduleBookingSuccess` schedules a notification with title `ClaseFit` and body `¡Listo! Tu cupo está reservado` and trigger `5s` (effectively immediate).
  - `ExpoNotificationsAdapter.scheduleCancellationSuccess('Reserva cancelada.')` schedules a notification with title `ClaseFit`, body `Reserva cancelada.`, identifier `cancel-success`.
  - `ExpoNotificationsAdapter.requestPermissions()` returns the granted boolean from `getPermissionsAsync`.
  - Mock `expo-notifications` via `jest.mock`. *(ref: `booking-success-notification` spec §"Native local notification is scheduled after booking success")*
- [ ] 2.2 **GREEN** — Create:
  - `src/features/class-booking/application/ports/NotificationsService.ts` (port).
  - `src/features/class-booking/infrastructure/notifications/InMemoryNotificationsAdapter.ts` (test double).
  - `src/features/class-booking/infrastructure/notifications/ExpoNotificationsAdapter.ts` (production). Title from `messages.brandWordmark`, body from the message string, `trigger: { seconds: 5 }` so it fires immediately when scheduled.
- [ ] 2.3 **REFACTOR** — Composition wires `ExpoNotificationsAdapter` in `buildProductionComposition` and `InMemoryNotificationsAdapter` in `buildTestComposition`. Add the port to the `Composition` interface. Run typecheck + lint.

## 3. Wire the gate into UpcomingClassesScreen

- [x] 3.1 **RED** — Rewrite `__tests__/presentation/screens/UpcomingClassesScreen.test.tsx` (booking gate path).
- [x] 3.2 **GREEN** — Modify `src/features/class-booking/presentation/screens/UpcomingClassesScreen.tsx` to mount `BookingGateSheet` on Reservar tap.
- [x] 3.3 **REFACTOR** — Memoize callbacks.

## 4. Replace the in-app SuccessCheckmark with the native notification trigger

- [ ] 4.1 **RED** — Update `__tests__/presentation/hooks/useBookingCommands.test.ts` (or add one) asserting that on successful `book` the `NotificationsService.scheduleBookingSuccess` is called exactly once, and on successful `cancel` `scheduleCancellationSuccess(message)` is called exactly once with the result message. *(ref: `booking-success-notification` spec §"Native local notification is scheduled after booking success" + `class-booking` spec §"Post-action feedback uses the native notification, never a platform Modal")*
- [ ] 4.2 **GREEN** — Modify `src/features/class-booking/presentation/hooks/useBookingCommands.ts` to accept `notifications: NotificationsService` and fire the notifications on success.
- [ ] 4.3 **GREEN** — Update both screens to remove the `confirmedSessionId` / `cancelFeedback` state slots and the `<SuccessCheckmark>` renders.
- [ ] 4.4 **REFACTOR** — Strengthen the screen tests to assert the in-app overlay is gone (no "¡Listo!" / "Reserva cancelada" `<Text>` in the DOM after success — only the notification port saw the call).

## 5. Cleanup

- [x] 5.1 Delete `src/features/class-booking/presentation/components/BookingSuccessSheet.tsx`.
- [x] 5.2 Add copy keys to `messages.ts`: `bookGatePrompt`, `bookGateDescription`, `bookGateConfirm`, `bookGateCancel`. (Currently unused since gate copy is hardcoded inside `BookingGateSheet.tsx` — reserved for future use.)
- [ ] 5.3 Delete `src/shared/ui/components/SuccessCheckmark.tsx`.
- [ ] 5.4 Delete `__tests__/presentation/SuccessCheckmark.test.tsx`.

## 6. Verification

- [ ] 6.1 `pnpm typecheck` — 0 errors.
- [ ] 6.2 `pnpm lint --max-warnings 0` — 0 warnings.
- [ ] 6.3 `pnpm test` — all suites green.
- [ ] 6.4 `npx expo export --platform android` — bundle exits 0.
- [ ] 6.5 `openspec validate feat-booking-confirmation-gate --strict` — valid.
- [ ] 6.6 Manual sanity check on a real device: tap Reservar → confirm → booking notification appears in the notification center with "ClaseFit" title and "¡Listo! Tu cupo está reservado" body; cancel a reservation → cancellation notification appears; switching tabs after a cancel does NOT stack native modals (since there are no native modals any more).
