import type { BookingRepository } from '@features/class-booking/application/ports/BookingRepository';
import type { SnapshotDTO } from '@features/class-booking/application/dto/SnapshotDTO';

export class InMemoryBookingRepository implements BookingRepository {
  private snapshot: SnapshotDTO | null = null;
  private loadError: Error | null = null;

  async load(): Promise<SnapshotDTO | null> {
    if (this.loadError) {
      throw this.loadError;
    }
    return this.snapshot;
  }

  async save(snapshot: SnapshotDTO): Promise<void> {
    this.snapshot = snapshot;
  }

  setLoadError(error: Error | null): void {
    this.loadError = error;
  }
}
