import { ClassSession } from '../../src/features/class-booking/domain/entities/ClassSession';

describe('ClassSession', () => {
  const future = new Date('2026-03-04T18:00:00.000Z');
  const now = new Date('2026-03-02T13:00:00.000Z');

  it('reports zero available seats when other occupancy already fills the session', () => {
    const session = new ClassSession({
      id: 'C-08',
      name: 'Rumba',
      instructor: 'Julián Mejía',
      start: future,
      durationMinutes: 50,
      capacity: 30,
      occupiedByOthers: 30,
    });

    expect(session.available(0)).toBe(0);
    expect(session.isFull(0)).toBe(true);
  });

  it('subtracts member active reservations from the available count', () => {
    const session = new ClassSession({
      id: 'C-01',
      name: 'Spinning',
      instructor: 'Andrés Restrepo',
      start: future,
      durationMinutes: 45,
      capacity: 20,
      occupiedByOthers: 18,
    });

    expect(session.available(0)).toBe(2);
    expect(session.available(1)).toBe(1);
    expect(session.isFull(2)).toBe(true);
  });

  it('is hidden when its start is in the past compared to now', () => {
    const past = new Date('2026-03-02T12:00:00.000Z');
    const session = new ClassSession({
      id: 'C-00',
      name: 'Yoga',
      instructor: 'Valentina Ríos',
      start: past,
      durationMinutes: 60,
      capacity: 12,
      occupiedByOthers: 4,
    });

    expect(session.hasStartedAt(now)).toBe(true);
  });

  it('is not yet started when its start is strictly in the future', () => {
    const session = new ClassSession({
      id: 'C-09',
      name: 'Spinning',
      instructor: 'Andrés Restrepo',
      start: future,
      durationMinutes: 45,
      capacity: 20,
      occupiedByOthers: 13,
    });

    expect(session.hasStartedAt(now)).toBe(false);
  });

  it('treats a session that starts at the same instant as now as already started', () => {
    const session = new ClassSession({
      id: 'C-09',
      name: 'Spinning',
      instructor: 'Andrés Restrepo',
      start: now,
      durationMinutes: 45,
      capacity: 20,
      occupiedByOthers: 13,
    });

    expect(session.hasStartedAt(now)).toBe(true);
  });

  it('exposes its identifier, instructor, and start instant', () => {
    const session = new ClassSession({
      id: 'C-09',
      name: 'Spinning',
      instructor: 'Andrés Restrepo',
      start: future,
      durationMinutes: 45,
      capacity: 20,
      occupiedByOthers: 13,
    });

    expect(session.id).toBe('C-09');
    expect(session.instructor).toBe('Andrés Restrepo');
    expect(session.start.getTime()).toBe(future.getTime());
  });
});
