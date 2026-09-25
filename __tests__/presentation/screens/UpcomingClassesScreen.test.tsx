import { UpcomingClassesScreen } from '@features/class-booking/presentation/screens/UpcomingClassesScreen';
import { CompositionProvider } from '@features/class-booking/compositionProvider';
import { buildTestComposition } from '@features/class-booking/composition';
import { render, screen, fireEvent } from '@testing-library/react-native';

describe('UpcomingClassesScreen', () => {
  it('surfaces the success message after booking a session', async () => {
    const composition = buildTestComposition();
    await composition.initializeBookings.execute();
    const sessionId = composition.store.getSnapshot()!.resolvedSessions[0]!.id;

    await render(
      <CompositionProvider composition={composition}>
        <UpcomingClassesScreen />
      </CompositionProvider>,
    );

    const reservars = screen.getAllByText('Reservar');
    fireEvent.press(reservars[0]!);
    expect(await screen.findByText('¡Listo! Tu cupo está reservado')).toBeTruthy();
    expect(composition.store.getSnapshot()?.bookings).toHaveLength(1);
    expect(sessionId).toBeTruthy();
  });

  it('shows the literal no-capacity message when the user books a full session', async () => {
    const composition = buildTestComposition();
    await composition.initializeBookings.execute();
    await composition.bookClass.execute({
      sessionId: composition.store.getSnapshot()!.resolvedSessions[0]!.id,
    });
    // Mark all sessions full so we can attempt to book a full one.
    composition.store.replaceSnapshot({
      ...composition.store.getSnapshot()!,
      resolvedSessions: composition.store.getSnapshot()!.resolvedSessions.map((s) => ({
        ...s,
        occupiedByOthers: s.capacity,
      })),
    });

    await render(
      <CompositionProvider composition={composition}>
        <UpcomingClassesScreen />
      </CompositionProvider>,
    );

    fireEvent.press(screen.getAllByText('Llena')[0]!);
    expect(composition.store.getSnapshot()?.bookings).toHaveLength(1);
  });
});
