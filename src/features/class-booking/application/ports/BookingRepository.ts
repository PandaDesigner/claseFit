import type { SnapshotDTO } from '../dto/SnapshotDTO';

export interface BookingRepository {
  load(): Promise<SnapshotDTO | null>;
  save(snapshot: SnapshotDTO): Promise<void>;
}
