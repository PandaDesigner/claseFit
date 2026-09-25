export interface ResolvedSessionDTO {
  readonly id: string;
  readonly name: string;
  readonly instructor: string;
  readonly startISO: string;
  readonly durationMinutes: number;
  readonly capacity: number;
  readonly occupiedByOthers: number;
}

export type BookingStatusDTO = 'active' | 'cancelled';

export interface BookingDTO {
  readonly id: string;
  readonly sessionId: string;
  readonly sessionStartISO: string;
  readonly status: BookingStatusDTO;
  readonly createdAtISO: string;
  readonly cancelledAtISO?: string;
}

export interface SnapshotDTO {
  readonly schemaVersion: number;
  readonly datasetVersion: number;
  readonly baseDateBogota: string;
  readonly resolvedSessions: readonly ResolvedSessionDTO[];
  readonly bookings: readonly BookingDTO[];
}

export const CURRENT_SCHEMA_VERSION = 1;
