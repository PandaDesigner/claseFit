import { CancelBooking } from '@features/class-booking/application/use-cases/CancelBooking';
import { InMemoryBookingRepository } from '@features/class-booking/infrastructure/persistence/InMemoryBookingRepository';
import { InMemoryBookingStateAdapter } from '@features/class-booking/infrastructure/state/InMemoryBookingStateAdapter';
import { FixedClock } from '@features/class-booking/infrastructure/time/FixedClock';
import type { SnapshotDTO } from '@features/class-booking/application/dto/SnapshotDTO';
import { CURRENT_SCHEMA_VERSION } from '@features/class-booking/application/dto/SnapshotDTO';

function snapshotWithActiveBooking(opts: {
  readonly bookingId: string;
  readonly sessionStartISO: string;
  readonly sessionCapacity?: number;
  readonly sessionOccupied?: number;
}): SnapshotDTO {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    datasetVersion: 1,
    baseDateBogota: '2026-03-02',
    resolvedSessions: [
      {
        id: 'C-09',
        name: 'Spinning',
        instructor: 'Andrés Restrepo',
        startISO: opts.sessionStartISO,
        durationMinutes: 45,
        capacity: opts.sessionCapacity ?? 20,
        occupiedByOthers: opts.sessionOccupied ?? 13,
      },
    ],
    bookings: [
      {
        id: opts.bookingId,
        sessionId: 'C-09',
        sessionStartISO: opts.sessionStartISO,
        status: 'active',
        createdAtISO: '2026-03-01T10:00:00.000-05:00',
      },
    ],
  };
}

describe('CancelBooking', () => {
  it('cancels an active booking when cancel instant is exactly two hours before start', async () => {
    const sessionStart = new Date('2026-03-02T15:00:00.000-05:00');
    const now = new Date('2026-03-02T13:00:00.000-05:00');
    const repo = new InMemoryBookingRepository();
    const store = new InMemoryBookingStateAdapter();
    const clock = new FixedClock(now);
    store.replaceSnapshot(
      snapshotWithActiveBooking({
        bookingId: 'R-01',
        sessionStartISO: sessionStart.toISOString(),
      }),
    );

    const useCase = new CancelBooking({ repository: repo, store, clock });
    const result = await useCase.execute({ bookingId: 'R-01' });

    expect(result.status).toBe('success');
    const after = store.getSnapshot();
    expect(after?.bookings[0]?.status).toBe('cancelled');
    expect(after?.bookings[0]?.cancelledAtISO).toBe(now.toISOString());
  });

  it('cancels when cancel instant is strictly more than two hours before start', async () => {
    const sessionStart = new Date('2026-03-02T15:00:00.000-05:00');
    const now = new Date('2026-03-02T12:59:00.000-05:00');
    const repo = new InMemoryBookingRepository();
    const store = new InMemoryBookingStateAdapter();
    const clock = new FixedClock(now);
    store.replaceSnapshot(
      snapshotWithActiveBooking({
        bookingId: 'R-02',
        sessionStartISO: sessionStart.toISOString(),
      }),
    );

    const useCase = new CancelBooking({ repository: repo, store, clock });
    const result = await useCase.execute({ bookingId: 'R-02' });

    expect(result.status).toBe('success');
  });

  it('rejects with RN-04 when less than two hours remain', async () => {
    const sessionStart = new Date('2026-03-02T15:00:00.000-05:00');
    const now = new Date('2026-03-02T13:00:01.000-05:00');
    const repo = new InMemoryBookingRepository();
    const store = new InMemoryBookingStateAdapter();
    const clock = new FixedClock(now);
    store.replaceSnapshot(
      snapshotWithActiveBooking({
        bookingId: 'R-03',
        sessionStartISO: sessionStart.toISOString(),
      }),
    );

    const useCase = new CancelBooking({ repository: repo, store, clock });
    const result = await useCase.execute({ bookingId: 'R-03' });

    expect(result.status).toBe('rejected');
    expect(result.message).toBe('Ya no puedes cancelar: faltan menos de 2 horas.');
    expect(store.getSnapshot()?.bookings[0]?.status).toBe('active');
  });

  it('rejects when the session already started', async () => {
    const sessionStart = new Date('2026-03-02T15:00:00.000-05:00');
    const now = new Date('2026-03-02T15:00:00.000-05:00');
    const repo = new InMemoryBookingRepository();
    const store = new InMemoryBookingStateAdapter();
    const clock = new FixedClock(now);
    store.replaceSnapshot(
      snapshotWithActiveBooking({
        bookingId: 'R-04',
        sessionStartISO: sessionStart.toISOString(),
      }),
    );

    const useCase = new CancelBooking({ repository: repo, store, clock });
    const result = await useCase.execute({ bookingId: 'R-04' });

    expect(result.status).toBe('rejected');
    expect(result.message).toBe('Ya no puedes cancelar: faltan menos de 2 horas.');
  });

  it('rejects repeated cancellation of the same booking', async () => {
    const sessionStart = new Date('2026-03-02T15:00:00.000-05:00');
    const now = new Date('2026-03-02T13:00:00.000-05:00');
    const repo = new InMemoryBookingRepository();
    const store = new InMemoryBookingStateAdapter();
    const clock = new FixedClock(now);
    store.replaceSnapshot(
      snapshotWithActiveBooking({
        bookingId: 'R-05',
        sessionStartISO: sessionStart.toISOString(),
      }),
    );

    const useCase = new CancelBooking({ repository: repo, store, clock });
    await useCase.execute({ bookingId: 'R-05' });
    const second = await useCase.execute({ bookingId: 'R-05' });

    expect(second.status).toBe('rejected');
    const persisted = await repo.load();
    const target = persisted?.bookings.find((b) => b.id === 'R-05');
    expect(target?.status).toBe('cancelled');
  });
});
