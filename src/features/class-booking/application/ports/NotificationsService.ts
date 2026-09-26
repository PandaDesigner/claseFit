/**
 * Port for scheduling native OS local notifications.
 *
 * The adapter is platform-specific (`expo-notifications` for both iOS and
 * Android). The port intentionally stays minimal — only the methods the
 * presentation layer needs to surface the FR-05 booking success and the
 * cancellation outcome.
 *
 * Permission flow is exposed via `requestPermissions` so the caller can
 * decide when to ask (typically at app launch, non-blocking).
 */
export interface NotificationsService {
  /**
   * Ask the OS for notification permissions. Returns whether the user granted
   * (at least) the `alert` capability. Calling more than once is a no-op if
   * the OS already has a cached decision.
   */
  requestPermissions(): Promise<boolean>;

  /**
   * Schedule a local notification confirming a successful booking.
   * Title: `ClaseFit`. Body: `¡Listo! Tu cupo está reservado` (FR-05).
   * Fires within a few seconds of scheduling.
   */
  scheduleBookingSuccess(): Promise<void>;

  /**
   * Schedule a local notification confirming a successful cancellation.
   * Title: `ClaseFit`. Body: the cancellation outcome message (e.g. the
   * rejection reason or the success message from `CancelBooking.execute`).
   */
  scheduleCancellationSuccess(message: string): Promise<void>;
}
