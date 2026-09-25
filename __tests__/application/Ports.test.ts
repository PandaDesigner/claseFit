import { InMemoryBookingRepository } from '@features/class-booking/infrastructure/persistence/InMemoryBookingRepository';
import { InMemoryBookingStateAdapter } from '@features/class-booking/infrastructure/state/InMemoryBookingStateAdapter';
import { FixedClock } from '@features/class-booking/infrastructure/time/FixedClock';
import type { BookingStateStore } from '@features/class-booking/application/ports/BookingStateStore';
import type { SnapshotDTO } from '@features/class-booking/application/dto/SnapshotDTO';

describe('BookingRepository + BookingStateStore + Clock ports', () => {
  const snapshot: SnapshotDTO = {
    schemaVersion: 1,
    datasetVersion: 1,
    baseDateBogota: '2026-03-02',
    resolvedSessions: [
      {
        id: 'C-01',
        name: 'Spinning',
        instructor: 'Andrés Restrepo',
        startISO: '2026-03-02T11:00:00.000Z',
        durationMinutes: 45,
        capacity: 20,
        occupiedByOthers: 18,
      },
    ],
    bookings: [],
  };

  it('persists and reloads the same snapshot via the repository', async () => {
    const repo = new InMemoryBookingRepository();

    await repo.save(snapshot);
    const loaded = await repo.load();

    expect(loaded).toEqual(snapshot);
  });

  it('returns null when no snapshot has been saved', async () => {
    const repo = new InMemoryBookingRepository();
    expect(await repo.load()).toBeNull();
  });

  it('exposes a synchronous snapshot accessor on the state store', () => {
    const store: BookingStateStore = new InMemoryBookingStateAdapter();
    expect(store.getSnapshot()).toBeNull();

    store.replaceSnapshot(snapshot);
    expect(store.getSnapshot()).toEqual(snapshot);
  });

  it('notifies subscribers when the snapshot changes', () => {
    const store = new InMemoryBookingStateAdapter();
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);

    store.replaceSnapshot(snapshot);
    expect(listener).toHaveBeenCalledWith(snapshot);

    listener.mockClear();
    unsubscribe();
    store.replaceSnapshot({ ...snapshot, datasetVersion: 2 });
    expect(listener).not.toHaveBeenCalled();
  });

  it('returns the same instant from the clock when frozen', () => {
    const clock = new FixedClock(new Date('2026-03-02T08:00:00.000Z'));
    expect(clock.now().toISOString()).toBe('2026-03-02T08:00:00.000Z');
    expect(clock.now().toISOString()).toBe('2026-03-02T08:00:00.000Z');
  });
});
