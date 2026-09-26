import { useCallback } from 'react';
import type { BookClass } from '@features/class-booking/application/use-cases/BookClass';
import type { CancelBooking } from '@features/class-booking/application/use-cases/CancelBooking';

export interface BookingCommandsResult {
  readonly book: (
    sessionId: string,
  ) => Promise<{ status: 'success' | 'rejected'; message: string }>;
  readonly cancel: (
    bookingId: string,
  ) => Promise<{ status: 'success' | 'rejected'; message: string }>;
}

export function useBookingCommands(deps: {
  readonly bookClass: BookClass;
  readonly cancelBooking: CancelBooking;
}): BookingCommandsResult {
  const book = useCallback(
    (sessionId: string) => deps.bookClass.execute({ sessionId }),
    [deps.bookClass],
  );
  const cancel = useCallback(
    (bookingId: string) => deps.cancelBooking.execute({ bookingId }),
    [deps.cancelBooking],
  );
  return { book, cancel };
}
