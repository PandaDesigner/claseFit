import { act, render, screen } from '@testing-library/react-native';
import { SuccessCheckmark } from '@shared/ui/components/SuccessCheckmark';

describe('SuccessCheckmark', () => {
  it('renders the label when visible is true', async () => {
    await render(
      <SuccessCheckmark visible onDismiss={jest.fn()} label="¡Listo! Tu cupo está reservado" />,
    );
    expect(screen.getByText('¡Listo! Tu cupo está reservado')).toBeTruthy();
  });

  it('renders the checkmark glyph while visible', async () => {
    await render(
      <SuccessCheckmark visible onDismiss={jest.fn()} label="ok" testID="check" />,
    );
    expect(screen.getByTestId('check')).toBeTruthy();
    expect(screen.getByText('✓')).toBeTruthy();
  });

  it('does not render anything when visible is false', async () => {
    await render(
      <SuccessCheckmark visible={false} onDismiss={jest.fn()} label="¡Listo!" testID="check" />,
    );
    expect(screen.queryByText('¡Listo!')).toBeNull();
    expect(screen.queryByTestId('check')).toBeNull();
  });

  it('auto-calls onDismiss after durationMs via fake timers', async () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();
    await render(
      <SuccessCheckmark visible onDismiss={onDismiss} label="done" durationMs={100} />,
    );
    expect(onDismiss).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(150);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('clears the auto-dismiss timer on unmount (does not call onDismiss after unmount)', async () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();
    const result = await render(
      <SuccessCheckmark visible onDismiss={onDismiss} label="bye" durationMs={100} />,
    );
    await act(async () => {
      result.unmount();
    });
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(onDismiss).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('clears the auto-dismiss timer when visible flips to false', async () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();
    const result = await render(
      <SuccessCheckmark visible onDismiss={onDismiss} label="hide" durationMs={100} />,
    );
    await result.rerender(
      <SuccessCheckmark visible={false} onDismiss={onDismiss} label="hide" />,
    );
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(onDismiss).not.toHaveBeenCalled();
    jest.useRealTimers();
  });
});
