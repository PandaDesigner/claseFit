import { CancellationSheet } from '@features/class-booking/presentation/components/CancellationSheet';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { messages } from '@features/class-booking/presentation/copy/messages';

describe('CancellationSheet compound', () => {
  it('renders the prompt and confirmation action', async () => {
    const onKeep = jest.fn();
    const onConfirm = jest.fn();
    await render(
      <CancellationSheet.Root visible onKeep={onKeep} onConfirm={onConfirm}>
        <CancellationSheet.Title />
        <CancellationSheet.Description />
        <CancellationSheet.Actions />
      </CancellationSheet.Root>,
    );

    expect(screen.getByText(messages.cancelPrompt)).toBeTruthy();
    expect(screen.getByText(messages.cancelDescription)).toBeTruthy();
    fireEvent.press(screen.getByText(messages.keepBooking));
    expect(onKeep).toHaveBeenCalled();
    fireEvent.press(screen.getByText(messages.confirmCancel));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('does not render any controls when hidden', async () => {
    await render(
      <CancellationSheet.Root visible={false} onKeep={jest.fn()} onConfirm={jest.fn()}>
        <CancellationSheet.Title />
        <CancellationSheet.Description />
        <CancellationSheet.Actions />
      </CancellationSheet.Root>,
    );

    expect(screen.queryByText(messages.cancelPrompt)).toBeNull();
  });
});
