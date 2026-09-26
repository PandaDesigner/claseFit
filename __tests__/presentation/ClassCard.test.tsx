import { ClassCard } from '@features/class-booking/presentation/components/ClassCard';
import { render, screen, fireEvent } from '@testing-library/react-native';

const baseProps = {
  id: 'C-01',
  name: 'Spinning',
  instructor: 'Andrés Restrepo',
  start: new Date('2026-03-02T13:00:00.000Z'),
  durationMinutes: 45,
  capacity: 20,
  occupiedByOthers: 18,
  available: 2,
  isFull: false,
  isAlreadyReserved: false,
  onBook: jest.fn(),
} as const;

describe('ClassCard compound', () => {
  it('shows availability and the booking action when the session is available', async () => {
    await render(
      <ClassCard.Root {...baseProps}>
        <ClassCard.Header />
        <ClassCard.Body />
        <ClassCard.Actions />
      </ClassCard.Root>,
    );

    expect(screen.getByText('Spinning')).toBeTruthy();
    expect(screen.getByText('Andrés Restrepo')).toBeTruthy();
    expect(screen.getByText(/2 de 20/)).toBeTruthy();
    fireEvent.press(screen.getByText('Reservar'));
    expect(baseProps.onBook).toHaveBeenCalledWith('C-01');
  });

  it('labels the session as full when no seats remain', async () => {
    await render(
      <ClassCard.Root {...baseProps} available={0} isFull>
        <ClassCard.Header />
        <ClassCard.Body />
        <ClassCard.Actions />
      </ClassCard.Root>,
    );

    expect(screen.getByText('Llena')).toBeTruthy();
  });

  it('shows a non-interactive Reservada indicator when the session is already reserved', async () => {
    await render(
      <ClassCard.Root {...baseProps} isAlreadyReserved>
        <ClassCard.Header />
        <ClassCard.Body />
        <ClassCard.Actions />
      </ClassCard.Root>,
    );

    expect(screen.getByText('Reservada')).toBeTruthy();
    // Cancelar action lives in Mis reservas, not in the Clases screen
    expect(screen.queryByText('Cancelar')).toBeNull();
  });
});
