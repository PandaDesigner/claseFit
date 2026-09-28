import { BookingError } from './BookingError';

export class DuplicateBookingError extends BookingError {
  readonly code = 'DUPLICATE_BOOKING';
  readonly userMessage = 'Ya reservaste esta clase.';
}
