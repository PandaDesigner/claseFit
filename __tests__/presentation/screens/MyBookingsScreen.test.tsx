import { MyBookingsScreen } from '@features/class-booking/presentation/screens/MyBookingsScreen';
import { CompositionProvider } from '@features/class-booking/compositionProvider';
import { buildTestComposition } from '@features/class-booking/composition';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { messages } from '@features/class-booking/presentation/copy/messages';

const renderScreen = (composition: ReturnType<typeof buildTestComposition>) =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 0, height: 0 },
        insets: { top: 0, right: 0, bottom: 0, left: 0 },
      }}
    >
      <CompositionProvider composition={composition}>
        <MyBookingsScreen />
      </CompositionProvider>
    </SafeAreaProvider>,
  );

describe('MyBookingsScreen', () => {
  it('shows the literal empty-state message when there are no bookings', async () => {
    const composition = buildTestComposition();
    await composition.initializeBookings.execute();
    await renderScreen(composition);
    expect(screen.getByText(messages.emptyBookings)).toBeTruthy();
  });

  it('opens the cancellation sheet and confirms cancellation', async () => {
    const composition = buildTestComposition();
    await composition.initializeBookings.execute();
    const farFuture = composition.store
      .getSnapshot()!
      .resolvedSessions.find(
        (s) =>
          new Date(s.startISO).getTime() - new Date('2026-03-02T18:00:00.000Z').getTime() >
          1000 * 60 * 60 * 2,
      )!;
    expect(farFuture).toBeDefined();
    await composition.bookClass.execute({ sessionId: farFuture!.id });

    await renderScreen(composition);

    await act(async () => {
      fireEvent.press(screen.getByText('Cancelar'));
    });
    expect(screen.getByText(messages.cancelPrompt)).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByText(messages.confirmCancel));
    });
    expect(composition.store.getSnapshot()?.bookings[0]?.status).toBe('cancelled');
  });
});
