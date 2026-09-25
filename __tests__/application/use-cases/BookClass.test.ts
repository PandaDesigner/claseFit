import { BookClass } from '@features/class-booking/application/use-cases/BookClass';
import { InMemoryBookingRepository } from '@features/class-booking/infrastructure/persistence/InMemoryBookingRepository';
import { InMemoryBookingStateAdapter } from '@features/class-booking/infrastructure/state/InMemoryBookingStateAdapter';
import { FixedClock } from '@features/class-booking/infrastructure/time/FixedClock';
import type { SnapshotDTO } from '@features/class-booking/application/dto/SnapshotDTO';
import { CURRENT_SCHEMA_VERSION } from '@features/class-booking/application/dto/SnapshotDTO';

const CLOCK_NOW = new Date('2026-03-02T08:00:00.000-05:00');

function snapshot(opts: {
  readonly sessions: readonly {
    id: string;
    capacity: number;
    occupiedByOthers: number;
    startISO: string;
  }[];
  readonly bookings?: readonly {
    id: string;
    sessionId: string;
    sessionStartISO: string;
    status: 'active' | 'cancelled';
    createdAtISO: string;
    cancelledAtISO?: string;
  }[];
}): SnapshotDTO {
  const sessions = opts.sessions.map((session, index) => ({
    id: session.id,
    name: `Session ${index}`,
    instructor: 'Coach',
    startISO: session.startISO,
    durationMinutes: 45,
    capacity: session.capacity,
    occupiedByOthers: session.occupiedByOthers,
  }));
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    datasetVersion: 1,
    baseDateBogota: '2026-03-02',
    resolvedSessions: sessions,
    bookings: opts.bookings ?? [],
  };
}

describe('BookClass', () => {
  it('creates an active reservation and surfaces the success message', async () => {
    const repo = new InMemoryBookingRepository();
    const store = new InMemoryBookingStateAdapter();
    const clock = new FixedClock(CLOCK_NOW);
    const initial = snapshot({
      sessions: [
        { id: 'C-01', capacity: 20, occupiedByOthers: 18, startISO: '2026-03-02T23:00:00.000Z' },
      ],
    });
    store.replaceSnapshot(initial);

    const useCase = new BookClass({ repository: repo, store, clock });
    const result = await useCase.execute({ sessionId: 'C-01' });

    expect(result.status).toBe('success');
    expect(result.message).toBe('¡Listo! Tu cupo está reservado');
    const after = store.getSnapshot();
    expect(after?.bookings).toHaveLength(1);
    expect(after?.bookings[0]?.sessionId).toBe('C-01');
    expect(after?.bookings[0]?.status).toBe('active');
  });

  it('rejects with RN-01 when the session has no seats', async () => {
    const repo = new InMemoryBookingRepository();
    const store = new InMemoryBookingStateAdapter();
    const clock = new FixedClock(CLOCK_NOW);
    store.replaceSnapshot(
      snapshot({
        sessions: [
          {
            id: 'C-08',
            capacity: 30,
            occupiedByOthers: 30,
            startISO: '2026-03-02T19:00:00.000-05:00',
          },
        ],
      }),
    );

    const useCase = new BookClass({ repository: repo, store, clock });
    const result = await useCase.execute({ sessionId: 'C-08' });

    expect(result.status).toBe('rejected');
    expect(result.message).toBe('Esta clase ya no tiene cupos.');
    expect(store.getSnapshot()?.bookings).toHaveLength(0);
  });

  it('rejects with RN-02 when the member already holds an active booking for the session', async () => {
    const repo = new InMemoryBookingRepository();
    const store = new InMemoryBookingStateAdapter();
    const clock = new FixedClock(CLOCK_NOW);
    store.replaceSnapshot(
      snapshot({
        sessions: [
          { id: 'C-01', capacity: 20, occupiedByOthers: 18, startISO: '2026-03-02T23:00:00.000Z' },
        ],
        bookings: [
          {
            id: 'R-01',
            sessionId: 'C-01',
            sessionStartISO: '2026-03-02T23:00:00.000Z',
            status: 'active',
            createdAtISO: '2026-03-02T07:00:00.000-05:00',
          },
        ],
      }),
    );

    const useCase = new BookClass({ repository: repo, store, clock });
    const result = await useCase.execute({ sessionId: 'C-01' });

    expect(result.status).toBe('rejected');
    expect(result.message).toBe('Ya reservaste esta clase.');
    expect(store.getSnapshot()?.bookings).toHaveLength(1);
  });

  it('rejects with RN-03 when the daily limit is already reached', async () => {
    const repo = new InMemoryBookingRepository();
    const store = new InMemoryBookingStateAdapter();
    const clock = new FixedClock(CLOCK_NOW);
    store.replaceSnapshot(
      snapshot({
        sessions: [
          { id: 'C-01', capacity: 20, occupiedByOthers: 18, startISO: '2026-03-02T13:00:00.000Z' },
          { id: 'C-02', capacity: 15, occupiedByOthers: 9, startISO: '2026-03-02T18:00:00.000Z' },
          { id: 'C-03', capacity: 15, occupiedByOthers: 5, startISO: '2026-03-02T20:00:00.000Z' },
        ],
        bookings: [
          {
            id: 'R-A',
            sessionId: 'C-01',
            sessionStartISO: '2026-03-02T13:00:00.000Z',
            status: 'active',
            createdAtISO: '2026-03-02T07:00:00.000-05:00',
          },
          {
            id: 'R-B',
            sessionId: 'C-02',
            sessionStartISO: '2026-03-02T18:00:00.000Z',
            status: 'active',
            createdAtISO: '2026-03-02T07:05:00.000-05:00',
          },
        ],
      }),
    );

    const useCase = new BookClass({ repository: repo, store, clock });
    const result = await useCase.execute({ sessionId: 'C-03' });

    expect(result.status).toBe('rejected');
    expect(result.message).toBe('Solo puedes reservar 2 clases por día.');
    expect(store.getSnapshot()?.bookings).toHaveLength(2);
  });

  it('serializes duplicate booking attempts and rejects the second', async () => {
    const repo = new InMemoryBookingRepository();
    const store = new InMemoryBookingStateAdapter();
    const clock = new FixedClock(CLOCK_NOW);
    store.replaceSnapshot(
      snapshot({
        sessions: [
          { id: 'C-01', capacity: 20, occupiedByOthers: 18, startISO: '2026-03-02T23:00:00.000Z' },
        ],
      }),
    );

    const useCase = new BookClass({ repository: repo, store, clock });
    const [first, second] = await Promise.all([
      useCase.execute({ sessionId: 'C-01' }),
      useCase.execute({ sessionId: 'C-01' }),
    ]);

    const outcomes = [first.status, second.status];
    expect(outcomes).toContain('success');
    expect(outcomes).toContain('rejected');
    expect(store.getSnapshot()?.bookings).toHaveLength(1);
  });

  it('persists the new snapshot on success', async () => {
    const repo = new InMemoryBookingRepository();
    const store = new InMemoryBookingStateAdapter();
    const clock = new FixedClock(CLOCK_NOW);
    store.replaceSnapshot(
      snapshot({
        sessions: [
          { id: 'C-01', capacity: 20, occupiedByOthers: 18, startISO: '2026-03-02T23:00:00.000Z' },
        ],
      }),
    );

    const useCase = new BookClass({ repository: repo, store, clock });
    await useCase.execute({ sessionId: 'C-01' });

    const persisted = await repo.load();
    expect(persisted?.bookings).toHaveLength(1);
  });
});
