import type { BookingRepository } from '@features/class-booking/application/ports/BookingRepository';
import type { BookingStateStore } from '@features/class-booking/application/ports/BookingStateStore';
import type { Clock } from '@features/class-booking/application/ports/Clock';
import type { SnapshotDTO, BookingDTO } from '@features/class-booking/application/dto/SnapshotDTO';
import { ClassSession } from '@features/class-booking/domain/entities/ClassSession';
import {
  ActiveReservation,
  CancellableReservation,
} from '@features/class-booking/domain/states/ActiveReservation';
import { CancelledReservation } from '@features/class-booking/domain/states/CancelledReservation';
import { CapacityRule } from '@features/class-booking/domain/policies/CapacityRule';
import { DuplicateRule } from '@features/class-booking/domain/policies/DuplicateRule';
import { DailyLimitRule } from '@features/class-booking/domain/policies/DailyLimitRule';
import { NoCapacityError } from '@features/class-booking/domain/errors/NoCapacityError';
import { DuplicateBookingError } from '@features/class-booking/domain/errors/DuplicateBookingError';
import { DailyLimitError } from '@features/class-booking/domain/errors/DailyLimitError';
import { BookingError } from '@features/class-booking/domain/errors/BookingError';

export type BookClassResult =
  | { readonly status: 'success'; readonly message: string; readonly bookingId: string }
  | { readonly status: 'rejected'; readonly message: string };

export interface BookClassDeps {
  readonly repository: BookingRepository;
  readonly store: BookingStateStore;
  readonly clock: Clock;
}

export interface BookClassCommand {
  readonly sessionId: string;
}

export class CommandQueue {
  private inflight = 0;
  private pending = new Map<string, Promise<unknown>>();

  async run<T>(key: string, task: () => Promise<T>): Promise<T> {
    const previous = this.pending.get(key) ?? Promise.resolve();
    const next = previous
      .catch(() => undefined)
      .then(() => {
        this.inflight += 1;
        return task().finally(() => {
          this.inflight -= 1;
          if (this.pending.get(key) === next) {
            this.pending.delete(key);
          }
        });
      });
    this.pending.set(key, next);
    return next;
  }

  isBusy(): boolean {
    return this.inflight > 0;
  }
}

function toReservation(dto: BookingDTO): CancellableReservation {
  if (dto.status === 'cancelled') {
    return new CancelledReservation({
      id: dto.id,
      sessionId: dto.sessionId,
      sessionStart: new Date(dto.sessionStartISO),
      createdAt: new Date(dto.createdAtISO),
      cancelledAt: new Date(dto.cancelledAtISO ?? dto.createdAtISO),
    });
  }
  return new ActiveReservation({
    id: dto.id,
    sessionId: dto.sessionId,
    sessionStart: new Date(dto.sessionStartISO),
    createdAt: new Date(dto.createdAtISO),
  });
}

function toSession(dto: SnapshotDTO['resolvedSessions'][number]): ClassSession {
  return new ClassSession({
    id: dto.id,
    name: dto.name,
    instructor: dto.instructor,
    start: new Date(dto.startISO),
    durationMinutes: dto.durationMinutes,
    capacity: dto.capacity,
    occupiedByOthers: dto.occupiedByOthers,
  });
}

function generateBookingId(now: Date): string {
  return `R-${now.getTime().toString(36)}`;
}

export class BookClass {
  private readonly queue = new CommandQueue();

  constructor(private readonly deps: BookClassDeps) {}

  async execute(command: BookClassCommand): Promise<BookClassResult> {
    return this.queue.run(`book:${command.sessionId}`, () => this.runOnce(command));
  }

  private async runOnce(command: BookClassCommand): Promise<BookClassResult> {
    const snapshot = this.deps.store.getSnapshot();
    if (!snapshot) {
      return { status: 'rejected', message: 'Aun no se inicializaron las reservas.' };
    }
    const sessionDto = snapshot.resolvedSessions.find(
      (session) => session.id === command.sessionId,
    );
    if (!sessionDto) {
      return { status: 'rejected', message: 'La clase solicitada no existe.' };
    }

    const session = toSession(sessionDto);
    const memberReservations = snapshot.bookings.map(toReservation);
    const rules = [new CapacityRule(), new DuplicateRule(), new DailyLimitRule()];
    try {
      for (const rule of rules) {
        rule.evaluate({ session, memberReservations });
      }
    } catch (error) {
      if (error instanceof BookingError) {
        return { status: 'rejected', message: error.userMessage };
      }
      throw error;
    }

    const now = this.deps.clock.now();
    const newBooking: BookingDTO = {
      id: generateBookingId(now),
      sessionId: command.sessionId,
      sessionStartISO: sessionDto.startISO,
      status: 'active',
      createdAtISO: now.toISOString(),
    };

    const nextSnapshot: SnapshotDTO = {
      ...snapshot,
      bookings: [...snapshot.bookings, newBooking],
    };
    this.deps.store.replaceSnapshot(nextSnapshot);
    await this.deps.repository.save(nextSnapshot);

    return {
      status: 'success',
      message: '¡Listo! Tu cupo está reservado',
      bookingId: newBooking.id,
    };
  }

  hasInflight(): boolean {
    return this.queue.isBusy();
  }
}

// Suppress unused-error import warning while preserving intentional single-import surface.
void NoCapacityError;
void DuplicateBookingError;
void DailyLimitError;
