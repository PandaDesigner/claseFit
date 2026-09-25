import type {
  BookingStateStore,
  Unsubscribe,
} from '@features/class-booking/application/ports/BookingStateStore';
import type { SnapshotDTO } from '@features/class-booking/application/dto/SnapshotDTO';

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  Object.freeze(value);
  for (const key of Object.keys(value as object)) {
    const nested = (value as Record<string, unknown>)[key];
    if (nested && typeof nested === 'object' && !Object.isFrozen(nested)) {
      deepFreeze(nested);
    }
  }
  return value;
}

export class InMemoryBookingStateAdapter implements BookingStateStore {
  private snapshot: SnapshotDTO | null = null;
  private listeners = new Set<(snapshot: SnapshotDTO) => void>();

  getSnapshot(): SnapshotDTO | null {
    return this.snapshot;
  }

  replaceSnapshot(snapshot: SnapshotDTO): void {
    const frozen = deepFreeze(snapshot);
    this.snapshot = frozen;
    for (const listener of this.listeners) {
      listener(frozen);
    }
  }

  subscribe(listener: (snapshot: SnapshotDTO) => void): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
