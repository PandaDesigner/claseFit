import * as mockReact from 'react';
import { MyBookingsScreen } from '@features/class-booking/presentation/screens/MyBookingsScreen';
import { CompositionProvider } from '@features/class-booking/compositionProvider';
import { buildTestComposition } from '@features/class-booking/composition';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { messages } from '@features/class-booking/presentation/copy/messages';
import { SuccessCheckmark } from '@shared/ui/components/SuccessCheckmark';

// Mock the SuccessCheckmark so the test can assert it is mounted without relying
// on the real Animated.View (which jest-expo does not render fully).
jest.mock('@shared/ui/components/SuccessCheckmark', () => {
  let lastProps: { visible: boolean; label: string; onDismiss: () => void } | null = null;
  const mockSuccessCheckmark: React.ComponentType<any> = (props: any) => {
    lastProps = { visible: props.visible, label: props.label, onDismiss: props.onDismiss };
    return mockReact.createElement(
      mockReact.Fragment,
      null,
      mockReact.createElement('Text', { testID: 'cancel-success-checkmark-label' }, props.label),
    );
  };
  (mockSuccessCheckmark as any).__getLastProps = () => lastProps;
  return { SuccessCheckmark: mockSuccessCheckmark };
});

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

function getCheckmarkLastProps() {
  return (SuccessCheckmark as unknown as { __getLastProps: () => unknown }).__getLastProps() as {
    visible: boolean;
    label: string;
    onDismiss: () => void;
  } | null;
}

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

  it('renders the cancellation success feedback as SuccessCheckmark (not a platform Modal)', async () => {
    const composition = buildTestComposition();
    await composition.initializeBookings.execute();
    const farFuture = composition.store
      .getSnapshot()!
      .resolvedSessions.find(
        (s) =>
          new Date(s.startISO).getTime() - new Date('2026-03-02T18:00:00.000Z').getTime() >
          1000 * 60 * 60 * 2,
      )!;
    await composition.bookClass.execute({ sessionId: farFuture!.id });

    await renderScreen(composition);

    await act(async () => {
      fireEvent.press(screen.getByText('Cancelar'));
    });
    await act(async () => {
      fireEvent.press(screen.getByText(messages.confirmCancel));
    });
    // Wait for the SuccessCheckmark mock to mount (re-render after async cancel).
    await screen.findByTestId('cancel-success-checkmark-label');

    // The cancellation success checkmark should be visible with the FR-05 cancellation message.
    const checkmarkProps = getCheckmarkLastProps();
    expect(checkmarkProps).not.toBeNull();
    expect(checkmarkProps!.visible).toBe(true);
    // The label should carry the cancellation outcome (not the booking FR-05 literal).
    expect(checkmarkProps!.label).toBeTruthy();
    expect(checkmarkProps!.label).not.toBe(messages.success);

    // No platform Modal from MyBookingsScreen should display the legacy "Reserva cancelada" title.
    expect(screen.queryByText('Reserva cancelada')).toBeNull();
  });
});
