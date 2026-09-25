import type { BookingStateStore } from '@features/class-booking/application/ports/BookingStateStore';
import type { Clock } from '@features/class-booking/application/ports/Clock';
import type { BookingRepository } from '@features/class-booking/application/ports/BookingRepository';

const CANCELLATION_WINDOW_MINUTES = 120;

export interface RefreshEligibilityDeps {
  readonly repository: BookingRepository;
  readonly store: BookingStateStore;
  readonly clock: Clock;
}

export interface RefreshEligibilityResult {
  readonly cancellableBookingIds: readonly string[];
  readonly sessionsHidden: readonly string[];
}

export class RefreshEligibilityOnForeground {
  constructor(private readonly deps: RefreshEligibilityDeps) {}

  async execute(): Promise<RefreshEligibilityResult> {
    const snapshot = this.deps.store.getSnapshot();
    if (!snapshot) {
      return { cancellableBookingIds: [], sessionsHidden: [] };
    }
    const now = this.deps.clock.now();
    const cancellableBookingIds: string[] = [];
    const sessionsHidden: string[] = [];

    for (const booking of snapshot.bookings) {
      if (booking.status !== 'active') continue;
      const session = snapshot.resolvedSessions.find((s) => s.id === booking.sessionId);
      if (!session) continue;
      const start = new Date(session.startISO).getTime();
      if (start <= now.getTime()) {
        sessionsHidden.push(session.id);
        continue;
      }
      const minutes = (start - now.getTime()) / 60000;
      if (minutes >= CANCELLATION_WINDOW_MINUTES) {
        cancellableBookingIds.push(booking.id);
      }
    }

    return { cancellableBookingIds, sessionsHidden };
  }
}
