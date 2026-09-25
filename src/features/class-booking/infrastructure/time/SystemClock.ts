import type { Clock } from '@features/class-booking/application/ports/Clock';

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
