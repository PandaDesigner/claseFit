import { ZustandBookingStateAdapter } from '@features/class-booking/infrastructure/state/ZustandBookingStateAdapter';
import {
  CURRENT_SCHEMA_VERSION,
  type SnapshotDTO,
} from '@features/class-booking/application/dto/SnapshotDTO';

const snapshot: SnapshotDTO = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  datasetVersion: 1,
  baseDateBogota: '2026-03-02',
  resolvedSessions: [
    {
      id: 'C-01',
      name: 'Spinning',
      instructor: 'Andrés Restrepo',
      startISO: '2026-03-02T18:00:00.000Z',
      durationMinutes: 45,
      capacity: 20,
      occupiedByOthers: 18,
    },
  ],
  bookings: [],
};

describe('ZustandBookingStateAdapter', () => {
  it('exposes a synchronous snapshot accessor', () => {
    const adapter = new ZustandBookingStateAdapter();
    expect(adapter.getSnapshot()).toBeNull();
    adapter.replaceSnapshot(snapshot);
    expect(adapter.getSnapshot()).toEqual(snapshot);
  });

  it('notifies subscribers when the snapshot changes', () => {
    const adapter = new ZustandBookingStateAdapter();
    const listener = jest.fn();
    adapter.subscribe(listener);

    adapter.replaceSnapshot(snapshot);
    expect(listener).toHaveBeenCalledWith(snapshot);
  });

  it('stops notifying after unsubscribe', () => {
    const adapter = new ZustandBookingStateAdapter();
    const listener = jest.fn();
    const unsubscribe = adapter.subscribe(listener);

    adapter.replaceSnapshot(snapshot);
    listener.mockClear();
    unsubscribe();
    adapter.replaceSnapshot({ ...snapshot, datasetVersion: 2 });
    expect(listener).not.toHaveBeenCalled();
  });

  it('publishes frozen snapshots so listeners cannot mutate the source of truth', () => {
    const adapter = new ZustandBookingStateAdapter();
    let received: SnapshotDTO | null = null;
    adapter.subscribe((snapshot) => {
      received = snapshot;
    });

    adapter.replaceSnapshot(snapshot);
    expect(received).not.toBeNull();
    expect(() => {
      (received as unknown as { bookings: unknown[] }).bookings.push({ id: 'INJECTED' });
    }).toThrow();
  });
});
