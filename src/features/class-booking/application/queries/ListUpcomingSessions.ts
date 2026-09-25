import type { BookingStateStore } from '@features/class-booking/application/ports/BookingStateStore';
import type { Clock } from '@features/class-booking/application/ports/Clock';

export interface UpcomingSessionView {
  readonly id: string;
  readonly name: string;
  readonly instructor: string;
  readonly start: Date;
  readonly durationMinutes: number;
  readonly capacity: number;
  readonly occupiedByOthers: number;
  readonly available: number;
  readonly isFull: boolean;
  readonly isAlreadyReserved: boolean;
}

export interface ListUpcomingSessionsDeps {
  readonly store: BookingStateStore;
  readonly clock: Clock;
}

const THREE_DAY_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

export class ListUpcomingSessions {
  constructor(private readonly deps: ListUpcomingSessionsDeps) {}

  execute(): UpcomingSessionView[] {
    const snapshot = this.deps.store.getSnapshot();
    if (!snapshot) {
      return [];
    }
    const now = this.deps.clock.now();
    const horizon = now.getTime() + THREE_DAY_WINDOW_MS;

    const activeBySession = new Map<string, number>();
    for (const booking of snapshot.bookings) {
      if (booking.status !== 'active') continue;
      activeBySession.set(booking.sessionId, (activeBySession.get(booking.sessionId) ?? 0) + 1);
    }

    const sessions = snapshot.resolvedSessions
      .map((dto) => {
        const start = new Date(dto.startISO);
        return { dto, start };
      })
      .filter(({ start }) => start.getTime() > now.getTime() && start.getTime() <= horizon)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    return sessions.map(({ dto, start }) => {
      const memberActive = activeBySession.get(dto.id) ?? 0;
      const available = Math.max(0, dto.capacity - dto.occupiedByOthers - memberActive);
      return {
        id: dto.id,
        name: dto.name,
        instructor: dto.instructor,
        start,
        durationMinutes: dto.durationMinutes,
        capacity: dto.capacity,
        occupiedByOthers: dto.occupiedByOthers,
        available,
        isFull: available === 0,
        isAlreadyReserved: memberActive > 0,
      };
    });
  }
}
