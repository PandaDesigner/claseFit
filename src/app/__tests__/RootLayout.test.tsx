// Phase 2 — RootLayout: composition boundary + CompositionProvider + Slot mount.
// Verifies the architecture invariant: _layout.tsx is the only place that
// builds the production composition; feature screens consume useComposition().
// The composition is built synchronously inside a useState initializer so the
// route tree mounts on first render; initializeBookings runs fire-and-forget
// in the background.
import { useContext } from 'react';
import { Text } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import {
  __CompositionContextForTests,
  CompositionProvider,
} from '@features/class-booking/compositionProvider';
import type { Composition } from '@features/class-booking/composition';

// ---- Module mocks (must be declared before importing the SUT) ----

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

// react-native-safe-area-context needs native frame metrics to render its
// children in jest-expo. Mock the surface area the SUT uses to plain
// pass-through so test queries can traverse into Slot/CompositionProvider.
jest.mock('react-native-safe-area-context', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require('react');
  const passthrough = (children: React.ReactNode): React.ReactElement =>
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('react').createElement(ReactModule.Fragment, null, children);
  return {
    __esModule: true,
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) =>
      passthrough(children),
    SafeAreaView: ({ children }: { children: React.ReactNode }) =>
      passthrough(children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 0, height: 0 }),
  };
});

// Mock expo-router so that <Slot/> renders a Text with a known testID. This
// lets us assert that the SUT has reached the hydrated branch without
// depending on SafeAreaProvider/testID traversal quirks of jest-expo.
jest.mock('expo-router', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactLib = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text: MockText } = require('react-native');
  return {
    __esModule: true,
    Slot: () =>
      ReactLib.createElement(
        MockText,
        { testID: 'route-tree-marker' },
        'route-tree-mounted',
      ),
  };
});

const mockCompositionFactory = jest.fn();
jest.mock('@features/class-booking/composition', () => ({
  buildProductionComposition: (...args: unknown[]) => mockCompositionFactory(...args),
}));

// ---- Test doubles ----

const stubComposition: Composition = {
  initializeBookings: { execute: jest.fn().mockResolvedValue(undefined) } as never,
  bookClass: {} as never,
  cancelBooking: {} as never,
  refreshEligibility: {} as never,
  listUpcomingSessions: {} as never,
  listActiveBookings: {} as never,
  store: {} as never,
  repository: {} as never,
  clock: {} as never,
};

// ---- SUT ----

// The SUT import must come after the jest.mock() declarations above (they are
// hoisted by Jest but ESLint's import/first rule does not know that).
// eslint-disable-next-line import/first
import RootLayout from '../_layout';

describe('RootLayout (app shell)', () => {
  beforeEach(() => {
    mockCompositionFactory.mockReset();
    mockCompositionFactory.mockReturnValue(stubComposition);
  });

  it('calls buildProductionComposition exactly once with an AsyncStorage-shaped storage on mount', async () => {
    await render(<RootLayout />);
    await waitFor(() => {
      expect(mockCompositionFactory).toHaveBeenCalledTimes(1);
      const [arg] = mockCompositionFactory.mock.calls[0]!;
      expect(arg).toHaveProperty('storage');
    });
  });

  it('mounts the route tree on first render (composition is built synchronously)', async () => {
    const { findByTestId } = await render(<RootLayout />);
    expect(await findByTestId('route-tree-marker')).toBeTruthy();
  });

  it('still mounts the route tree when initializeBookings rejects (failure must not block mount)', async () => {
    mockCompositionFactory.mockReturnValue({
      ...stubComposition,
      initializeBookings: {
        execute: jest.fn().mockRejectedValue(new Error('persistence failure')),
      },
    });

    const { findByTestId } = await render(<RootLayout />);
    expect(await findByTestId('route-tree-marker')).toBeTruthy();
  });

  it('kicks off initializeBookings.execute in the background on mount', async () => {
    const execute = jest.fn().mockResolvedValue(undefined);
    mockCompositionFactory.mockReturnValue({
      ...stubComposition,
      initializeBookings: { execute } as never,
    });

    await render(<RootLayout />);

    await waitFor(() => {
      expect(execute).toHaveBeenCalledTimes(1);
    });
  });

  it('exposes the composition value through the CompositionProvider context', async () => {
    const seen: (Composition | null)[] = [];

    function Spy(): React.ReactElement {
      const value = useContext(__CompositionContextForTests);
      seen.push(value);
      return <Text testID="spy" />;
    }

    await render(
      <CompositionProvider composition={stubComposition}>
        <Spy />
      </CompositionProvider>,
    );

    expect(seen).toContain(stubComposition);
  });
});
