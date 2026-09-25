import { InitializeBookings } from '@features/class-booking/application/use-cases/InitializeBookings';
import { InMemoryBookingRepository } from '@features/class-booking/infrastructure/persistence/InMemoryBookingRepository';
import { InMemoryBookingStateAdapter } from '@features/class-booking/infrastructure/state/InMemoryBookingStateAdapter';
import { FixedClock } from '@features/class-booking/infrastructure/time/FixedClock';
import { CURRENT_SCHEMA_VERSION } from '@features/class-booking/application/dto/SnapshotDTO';
import { loadFixture, type Fixture } from '@features/class-booking/infrastructure/fixtures/Fixture';
import type { SnapshotDTO } from '@features/class-booking/application/dto/SnapshotDTO';

const CLOCK_NOW = new Date('2026-03-02T08:00:00.000-05:00');

function makeFixture(): Fixture {
  return loadFixture();
}

describe('InitializeBookings', () => {
  it('creates a fresh snapshot from the fixture when nothing is persisted', async () => {
    const repo = new InMemoryBookingRepository();
    const store = new InMemoryBookingStateAdapter();
    const clock = new FixedClock(CLOCK_NOW);
    const fixture = makeFixture();

    const useCase = new InitializeBookings({ repository: repo, store, clock, fixture });
    await useCase.execute();

    const snapshot = store.getSnapshot();
    expect(snapshot).not.toBeNull();
    expect(snapshot?.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(snapshot?.bookings).toEqual([]);
    expect(snapshot?.resolvedSessions.length).toBe(fixture.clases.length);
    const persisted = await repo.load();
    expect(persisted).toEqual(snapshot);
  });

  it('rehydrates a valid persisted snapshot without overwriting it', async () => {
    const repo = new InMemoryBookingRepository();
    const store = new InMemoryBookingStateAdapter();
    const clock = new FixedClock(CLOCK_NOW);
    const fixture = makeFixture();

    const existing: SnapshotDTO = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      datasetVersion: 1,
      baseDateBogota: '2026-03-02',
      resolvedSessions: [
        {
          id: 'C-01',
          name: 'Spinning',
          instructor: 'Andrés Restrepo',
          startISO: '2026-03-02T11:00:00.000-05:00',
          durationMinutes: 45,
          capacity: 20,
          occupiedByOthers: 18,
        },
      ],
      bookings: [
        {
          id: 'R-01',
          sessionId: 'C-01',
          sessionStartISO: '2026-03-02T11:00:00.000-05:00',
          status: 'active',
          createdAtISO: '2026-03-01T10:00:00.000-05:00',
        },
      ],
    };
    await repo.save(existing);

    const useCase = new InitializeBookings({ repository: repo, store, clock, fixture });
    await useCase.execute();

    expect(store.getSnapshot()).toEqual(existing);
  });

  it('keeps the previous snapshot intact when parsing fails', async () => {
    const repo = new InMemoryBookingRepository();
    const store = new InMemoryBookingStateAdapter();
    const clock = new FixedClock(CLOCK_NOW);
    const fixture = makeFixture();

    const previous: SnapshotDTO = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      datasetVersion: 1,
      baseDateBogota: '2026-03-02',
      resolvedSessions: [],
      bookings: [],
    };
    await repo.save(previous);
    repo.setLoadError(new Error('disk corruption'));

    const useCase = new InitializeBookings({ repository: repo, store, clock, fixture });
    await expect(useCase.execute()).rejects.toThrow(/disk corruption/);

    expect(store.getSnapshot()).toBeNull();
  });
});
