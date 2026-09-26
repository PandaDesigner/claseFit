import * as mockReact from 'react';
import { UpcomingClassesScreen } from '@features/class-booking/presentation/screens/UpcomingClassesScreen';
import { CompositionProvider } from '@features/class-booking/compositionProvider';
import { buildTestComposition } from '@features/class-booking/composition';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BookingGateSheet } from '@shared/ui/components/BookingGateSheet';

jest.mock('@shared/ui/components/BookingGateSheet', () => {
  const actualModule = jest.requireActual('@shared/ui/components/BookingGateSheet');
  const mockContent = actualModule.BookingGateSheetContent;
  // Mock Root renders the inner content directly (bypassing the platform Modal
  // which jest-expo does not expose). It captures the latest props so the test
  // can invoke onConfirm / onCancel without relying on jest.fn() tracking (which
  // is unreliable for module-factory mocks under jest-expo).
  let lastProps: { onConfirm: () => Promise<void> | void; onCancel: () => void; visible: boolean } | null = null;
  const mockRoot: React.ComponentType<any> = (props: any) => {
    lastProps = { onConfirm: props.onConfirm, onCancel: props.onCancel, visible: props.visible };
    return mockReact.createElement(mockContent, {
      onCancel: props.onCancel,
      onConfirm: props.onConfirm,
      sessionPreview: props.sessionPreview,
      testID: props.testID,
      children: props.children,
    });
  };
  (mockRoot as any).__getLastProps = () => lastProps;
  return {
    BookingGateSheet: {
      Root: mockRoot,
      Title: actualModule.BookingGateSheet.Title,
      Description: actualModule.BookingGateSheet.Description,
      Actions: actualModule.BookingGateSheet.Actions,
    },
    BookingGateSheetContent: mockContent,
  };
});

jest.mock('@shared/ui/components/SuccessCheckmark', () => ({
  SuccessCheckmark: (props: { label: string }) => {
    return mockReact.createElement(
      mockReact.Fragment,
      null,
      mockReact.createElement('Text', null, props.label),
    );
  },
}));

const renderScreen = (composition: ReturnType<typeof buildTestComposition>) =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 0, height: 0 },
        insets: { top: 0, right: 0, bottom: 0, left: 0 },
      }}
    >
      <CompositionProvider composition={composition}>
        <UpcomingClassesScreen />
      </CompositionProvider>
    </SafeAreaProvider>,
  );

const FR05 = '¡Listo! Tu cupo está reservado';
const GATE_PROMPT = '¿Reservar esta clase?';
const GATE_DESCRIPTION = 'Tu cupo quedará guardado hasta 2 horas antes de empezar.';
const CANCEL_PILL = 'Elegir otra';
const CONFIRM_PILL = 'Sí, reservar';

function getGateLastProps() {
  return (BookingGateSheet.Root as unknown as { __getLastProps: () => unknown }).__getLastProps() as {
    onConfirm: () => Promise<void> | void;
    onCancel: () => void;
    visible: boolean;
  } | null;
}

describe('UpcomingClassesScreen', () => {
  it('opens the gate on Reservar tap and persists nothing yet', async () => {
    const composition = buildTestComposition();
    await composition.initializeBookings.execute();
    const sessionId = composition.store.getSnapshot()!.resolvedSessions[0]!.id;

    await renderScreen(composition);

    fireEvent.press(screen.getAllByText('Reservar')[0]!);

    // Gate is mounted with the booking prompt + description + both pills.
    expect(await screen.findByText(GATE_PROMPT)).toBeTruthy();
    expect(await screen.findByText(GATE_DESCRIPTION)).toBeTruthy();
    expect(await screen.findByText(CANCEL_PILL)).toBeTruthy();
    expect(await screen.findByText(CONFIRM_PILL)).toBeTruthy();

    // No booking persisted yet — gate must gate the use case.
    expect(composition.store.getSnapshot()?.bookings).toHaveLength(0);
    expect(sessionId).toBeTruthy();
  });

  it('persists the booking and shows the checkmark after the gate is confirmed', async () => {
    const composition = buildTestComposition();
    await composition.initializeBookings.execute();

    await renderScreen(composition);

    fireEvent.press(screen.getAllByText('Reservar')[0]!);
    // Wait for the gate to mount so the mock Root has captured the latest props.
    await screen.findByText(GATE_PROMPT);

    const gateProps = getGateLastProps();
    expect(gateProps).not.toBeNull();
    expect(gateProps!.visible).toBe(true);

    await act(async () => {
      await gateProps!.onConfirm();
    });

    expect(composition.store.getSnapshot()?.bookings).toHaveLength(1);
    // FR-05 literal appears exactly once (no duplicated "¡Listo!" — the duplication regression cannot recur).
    expect(screen.getAllByText(FR05)).toHaveLength(1);
  });

  it('does not persist a booking when the gate is dismissed via "Elegir otra"', async () => {
    const composition = buildTestComposition();
    await composition.initializeBookings.execute();

    await renderScreen(composition);

    await act(async () => {
      fireEvent.press(screen.getAllByText('Reservar')[0]!);
    });
    await screen.findByText(CANCEL_PILL);
    await act(async () => {
      fireEvent.press(screen.getByText(CANCEL_PILL));
    });

    expect(composition.store.getSnapshot()?.bookings).toHaveLength(0);
    // Gate is dismissed: its prompt is no longer rendered.
    expect(screen.queryByText(GATE_PROMPT)).toBeNull();
  });

  it('does not persist a booking when the gate is dismissed via backdrop tap', async () => {
    const composition = buildTestComposition();
    await composition.initializeBookings.execute();

    await renderScreen(composition);

    await act(async () => {
      fireEvent.press(screen.getAllByText('Reservar')[0]!);
    });
    // The backdrop is rendered by BookingGateSheetContent with testID `booking-gate-backdrop`.
    await screen.findByTestId('booking-gate-backdrop');
    await act(async () => {
      fireEvent.press(screen.getByTestId('booking-gate-backdrop'));
    });

    expect(composition.store.getSnapshot()?.bookings).toHaveLength(0);
    expect(screen.queryByText(GATE_PROMPT)).toBeNull();
  });

  it('shows the no-capacity message when the user books a full session', async () => {
    const composition = buildTestComposition();
    await composition.initializeBookings.execute();
    await composition.bookClass.execute({
      sessionId: composition.store.getSnapshot()!.resolvedSessions[0]!.id,
    });
    composition.store.replaceSnapshot({
      ...composition.store.getSnapshot()!,
      resolvedSessions: composition.store.getSnapshot()!.resolvedSessions.map((s) => ({
        ...s,
        occupiedByOthers: s.capacity,
      })),
    });

    await renderScreen(composition);

    fireEvent.press(screen.getAllByText('Llena')[0]!);
    expect(composition.store.getSnapshot()?.bookings).toHaveLength(1);
  });
});
