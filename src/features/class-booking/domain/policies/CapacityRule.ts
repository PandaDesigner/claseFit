import { BookingRule } from './BookingRule';
import { NoCapacityError } from '../errors/NoCapacityError';

export class CapacityRule implements BookingRule {
  evaluate(context: Parameters<BookingRule['evaluate']>[0]): void {
    const active = context.memberReservations.filter(
      (reservation) => reservation.status === 'active',
    );
    if (context.session.isFull(active.length)) {
      throw new NoCapacityError();
    }
  }
}
