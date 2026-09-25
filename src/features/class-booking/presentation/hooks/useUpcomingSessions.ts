import { useEffect, useState } from 'react';
import type { BookingStateStore } from '@features/class-booking/application/ports/BookingStateStore';
import type { Clock } from '@features/class-booking/application/ports/Clock';
import {
  ListUpcomingSessions,
  type UpcomingSessionView,
} from '@features/class-booking/application/queries/ListUpcomingSessions';

export interface UseUpcomingSessionsResult {
  readonly sessions: readonly UpcomingSessionView[];
}

export function useUpcomingSessions(
  store: BookingStateStore,
  clock: Clock,
): UseUpcomingSessionsResult {
  const [sessions, setSessions] = useState<readonly UpcomingSessionView[]>(() =>
    new ListUpcomingSessions({ store, clock }).execute(),
  );

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setSessions(new ListUpcomingSessions({ store, clock }).execute());
    });
    return () => {
      unsubscribe();
    };
  }, [store, clock]);

  return { sessions };
}
