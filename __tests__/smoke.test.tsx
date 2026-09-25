import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';

function HelloWorld() {
  return (
    <View>
      <Text>Hola, Laura</Text>
    </View>
  );
}

describe('smoke test — Jest + RNTL stack', () => {
  it('renders a component', async () => {
    // RNTL 14's `render` is async — awaiting ensures the screen singleton is updated.
    await render(<HelloWorld />);
    expect(screen.getByText('Hola, Laura')).toBeOnTheScreen();
  });
});
