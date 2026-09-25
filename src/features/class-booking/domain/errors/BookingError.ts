export abstract class BookingError extends Error {
  abstract readonly code: string;
  abstract readonly userMessage: string;
}
