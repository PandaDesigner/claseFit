import { AsyncStorageBookingRepository } from '@features/class-booking/infrastructure/persistence/AsyncStorageBookingRepository';
import {
  CURRENT_SCHEMA_VERSION,
  type SnapshotDTO,
} from '@features/class-booking/application/dto/SnapshotDTO';

class FakeAsyncStorage {
  store = new Map<string, string>();
  failOn: 'get' | 'set' | null = null;

  async getItem(key: string): Promise<string | null> {
    if (this.failOn === 'get') {
      throw new Error('disk read failure');
    }
    return this.store.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    if (this.failOn === 'set') {
      throw new Error('disk write failure');
    }
    this.store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }
}

const sampleSnapshot: SnapshotDTO = {
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
  bookings: [
    {
      id: 'R-01',
      sessionId: 'C-01',
      sessionStartISO: '2026-03-02T18:00:00.000Z',
      status: 'active',
      createdAtISO: '2026-03-02T10:00:00.000Z',
    },
  ],
};

describe('AsyncStorageBookingRepository', () => {
  it('returns null when nothing has been persisted', async () => {
    const storage = new FakeAsyncStorage();
    const repo = new AsyncStorageBookingRepository({ storage });
    expect(await repo.load()).toBeNull();
  });

  it('persists and reloads a snapshot', async () => {
    const storage = new FakeAsyncStorage();
    const repo = new AsyncStorageBookingRepository({ storage });
    await repo.save(sampleSnapshot);
    const loaded = await repo.load();
    expect(loaded).toEqual(sampleSnapshot);
  });

  it('throws and exposes a recoverable error on read failure', async () => {
    const storage = new FakeAsyncStorage();
    storage.failOn = 'get';
    const repo = new AsyncStorageBookingRepository({ storage });
    await expect(repo.load()).rejects.toThrow(/read failure/);
  });

  it('throws on write failure', async () => {
    const storage = new FakeAsyncStorage();
    storage.failOn = 'set';
    const repo = new AsyncStorageBookingRepository({ storage });
    await expect(repo.save(sampleSnapshot)).rejects.toThrow(/write failure/);
  });

  it('throws when the persisted payload is not valid JSON', async () => {
    const storage = new FakeAsyncStorage();
    storage.store.set('@clasefit/booking/snapshot', '{not-json');
    const repo = new AsyncStorageBookingRepository({ storage });
    await expect(repo.load()).rejects.toThrow(/invalid/i);
  });

  it('throws when the schema version is unknown', async () => {
    const storage = new FakeAsyncStorage();
    storage.store.set(
      '@clasefit/booking/snapshot',
      JSON.stringify({ ...sampleSnapshot, schemaVersion: 999 }),
    );
    const repo = new AsyncStorageBookingRepository({ storage });
    await expect(repo.load()).rejects.toThrow(/schema/i);
  });
});
