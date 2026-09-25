import { BookingError } from './BookingError';

export class NoCapacityError extends BookingError {
  readonly code = 'NO_CAPACITY';
  readonly userMessage = 'Esta clase ya no tiene cupos.';
}
