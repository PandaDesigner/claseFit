import type { BookingRepository } from '@features/class-booking/application/ports/BookingRepository';
import type { BookingStateStore } from '@features/class-booking/application/ports/BookingStateStore';
import type { Clock } from '@features/class-booking/application/ports/Clock';
import {
  CURRENT_SCHEMA_VERSION,
  type SnapshotDTO,
} from '@features/class-booking/application/dto/SnapshotDTO';
import type { Fixture } from '@features/class-booking/infrastructure/fixtures/Fixture';

export interface InitializeBookingsDeps {
  readonly repository: BookingRepository;
  readonly store: BookingStateStore;
  readonly clock: Clock;
  readonly fixture: Fixture;
}

const BOGOTA_TIMEZONE = 'America/Bogota';
const SCHEMA_VERSION = CURRENT_SCHEMA_VERSION;
const DATASET_VERSION = 1;

function bogotaDateKey(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BOGOTA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const year = parts.find((part) => part.type === 'year')?.value ?? '0000';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';
  return `${year}-${month}-${day}`;
}

function bogotaOffsetMinutes(reference: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BOGOTA_TIMEZONE,
    timeZoneName: 'longOffset',
  }).formatToParts(reference);
  const offset = parts.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT-05';
  const match = offset.match(/GMT([+-]\d{2}):?(\d{2})?/);
  if (!match) {
    return -5 * 60;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? '0');
  return hours * 60 + Math.sign(hours) * minutes;
}

function resolveSessionStart(now: Date, diaOffset: number, hora: string): Date {
  const [hours, minutes] = hora.split(':').map((value) => Number(value));
  const baseParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BOGOTA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const year = Number(baseParts.find((part) => part.type === 'year')?.value ?? '1970');
  const month = Number(baseParts.find((part) => part.type === 'month')?.value ?? '01');
  const day = Number(baseParts.find((part) => part.type === 'day')?.value ?? '01');

  const utcMillis = Date.UTC(year, month - 1, day + diaOffset, hours, minutes, 0, 0);
  const offsetMinutes = bogotaOffsetMinutes(now);
  return new Date(utcMillis - offsetMinutes * 60 * 1000);
}

function buildSnapshot(now: Date, fixture: Fixture): SnapshotDTO {
  return {
    schemaVersion: SCHEMA_VERSION,
    datasetVersion: DATASET_VERSION,
    baseDateBogota: bogotaDateKey(now),
    resolvedSessions: fixture.clases.map((session) => ({
      id: session.id,
      name: session.nombre,
      instructor: session.instructor,
      startISO: resolveSessionStart(now, session.diaOffset, session.hora).toISOString(),
      durationMinutes: session.duracionMin,
      capacity: session.cupoTotal,
      occupiedByOthers: session.ocupados,
    })),
    bookings: [],
  };
}

export class InitializeBookings {
  constructor(private readonly deps: InitializeBookingsDeps) {}

  async execute(): Promise<SnapshotDTO> {
    const existing = await this.deps.repository.load();
    const snapshot = existing ?? buildSnapshot(this.deps.clock.now(), this.deps.fixture);
    this.deps.store.replaceSnapshot(snapshot);
    if (!existing) {
      await this.deps.repository.save(snapshot);
    }
    return snapshot;
  }
}
