import type { SnapshotDTO } from '../dto/SnapshotDTO';

export type Unsubscribe = () => void;

export interface BookingStateStore {
  getSnapshot(): SnapshotDTO | null;
  replaceSnapshot(snapshot: SnapshotDTO): void;
  subscribe(listener: (snapshot: SnapshotDTO) => void): Unsubscribe;
}
