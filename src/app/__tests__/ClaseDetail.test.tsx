import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react-native';

// Mock expo-router so useLocalSearchParams returns a deterministic id and we
// don't need a real router context in the test.
jest.mock('expo-router', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactLib = require('react');
  const passthrough = (children: ReactNode) =>
    ReactLib.createElement(ReactLib.Fragment, null, children);
  return {
    __esModule: true,
    useLocalSearchParams: () => ({ claseId: 'C-09' }),
    Slot: () => null,
    Stack: ({ children }: { children: ReactNode }) => passthrough(children),
    Tabs: ({ children }: { children: ReactNode }) => passthrough(children),
    Link: () => null,
  };
});

// The SUT must be required AFTER the jest.mock() declarations above.
// eslint-disable-next-line import/first
import ClaseDetailPlaceholder from '../(tabs)/proximas/clase/[claseId]';

describe('ClaseDetailPlaceholder', () => {
  it('renders the dynamic claseId param verbatim', async () => {
    await render(<ClaseDetailPlaceholder />);
    expect(screen.getByTestId('clase-detail-placeholder')).toHaveTextContent('Class detail: C-09');
  });
});
