import { PrimaryButton } from '@shared/ui/components/PrimaryButton';
import { render, screen, fireEvent } from '@testing-library/react-native';

describe('PrimaryButton', () => {
  it('renders its label and fires onPress when enabled', async () => {
    const onPress = jest.fn();
    await render(<PrimaryButton label="Reservar" onPress={onPress} />);
    fireEvent.press(screen.getByText('Reservar'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', async () => {
    const onPress = jest.fn();
    await render(<PrimaryButton label="Llena" disabled onPress={onPress} />);
    fireEvent.press(screen.getByText('Llena'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
