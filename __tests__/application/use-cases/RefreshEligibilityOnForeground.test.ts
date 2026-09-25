import { RefreshEligibilityOnForeground } from '@features/class-booking/application/use-cases/RefreshEligibilityOnForeground';
import { InMemoryBookingRepository } from '@features/class-booking/infrastructure/persistence/InMemoryBookingRepository';
import { InMemoryBookingStateAdapter } from '@features/class-booking/infrastructure/state/InMemoryBookingStateAdapter';
import { FixedClock } from '@features/class-booking/infrastructure/time/FixedClock';
import type { SnapshotDTO } from '@features/class-booking/application/dto/SnapshotDTO';
import { CURRENT_SCHEMA_VERSION } from '@features/class-booking/application/dto/SnapshotDTO';

function snapshot(opts: {
  readonly sessionStartISO: string;
  readonly bookingId: string;
  readonly bookingStatus?: 'active' | 'cancelled';
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
        capacity: 20,
        occupiedByOthers: 13,
      },
    ],
    bookings: [
      {
        id: opts.bookingId,
        sessionId: 'C-09',
        sessionStartISO: opts.sessionStartISO,
        status: opts.bookingStatus ?? 'active',
        createdAtISO: '2026-03-01T10:00:00.000-05:00',
      },
    ],
  };
}

describe('RefreshEligibilityOnForeground', () => {
  it('marks cancellation as ineligible when the session started during background', async () => {
    const sessionStart = new Date('2026-03-02T15:00:00.000-05:00');
    const now = new Date('2026-03-02T15:30:00.000-05:00');
    const repo = new InMemoryBookingRepository();
    const store = new InMemoryBookingStateAdapter();
    const clock = new FixedClock(now);
    store.replaceSnapshot(
      snapshot({ sessionStartISO: sessionStart.toISOString(), bookingId: 'R-01' }),
    );

    const useCase = new RefreshEligibilityOnForeground({ repository: repo, store, clock });
    const result = await useCase.execute();

    expect(result.cancellableBookingIds).toEqual([]);
    const after = store.getSnapshot();
    expect(after?.bookings[0]?.status).toBe('active');
  });

  it('keeps the booking eligible for cancellation when the session is still more than two hours away', async () => {
    const sessionStart = new Date('2026-03-04T18:00:00.000-05:00');
    const now = new Date('2026-03-02T13:00:00.000-05:00');
    const repo = new InMemoryBookingRepository();
    const store = new InMemoryBookingStateAdapter();
    const clock = new FixedClock(now);
    store.replaceSnapshot(
      snapshot({ sessionStartISO: sessionStart.toISOString(), bookingId: 'R-02' }),
    );

    const useCase = new RefreshEligibilityOnForeground({ repository: repo, store, clock });
    const result = await useCase.execute();

    expect(result.cancellableBookingIds).toEqual(['R-02']);
  });
});
