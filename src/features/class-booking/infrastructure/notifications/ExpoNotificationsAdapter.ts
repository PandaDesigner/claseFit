import * as Notifications from 'expo-notifications';
import type { NotificationsService } from '@features/class-booking/application/ports/NotificationsService';

const TITLE = 'ClaseFit';
const BOOKING_BODY = '¡Listo! Tu cupo está reservado';
// 5s trigger so the notification fires "immediately" when scheduled.
// (`trigger: null` would also work on Android but iOS requires a non-null trigger.)
const IMMEDIATE_TRIGGER: Notifications.TimeIntervalTriggerInput = {
  type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
  seconds: 5,
  repeats: false,
};

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
    await Notifications.scheduleNotificationAsync({
      identifier: 'booking-success',
      content: {
        title: TITLE,
        body: BOOKING_BODY,
        sound: 'default',
      },
      trigger: IMMEDIATE_TRIGGER,
    });
  }

  async scheduleCancellationSuccess(message: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      identifier: 'cancel-success',
      content: {
        title: TITLE,
        body: message,
        sound: 'default',
      },
      trigger: IMMEDIATE_TRIGGER,
    });
  }
}
