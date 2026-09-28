import type { Clock } from '@features/class-booking/application/ports/Clock';

export class FixedClock implements Clock {
  constructor(private readonly instant: Date) {}

  now(): Date {
    return new Date(this.instant.getTime());
  }
}
