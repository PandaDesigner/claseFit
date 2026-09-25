import { buildTestComposition } from '@features/class-booking/composition';

describe('composition (in-memory test wiring)', () => {
  it('hydrates a snapshot through the full wiring', async () => {
    const composition = buildTestComposition();
    await composition.initializeBookings.execute();
    const snapshot = composition.store.getSnapshot();
    expect(snapshot).not.toBeNull();
    expect(snapshot?.resolvedSessions).toHaveLength(10);
  });

  it('books a session and publishes through the same store', async () => {
    const composition = buildTestComposition();
    await composition.initializeBookings.execute();
    const sessionId = composition.store.getSnapshot()!.resolvedSessions[0]!.id;

    const result = await composition.bookClass.execute({ sessionId });

    expect(result.status).toBe('success');
    expect(composition.store.getSnapshot()?.bookings).toHaveLength(1);
  });

  it('lists upcoming sessions through the same store', async () => {
    const composition = buildTestComposition();
    await composition.initializeBookings.execute();
    const sessions = composition.listUpcomingSessions.execute();
    expect(sessions.length).toBeGreaterThan(0);
  });
});
