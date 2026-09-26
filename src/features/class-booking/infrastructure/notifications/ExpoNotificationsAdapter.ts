import * as Notifications from 'expo-notifications';
import type { NotificationsService } from '@features/class-booking/application/ports/NotificationsService';

const TITLE = 'ClaseFit';
const BOOKING_BODY = '¡Listo! Tu cupo está reservado';
// `trigger: null` fires the notification immediately on both iOS and Android.
// A null trigger is the only way to get truly-instant delivery on Android —
// any positive `seconds` value makes the system wait that long, which is
// confusing UX for a "your booking just succeeded" feedback.
const IMMEDIATE_TRIGGER = null;

/**
 * Set the handler that runs when a notification arrives while the app is in
 * the foreground. By default iOS suppresses foreground notifications, which
 * would hide our booking / cancellation success feedback from the user.
 *
 * Must be called once at app startup (see `App.tsx`).
 */
export function configureForegroundNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export class ExpoNotificationsAdapter implements NotificationsService {
  async requestPermissions(): Promise<boolean> {
    const settings = await Notifications.getPermissionsAsync();
    if (
      settings.granted ||
      settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    ) {
      return true;
    }
    const requested = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    });
    return Boolean(
      requested.granted ||
        requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL,
    );
  }

  async scheduleBookingSuccess(): Promise<void> {
    await this.safeSchedule({
      identifier: 'booking-success',
      body: BOOKING_BODY,
    });
  }

  async scheduleCancellationSuccess(message: string): Promise<void> {
    await this.safeSchedule({
      identifier: 'cancel-success',
      body: message,
    });
  }

  /**
   * Wrap `scheduleNotificationAsync` so the presentation layer can `void` the
   * call without crashing the app if the OS rejects the schedule (e.g. the
   * user denied the permission, or the identifier collides with a still-
   * pending notification). The notification is best-effort feedback, not a
   * critical side-effect of the booking / cancellation command.
   */
  private async safeSchedule(payload: {
    readonly identifier: string;
    readonly body: string;
  }): Promise<void> {
    try {
      // Cancel any prior notification with the same identifier so the latest
      // success always wins (e.g. cancelling-then-rebooking the same class).
      await Notifications.cancelScheduledNotificationAsync(payload.identifier);
      await Notifications.scheduleNotificationAsync({
        identifier: payload.identifier,
        content: {
          title: TITLE,
          body: payload.body,
          sound: 'default',
        },
        trigger: IMMEDIATE_TRIGGER,
      });
    } catch (error) {
      console.warn(
        `[Notifications] Failed to schedule ${payload.identifier}:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
