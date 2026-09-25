import { ListUpcomingSessions } from '@features/class-booking/application/queries/ListUpcomingSessions';
import { ListActiveBookings } from '@features/class-booking/application/queries/ListActiveBookings';
import { InMemoryBookingStateAdapter } from '@features/class-booking/infrastructure/state/InMemoryBookingStateAdapter';
import { FixedClock } from '@features/class-booking/infrastructure/time/FixedClock';
import type { SnapshotDTO } from '@features/class-booking/application/dto/SnapshotDTO';
import { CURRENT_SCHEMA_VERSION } from '@features/class-booking/application/dto/SnapshotDTO';

const NOW = new Date('2026-03-02T13:00:00.000-05:00');

function snapshot(): SnapshotDTO {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    datasetVersion: 1,
    baseDateBogota: '2026-03-02',
    resolvedSessions: [
      {
        id: 'C-01',
        name: 'Spinning',
        instructor: 'Andrés Restrepo',
        startISO: '2026-03-02T13:00:00.000Z',
        durationMinutes: 45,
        capacity: 20,
        occupiedByOthers: 18,
      },
      {
        id: 'C-09',
        name: 'Spinning',
        instructor: 'Andrés Restrepo',
        startISO: '2026-03-04T13:00:00.000Z',
        durationMinutes: 45,
        capacity: 20,
        occupiedByOthers: 13,
      },
      {
        id: 'PAST',
        name: 'Yoga',
        instructor: 'Valentina Ríos',
        startISO: '2026-03-02T11:00:00.000Z',
        durationMinutes: 60,
        capacity: 12,
        occupiedByOthers: 4,
      },
    ],
    bookings: [
      {
        id: 'R-01',
        sessionId: 'C-01',
        sessionStartISO: '2026-03-02T13:00:00.000Z',
        status: 'active',
        createdAtISO: '2026-03-01T10:00:00.000-05:00',
      },
      {
        id: 'R-02',
        sessionId: 'C-09',
        sessionStartISO: '2026-03-04T13:00:00.000Z',
        status: 'active',
        createdAtISO: '2026-03-01T10:00:00.000-05:00',
      },
      {
        id: 'R-03',
        sessionId: 'C-09',
        sessionStartISO: '2026-03-04T13:00:00.000Z',
        status: 'cancelled',
        createdAtISO: '2026-03-01T10:00:00.000-05:00',
        cancelledAtISO: '2026-03-02T08:00:00.000-05:00',
      },
    ],
  };
}

describe('ListUpcomingSessions', () => {
  it('hides sessions that already started', () => {
    const store = new InMemoryBookingStateAdapter();
    store.replaceSnapshot(snapshot());
    const query = new ListUpcomingSessions({ store, clock: new FixedClock(NOW) });
    const sessions = query.execute();
    expect(sessions.map((s) => s.id)).toEqual(['C-09']);
  });

  it('marks booked sessions as already-reserved', () => {
    const store = new InMemoryBookingStateAdapter();
    const sessionAt = new Date('2026-03-03T13:00:00.000Z');
    const bookingStart = new Date('2026-03-04T13:00:00.000Z');
    store.replaceSnapshot({
      ...snapshot(),
      resolvedSessions: [
        {
          id: 'C-NEXT',
          name: 'Funcional',
          instructor: 'Camila Ospina',
          startISO: sessionAt.toISOString(),
          durationMinutes: 60,
          capacity: 15,
          occupiedByOthers: 9,
        },
        {
          id: 'C-09',
          name: 'Spinning',
          instructor: 'Andrés Restrepo',
          startISO: bookingStart.toISOString(),
          durationMinutes: 45,
          capacity: 20,
          occupiedByOthers: 13,
        },
      ],
      bookings: [
        {
          id: 'R-FUTURE',
          sessionId: 'C-NEXT',
          sessionStartISO: sessionAt.toISOString(),
          status: 'active',
          createdAtISO: '2026-03-01T10:00:00.000-05:00',
        },
      ],
    });
    const query = new ListUpcomingSessions({ store, clock: new FixedClock(NOW) });
    const sessions = query.execute();
    const next = sessions.find((s) => s.id === 'C-NEXT');
    expect(next?.isAlreadyReserved).toBe(true);
    const other = sessions.find((s) => s.id === 'C-09');
    expect(other?.isAlreadyReserved).toBe(false);
  });

  it('returns an empty array when no snapshot is hydrated', () => {
    const store = new InMemoryBookingStateAdapter();
    const query = new ListUpcomingSessions({ store, clock: new FixedClock(NOW) });
    expect(query.execute()).toEqual([]);
  });
});

describe('ListActiveBookings', () => {
  it('returns only active bookings ordered by start', () => {
    const store = new InMemoryBookingStateAdapter();
    store.replaceSnapshot(snapshot());
    const query = new ListActiveBookings({ store });
    const bookings = query.execute();
    expect(bookings.map((b) => b.id)).toEqual(['R-01', 'R-02']);
  });

  it('returns an empty array when no snapshot is hydrated', () => {
    const store = new InMemoryBookingStateAdapter();
    const query = new ListActiveBookings({ store });
    expect(query.execute()).toEqual([]);
  });
});
