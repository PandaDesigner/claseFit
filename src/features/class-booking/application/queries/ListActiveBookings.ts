import type { BookingStateStore } from '@features/class-booking/application/ports/BookingStateStore';
import type { Clock } from '@features/class-booking/application/ports/Clock';

export interface ActiveBookingView {
  readonly id: string;
  readonly sessionId: string;
  readonly sessionName: string;
  readonly sessionStart: Date;
  readonly durationMinutes: number;
  readonly instructor: string;
  /**
   * Whether the member can cancel this booking at the current instant.
   * Mirrors the RN-04 rule: cancellation is allowed when the time until
   * the session start is >= 2 hours.
   */
  readonly cancellable: boolean;
}

export interface ListActiveBookingsDeps {
  readonly store: BookingStateStore;
  readonly clock: Clock;
}

export const CANCELLATION_WINDOW_MS = 2 * 60 * 60 * 1000;

export class ListActiveBookings {
  constructor(private readonly deps: ListActiveBookingsDeps) {}

  execute(): ActiveBookingView[] {
    const snapshot = this.deps.store.getSnapshot();
    if (!snapshot) {
      return [];
    }
    const sessions = new Map(snapshot.resolvedSessions.map((s) => [s.id, s]));
    const now = this.deps.clock.now();
    return snapshot.bookings
      .filter((booking) => booking.status === 'active')
      .map((booking) => {
        const session = sessions.get(booking.sessionId);
        if (!session) return null;
        const sessionStart = new Date(booking.sessionStartISO);
        return {
          id: booking.id,
          sessionId: booking.sessionId,
          sessionName: session.name,
          sessionStart,
          durationMinutes: session.durationMinutes,
          instructor: session.instructor,
          cancellable: sessionStart.getTime() - now.getTime() >= CANCELLATION_WINDOW_MS,
        };
      })
      .filter((value): value is ActiveBookingView => value !== null)
      .sort((a, b) => a.sessionStart.getTime() - b.sessionStart.getTime());
  }
}
