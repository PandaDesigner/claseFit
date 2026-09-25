import { ActiveReservation } from '@features/class-booking/domain/states/ActiveReservation';
import { CancelledReservation } from '@features/class-booking/domain/states/CancelledReservation';

const sessionStart = new Date('2026-03-04T18:00:00.000Z');

describe('Reservation states', () => {
  it('creates an active reservation with id, session reference, and timestamps', () => {
    const createdAt = new Date('2026-03-02T10:00:00.000Z');
    const reservation = new ActiveReservation({
      id: 'R-01',
      sessionId: 'C-09',
      sessionStart,
      createdAt,
    });

    expect(reservation.id).toBe('R-01');
    expect(reservation.sessionId).toBe('C-09');
    expect(reservation.sessionStart.getTime()).toBe(sessionStart.getTime());
    expect(reservation.createdAt.getTime()).toBe(createdAt.getTime());
    expect(reservation.status).toBe('active');
  });

  it('transitions an active reservation to a cancelled state with cancellation timestamp', () => {
    const createdAt = new Date('2026-03-02T10:00:00.000Z');
    const cancelledAt = new Date('2026-03-02T11:00:00.000Z');
    const reservation = new ActiveReservation({
      id: 'R-01',
      sessionId: 'C-09',
      sessionStart,
      createdAt,
    });

    const cancelled = reservation.cancelAt(cancelledAt);

    expect(cancelled).toBeInstanceOf(CancelledReservation);
    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.cancelledAt?.getTime()).toBe(cancelledAt.getTime());
    expect(cancelled.id).toBe('R-01');
    expect(cancelled.sessionId).toBe('C-09');
  });

  it('rejects cancellation when invoked on an already-cancelled reservation', () => {
    const createdAt = new Date('2026-03-02T10:00:00.000Z');
    const cancelledAt = new Date('2026-03-02T11:00:00.000Z');
    const first = new ActiveReservation({
      id: 'R-01',
      sessionId: 'C-09',
      sessionStart,
      createdAt,
    }).cancelAt(cancelledAt);

    expect(() => first.cancelAt(new Date('2026-03-02T12:00:00.000Z'))).toThrow(
      /already cancelled/i,
    );
  });

  it('treats active reservations as cancellable and cancelled ones as terminal', () => {
    const createdAt = new Date('2026-03-02T10:00:00.000Z');
    const cancelledAt = new Date('2026-03-02T11:00:00.000Z');
    const active = new ActiveReservation({
      id: 'R-01',
      sessionId: 'C-09',
      sessionStart,
      createdAt,
    });
    const cancelled = active.cancelAt(cancelledAt);

    expect(active.isCancellable()).toBe(true);
    expect(cancelled.isCancellable()).toBe(false);
  });
});
