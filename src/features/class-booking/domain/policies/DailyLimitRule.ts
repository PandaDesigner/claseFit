import { BookingRule } from './BookingRule';
import { DailyLimitError } from '../errors/DailyLimitError';

const DAILY_LIMIT = 2;
const BOGOTA_TIME_ZONE = 'America/Bogota';

function toBogotaDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BOGOTA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? '0000';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';
  return `${year}-${month}-${day}`;
}

export class DailyLimitRule implements BookingRule {
  evaluate(context: Parameters<BookingRule['evaluate']>[0]): void {
    const targetDateKey = toBogotaDateKey(context.session.start);
    const sameDay = context.memberReservations.filter(
      (reservation) =>
        reservation.status === 'active' &&
        toBogotaDateKey(reservation.sessionStart) === targetDateKey,
    );
    if (sameDay.length >= DAILY_LIMIT) {
      throw new DailyLimitError();
    }
  }
}
