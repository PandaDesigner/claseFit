import { BookingRule } from './BookingRule';
import { DuplicateBookingError } from '../errors/DuplicateBookingError';

export class DuplicateRule implements BookingRule {
  evaluate(context: Parameters<BookingRule['evaluate']>[0]): void {
    const duplicate = context.memberReservations.some(
      (reservation) =>
        reservation.status === 'active' && reservation.sessionId === context.session.id,
    );
    if (duplicate) {
      throw new DuplicateBookingError();
    }
  }
}
