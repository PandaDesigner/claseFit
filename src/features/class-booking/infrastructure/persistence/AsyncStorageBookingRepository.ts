import type { BookingRepository } from '@features/class-booking/application/ports/BookingRepository';
import {
  CURRENT_SCHEMA_VERSION,
  type SnapshotDTO,
} from '@features/class-booking/application/dto/SnapshotDTO';

export interface AsyncStorageLike {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export class AsyncStorageBookingRepository implements BookingRepository {
  private readonly storage: AsyncStorageLike;
  private readonly storageKey: string;

  constructor(deps: { storage: AsyncStorageLike; storageKey?: string }) {
    this.storage = deps.storage;
    this.storageKey = deps.storageKey ?? '@clasefit/booking/snapshot';
  }

  async load(): Promise<SnapshotDTO | null> {
    let raw: string | null;
    try {
      raw = await this.storage.getItem(this.storageKey);
    } catch (cause) {
      throw new RepositoryError('read failure', cause);
    }
    if (raw === null) {
      return null;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (cause) {
      throw new RepositoryError('invalid JSON in persisted snapshot', cause);
    }
    if (!isSnapshot(parsed)) {
      throw new RepositoryError('persisted snapshot is not a valid SnapshotDTO');
    }
    if (parsed.schemaVersion !== CURRENT_SCHEMA_VERSION) {
      throw new RepositoryError(
        `unknown schema version ${parsed.schemaVersion}; migration required`,
      );
    }
    return parsed;
  }

  async save(snapshot: SnapshotDTO): Promise<void> {
    try {
      await this.storage.setItem(this.storageKey, JSON.stringify(snapshot));
    } catch (cause) {
      throw new RepositoryError('write failure', cause);
    }
  }
}

export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

function isSnapshot(value: unknown): value is SnapshotDTO {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.schemaVersion === 'number' &&
    typeof candidate.datasetVersion === 'number' &&
    typeof candidate.baseDateBogota === 'string' &&
    Array.isArray(candidate.resolvedSessions) &&
    Array.isArray(candidate.bookings)
  );
}
