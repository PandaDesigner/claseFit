// Phase 3 — TabsLayout: bottom-tab surface with both screens mounted.
// Verifies that the canonical expo-router v4 tabs pattern (single `(tabs)`
// group with two tabs) renders both Tabs.Screen children and exposes a
// custom tab bar.
import { render } from '@testing-library/react-native';

// ---- Module mocks (must be declared before importing the SUT) ----

// Mock expo-router so the Tabs surface is observable. Tabs renders a marker
// View and exposes its children + tabBar through testIDs. Tabs.Screen renders
// a marker Text with the screen name so we can assert both tabs are mounted.
jest.mock('expo-router', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactLib = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text: MockText, View: MockView } = require('react-native');
  const Screen = ({ name }: { name: string }) =>
    ReactLib.createElement(MockText, { testID: `tab-screen-${name}` }, name);
  const TabsRoot = ({
    children,
    tabBar,
  }: {
    children: React.ReactNode;
    tabBar?: (props: unknown) => React.ReactNode;
  }) =>
    ReactLib.createElement(
      MockView,
      { testID: 'tabs-root' },
      children,
      tabBar
        ? ReactLib.createElement(
            MockView,
            { testID: 'tabs-custom-bar' },
            ReactLib.createElement(MockText, { testID: 'tab-bar-rendered' }, 'tab-bar'),
          )
        : null,
    );
  // expo-router exposes Tabs.Screen as a static property on the component.
  TabsRoot.Screen = Screen;
  return {
    __esModule: true,
    Tabs: TabsRoot,
  };
});

// FloatingTabBar is a presentational component under (tabs)/_components. We
// don't need its real rendering here; the Tabs mock already verifies the
// tabBar prop is wired through.
jest.mock('../../_components/tabs/FloatingTabBar', () => ({
  __esModule: true,
  FloatingTabBar: () => null,
}));

// ---- SUT ----

// The SUT import must come after the jest.mock() declarations above.
// eslint-disable-next-line import/first
import TabsLayout from '../_layout';

describe('TabsLayout (bottom-tab surface)', () => {
  it('mounts the Tabs surface', async () => {
    const { findByTestId } = await render(<TabsLayout />);
    expect(await findByTestId('tabs-root')).toBeTruthy();
  });

  it('passes the custom tab bar (FloatingTabBar) to Tabs', async () => {
    const { findByTestId } = await render(<TabsLayout />);
    expect(await findByTestId('tab-bar-rendered')).toBeTruthy();
  });

  it('mounts both tab screens: proximas and reservas', async () => {
    const { findByTestId, findAllByTestId } = await render(<TabsLayout />);
    expect(await findByTestId('tab-screen-proximas')).toBeTruthy();
    expect(await findByTestId('tab-screen-reservas')).toBeTruthy();
    const screens = await findAllByTestId(/^tab-screen-/);
    expect(screens).toHaveLength(2);
  });
});
