import { ClassSession } from '../entities/ClassSession';
import { CancellableReservation } from '../states/ActiveReservation';

export interface BookingRuleContext {
  readonly session: ClassSession;
  readonly memberReservations: readonly CancellableReservation[];
}

export interface BookingRule {
  evaluate(context: BookingRuleContext): void;
}
