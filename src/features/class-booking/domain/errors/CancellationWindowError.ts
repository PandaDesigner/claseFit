import { BookingError } from './BookingError';

export class CancellationWindowError extends BookingError {
  readonly code = 'CANCELLATION_WINDOW';
  readonly userMessage = 'Ya no puedes cancelar: faltan menos de 2 horas.';
}
