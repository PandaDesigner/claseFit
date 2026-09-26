import { useEffect, useState } from 'react';
import type { BookingStateStore } from '@features/class-booking/application/ports/BookingStateStore';
import type { Clock } from '@features/class-booking/application/ports/Clock';
import {
  ListActiveBookings,
  type ActiveBookingView,
} from '@features/class-booking/application/queries/ListActiveBookings';

export interface UseMyBookingsResult {
  readonly bookings: readonly ActiveBookingView[];
}

export function useMyBookings(store: BookingStateStore, clock: Clock): UseMyBookingsResult {
  const [bookings, setBookings] = useState<readonly ActiveBookingView[]>(() =>
    new ListActiveBookings({ store, clock }).execute(),
  );

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setBookings(new ListActiveBookings({ store, clock }).execute());
    });
    return () => {
      unsubscribe();
    };
  }, [store, clock]);

  return { bookings };
}
