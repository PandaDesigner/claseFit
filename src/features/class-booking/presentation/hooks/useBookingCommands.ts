import { useCallback } from 'react';
import type { BookClass } from '@features/class-booking/application/use-cases/BookClass';
import type { CancelBooking } from '@features/class-booking/application/use-cases/CancelBooking';
import type { NotificationsService } from '@features/class-booking/application/ports/NotificationsService';

export interface BookingCommandsDeps {
  readonly bookClass: BookClass;
  readonly cancelBooking: CancelBooking;
  readonly notifications: NotificationsService;
}

export interface BookingCommandsResult {
  readonly book: (
    sessionId: string,
  ) => Promise<{ status: 'success' | 'rejected'; message: string }>;
  readonly cancel: (
    bookingId: string,
  ) => Promise<{ status: 'success' | 'rejected'; message: string }>;
  /**
   * Request notification permissions. Should be called once at app launch
   * (e.g. from App.tsx); idempotent.
   */
  readonly requestNotificationPermissions: () => Promise<boolean>;
}

export function useBookingCommands(deps: BookingCommandsDeps): BookingCommandsResult {
  const book = useCallback(
    async (sessionId: string) => {
      const result = await deps.bookClass.execute({ sessionId });
      if (result.status === 'success') {
        // Fire-and-forget — the notification is a side-effect that must not
        // gate the booking command's own result.
        void deps.notifications.scheduleBookingSuccess();
      }
      return result;
    },
    [deps.bookClass, deps.notifications],
  );

  const cancel = useCallback(
    async (bookingId: string) => {
      const result = await deps.cancelBooking.execute({ bookingId });
      if (result.status === 'success') {
        void deps.notifications.scheduleCancellationSuccess(result.message);
      }
      return result;
    },
    [deps.cancelBooking, deps.notifications],
  );

  const requestNotificationPermissions = useCallback(
    () => deps.notifications.requestPermissions(),
    [deps.notifications],
  );

  return { book, cancel, requestNotificationPermissions };
}
