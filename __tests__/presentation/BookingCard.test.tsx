import { BookingCard } from '@features/class-booking/presentation/components/BookingCard';
import { render, screen, fireEvent } from '@testing-library/react-native';

describe('BookingCard compound', () => {
  function makeProps(overrides: Partial<{ cancellable: boolean }> = {}) {
    return {
      id: 'R-01',
      sessionId: 'C-09',
      sessionName: 'Spinning',
      sessionStart: new Date('2026-03-04T13:00:00.000Z'),
      durationMinutes: 45,
      instructor: 'Andrés Restrepo',
      cancellable: overrides.cancellable ?? true,
      onCancel: jest.fn(),
    };
  }

  it('shows the session name, date, and instructor', async () => {
    const props = makeProps();
    await render(
      <BookingCard.Root {...props}>
        <BookingCard.Body />
        <BookingCard.Actions />
      </BookingCard.Root>,
    );

    expect(screen.getByText('Spinning')).toBeTruthy();
    expect(screen.getByText('Andrés Restrepo')).toBeTruthy();
  });

  it('exposes the cancel action when cancellable', async () => {
    const props = makeProps();
    await render(
      <BookingCard.Root {...props}>
        <BookingCard.Body />
        <BookingCard.Actions />
      </BookingCard.Root>,
    );

    fireEvent.press(screen.getByText('Cancelar'));
    expect(props.onCancel).toHaveBeenCalledWith('R-01');
  });

  it('disables the cancel action when the session is too close to start', async () => {
    const props = makeProps({ cancellable: false });
    await render(
      <BookingCard.Root {...props}>
        <BookingCard.Body />
        <BookingCard.Actions />
      </BookingCard.Root>,
    );

    fireEvent.press(screen.getByText('Cancelar'));
    expect(props.onCancel).not.toHaveBeenCalled();
  });
});
