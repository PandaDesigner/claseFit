import { BookingRule } from '@features/class-booking/domain/policies/BookingRule';
import { CapacityRule } from '@features/class-booking/domain/policies/CapacityRule';
import { DuplicateRule } from '@features/class-booking/domain/policies/DuplicateRule';
import { DailyLimitRule } from '@features/class-booking/domain/policies/DailyLimitRule';
import { NoCapacityError } from '@features/class-booking/domain/errors/NoCapacityError';
import { DuplicateBookingError } from '@features/class-booking/domain/errors/DuplicateBookingError';
import { DailyLimitError } from '@features/class-booking/domain/errors/DailyLimitError';
import { ClassSession } from '@features/class-booking/domain/entities/ClassSession';
import {
  ActiveReservation,
  CancellableReservation,
} from '@features/class-booking/domain/states/ActiveReservation';

const sessionStart = new Date('2026-03-04T18:00:00.000Z');

function fullSession(): ClassSession {
  return new ClassSession({
    id: 'C-08',
    name: 'Rumba',
    instructor: 'Julián Mejía',
    start: sessionStart,
    durationMinutes: 50,
    capacity: 30,
    occupiedByOthers: 30,
  });
}

function openSession(): ClassSession {
  return new ClassSession({
    id: 'C-01',
    name: 'Spinning',
    instructor: 'Andrés Restrepo',
    start: sessionStart,
    durationMinutes: 45,
    capacity: 20,
    occupiedByOthers: 18,
  });
}

function activeReservation(): ActiveReservation {
  return new ActiveReservation({
    id: 'R-01',
    sessionId: 'C-01',
    sessionStart,
    createdAt: new Date('2026-03-02T10:00:00.000Z'),
  });
}

function asList(...items: CancellableReservation[]): CancellableReservation[] {
  return items;
}

describe('BookingRule contract', () => {
  it('is implemented by the concrete rules', () => {
    const rules: BookingRule[] = [new CapacityRule(), new DuplicateRule(), new DailyLimitRule()];
    for (const rule of rules) {
      expect(typeof rule.evaluate).toBe('function');
    }
  });
});

describe('CapacityRule', () => {
  it('rejects when the session is already full', () => {
    expect(() =>
      new CapacityRule().evaluate({
        session: fullSession(),
        memberReservations: [],
      }),
    ).toThrow(NoCapacityError);
  });

  it('passes when the session has available seats', () => {
    expect(() =>
      new CapacityRule().evaluate({
        session: openSession(),
        memberReservations: [],
      }),
    ).not.toThrow();
  });

  it('subtracts existing active reservations of the member', () => {
    expect(() =>
      new CapacityRule().evaluate({
        session: openSession(),
        memberReservations: [activeReservation(), activeReservation()],
      }),
    ).toThrow(NoCapacityError);
  });
});

describe('DuplicateRule', () => {
  it('rejects when the member already has an active reservation for the same session', () => {
    expect(() =>
      new DuplicateRule().evaluate({
        session: openSession(),
        memberReservations: [activeReservation()],
      }),
    ).toThrow(DuplicateBookingError);
  });

  it('passes when the member has no active reservation for the session', () => {
    expect(() =>
      new DuplicateRule().evaluate({
        session: openSession(),
        memberReservations: [],
      }),
    ).not.toThrow();
  });

  it('ignores cancelled reservations of the member', () => {
    const cancelled = activeReservation().cancelAt(new Date('2026-03-02T11:00:00.000Z'));
    expect(() =>
      new DuplicateRule().evaluate({
        session: openSession(),
        memberReservations: asList(cancelled),
      }),
    ).not.toThrow();
  });
});

describe('DailyLimitRule', () => {
  const anotherSessionSameDay = new ClassSession({
    id: 'C-02',
    name: 'Funcional',
    instructor: 'Camila Ospina',
    start: new Date('2026-03-04T07:00:00.000Z'),
    durationMinutes: 60,
    capacity: 15,
    occupiedByOthers: 9,
  });

  function reservationFor(session: ClassSession, id: string): ActiveReservation {
    return new ActiveReservation({
      id,
      sessionId: session.id,
      sessionStart: session.start,
      createdAt: new Date('2026-03-02T10:00:00.000Z'),
    });
  }

  it('passes when the member has fewer than two active reservations on that calendar date', () => {
    expect(() =>
      new DailyLimitRule().evaluate({
        session: anotherSessionSameDay,
        memberReservations: [reservationFor(openSession(), 'R-A')],
      }),
    ).not.toThrow();
  });

  it('rejects when the member already holds two active reservations on the same calendar date', () => {
    expect(() =>
      new DailyLimitRule().evaluate({
        session: anotherSessionSameDay,
        memberReservations: [
          reservationFor(openSession(), 'R-A'),
          reservationFor(anotherSessionSameDay, 'R-B'),
        ],
      }),
    ).toThrow(DailyLimitError);
  });

  it('counts reservations on the target session itself toward the limit', () => {
    expect(() =>
      new DailyLimitRule().evaluate({
        session: openSession(),
        memberReservations: [
          reservationFor(openSession(), 'R-A'),
          reservationFor(anotherSessionSameDay, 'R-B'),
        ],
      }),
    ).toThrow(DailyLimitError);
  });

  it('does not count cancelled reservations toward the daily limit', () => {
    const cancelled = reservationFor(anotherSessionSameDay, 'R-B').cancelAt(
      new Date('2026-03-02T11:00:00.000Z'),
    );
    expect(() =>
      new DailyLimitRule().evaluate({
        session: anotherSessionSameDay,
        memberReservations: asList(reservationFor(openSession(), 'R-A'), cancelled),
      }),
    ).not.toThrow();
  });
});
