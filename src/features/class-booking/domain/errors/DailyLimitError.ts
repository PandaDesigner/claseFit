import { BookingError } from './BookingError';

export class DailyLimitError extends BookingError {
  readonly code = 'DAILY_LIMIT';
  readonly userMessage = 'Solo puedes reservar 2 clases por día.';
}
