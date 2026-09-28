import { render, screen, fireEvent } from '@testing-library/react-native';
import { BookingGateSheet, BookingGateSheetContent } from '@shared/ui/components/BookingGateSheet';

const PROMPT = '¿Reservar esta clase?';
const DESCRIPTION = 'Tu cupo quedará guardado hasta 2 horas antes de empezar.';
const CANCEL = 'Elegir otra';
const CONFIRM = 'Sí, reservar';

describe('BookingGateSheet', () => {
  describe('inner content (renders without Modal wrapping for testability)', () => {
    it('renders the prompt and description', async () => {
      const onCancel = jest.fn();
      const onConfirm = jest.fn();
      await render(
        <BookingGateSheetContent onCancel={onCancel} onConfirm={onConfirm}>
          <BookingGateSheet.Title />
          <BookingGateSheet.Description />
          <BookingGateSheet.Actions />
        </BookingGateSheetContent>,
      );

      expect(screen.getByText(PROMPT)).toBeTruthy();
      expect(screen.getByText(DESCRIPTION)).toBeTruthy();
    });

    it('calls onCancel when the "Elegir otra" pill is pressed', async () => {
      const onCancel = jest.fn();
      const onConfirm = jest.fn();
      await render(
        <BookingGateSheetContent onCancel={onCancel} onConfirm={onConfirm}>
          <BookingGateSheet.Title />
          <BookingGateSheet.Actions />
        </BookingGateSheetContent>,
      );

      fireEvent.press(screen.getByText(CANCEL));
      expect(onCancel).toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('calls onConfirm when the "Sí, reservar" pill is pressed', async () => {
      const onCancel = jest.fn();
      const onConfirm = jest.fn();
      await render(
        <BookingGateSheetContent onCancel={onCancel} onConfirm={onConfirm}>
          <BookingGateSheet.Title />
          <BookingGateSheet.Actions />
        </BookingGateSheetContent>,
      );

      fireEvent.press(screen.getByText(CONFIRM));
      expect(onConfirm).toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('calls onCancel when the backdrop is pressed', async () => {
      const onCancel = jest.fn();
      const onConfirm = jest.fn();
      await render(
        <BookingGateSheetContent onCancel={onCancel} onConfirm={onConfirm} testID="book-gate">
          <BookingGateSheet.Title />
          <BookingGateSheet.Actions />
        </BookingGateSheetContent>,
      );

      fireEvent.press(screen.getByTestId('book-gate-backdrop'));
      expect(onCancel).toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('renders the session preview card when provided', async () => {
      const onCancel = jest.fn();
      const onConfirm = jest.fn();
      await render(
        <BookingGateSheetContent
          onCancel={onCancel}
          onConfirm={onConfirm}
          sessionPreview={{
            name: 'Spinning',
            categoryColor: '#D8F3E5',
            dateLabel: 'Hoy',
            timeLabel: '06:00',
            durationMinutes: 45,
            instructor: 'Andrés Restrepo',
          }}
        >
          <BookingGateSheet.Title />
          <BookingGateSheet.Actions />
        </BookingGateSheetContent>,
      );

      expect(screen.getByText('Spinning')).toBeTruthy();
      expect(screen.getByText('Hoy · 06:00 · 45 min')).toBeTruthy();
      expect(screen.getByText('Andrés Restrepo')).toBeTruthy();
    });
  });
});
