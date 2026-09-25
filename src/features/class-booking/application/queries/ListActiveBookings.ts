import type { BookingStateStore } from '@features/class-booking/application/ports/BookingStateStore';

export interface ActiveBookingView {
  readonly id: string;
  readonly sessionId: string;
  readonly sessionName: string;
  readonly sessionStart: Date;
  readonly durationMinutes: number;
  readonly instructor: string;
}

export interface ListActiveBookingsDeps {
  readonly store: BookingStateStore;
}

export class ListActiveBookings {
  constructor(private readonly deps: ListActiveBookingsDeps) {}

  execute(): ActiveBookingView[] {
    const snapshot = this.deps.store.getSnapshot();
    if (!snapshot) {
      return [];
    }
    const sessions = new Map(snapshot.resolvedSessions.map((s) => [s.id, s]));
    return snapshot.bookings
      .filter((booking) => booking.status === 'active')
      .map((booking) => {
        const session = sessions.get(booking.sessionId);
        if (!session) return null;
        return {
          id: booking.id,
          sessionId: booking.sessionId,
          sessionName: session.name,
          sessionStart: new Date(booking.sessionStartISO),
          durationMinutes: session.durationMinutes,
          instructor: session.instructor,
        };
      })
      .filter((value): value is ActiveBookingView => value !== null)
      .sort((a, b) => a.sessionStart.getTime() - b.sessionStart.getTime());
  }
}
