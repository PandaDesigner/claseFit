import type { BookingRepository } from '@features/class-booking/application/ports/BookingRepository';
import type { BookingStateStore } from '@features/class-booking/application/ports/BookingStateStore';
import type { Clock } from '@features/class-booking/application/ports/Clock';
import type { SnapshotDTO, BookingDTO } from '@features/class-booking/application/dto/SnapshotDTO';
import { CommandQueue } from './BookClass';

const CANCELLATION_WINDOW_MINUTES = 120;

export type CancelBookingResult =
  | { readonly status: 'success'; readonly message: string }
  | { readonly status: 'rejected'; readonly message: string };

export interface CancelBookingDeps {
  readonly repository: BookingRepository;
  readonly store: BookingStateStore;
  readonly clock: Clock;
}

export interface CancelBookingCommand {
  readonly bookingId: string;
}

export class CancelBooking {
  private readonly queue = new CommandQueue();

  constructor(private readonly deps: CancelBookingDeps) {}

  async execute(command: CancelBookingCommand): Promise<CancelBookingResult> {
    return this.queue.run(`cancel:${command.bookingId}`, () => this.runOnce(command));
  }

  private async runOnce(command: CancelBookingCommand): Promise<CancelBookingResult> {
    const snapshot = this.deps.store.getSnapshot();
    if (!snapshot) {
      return { status: 'rejected', message: 'Aun no se inicializaron las reservas.' };
    }

    const target = snapshot.bookings.find((booking) => booking.id === command.bookingId);
    if (!target) {
      return { status: 'rejected', message: 'La reserva solicitada no existe.' };
    }
    if (target.status === 'cancelled') {
      return {
        status: 'rejected',
        message: 'La reserva ya estaba cancelada.',
      };
    }

    const now = this.deps.clock.now();
    const sessionStart = new Date(target.sessionStartISO);
    const minutesUntilStart = (sessionStart.getTime() - now.getTime()) / 60000;
    if (minutesUntilStart < CANCELLATION_WINDOW_MINUTES) {
      return {
        status: 'rejected',
        message: 'Ya no puedes cancelar: faltan menos de 2 horas.',
      };
    }

    const cancelledAt = now.toISOString();
    const updatedBooking: BookingDTO = {
      ...target,
      status: 'cancelled',
      cancelledAtISO: cancelledAt,
    };
    const updatedBookings = snapshot.bookings.map((booking) =>
      booking.id === target.id ? updatedBooking : booking,
    );
    const nextSnapshot: SnapshotDTO = {
      ...snapshot,
      bookings: updatedBookings,
    };
    this.deps.store.replaceSnapshot(nextSnapshot);
    await this.deps.repository.save(nextSnapshot);

    return { status: 'success', message: 'Reserva cancelada.' };
  }
}
