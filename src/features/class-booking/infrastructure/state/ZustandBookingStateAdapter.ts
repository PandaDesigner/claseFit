import { createStore, type StoreApi } from 'zustand/vanilla';
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

interface ZustandState {
  readonly snapshot: SnapshotDTO | null;
}

export class ZustandBookingStateAdapter implements BookingStateStore {
  private readonly store: StoreApi<ZustandState>;

  constructor() {
    this.store = createStore<ZustandState>(() => ({ snapshot: null }));
  }

  getSnapshot(): SnapshotDTO | null {
    return this.store.getState().snapshot;
  }

  replaceSnapshot(snapshot: SnapshotDTO): void {
    const frozen = deepFreeze(snapshot);
    this.store.setState({ snapshot: frozen });
  }

  subscribe(listener: (snapshot: SnapshotDTO) => void): Unsubscribe {
    return this.store.subscribe((state) => {
      if (state.snapshot) {
        listener(state.snapshot);
      }
    });
  }
}
