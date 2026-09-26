import { render, screen, fireEvent } from '@testing-library/react-native';
import {
  CancellationSheet,
  CancellationSheetContent,
} from '@shared/ui/components/CancellationSheet';
import { messages } from '@features/class-booking/presentation/copy/messages';

describe('CancellationSheet', () => {
  describe('inner content (renders without Modal wrapping for testability)', () => {
    it('renders the prompt and description', async () => {
      const onKeep = jest.fn();
      const onConfirm = jest.fn();
      await render(
        <CancellationSheetContent onKeep={onKeep} onConfirm={onConfirm}>
          <CancellationSheet.Title />
          <CancellationSheet.Description />
          <CancellationSheet.Actions />
        </CancellationSheetContent>,
      );

      expect(screen.getByText(messages.cancelPrompt)).toBeTruthy();
      expect(screen.getByText(messages.cancelDescription)).toBeTruthy();
    });

    it('calls onKeep when the keep button is pressed', async () => {
      const onKeep = jest.fn();
      const onConfirm = jest.fn();
      await render(
        <CancellationSheetContent onKeep={onKeep} onConfirm={onConfirm}>
          <CancellationSheet.Title />
          <CancellationSheet.Actions />
        </CancellationSheetContent>,
      );

      fireEvent.press(screen.getByText(messages.keepBooking));
      expect(onKeep).toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('calls onConfirm when the cancel button is pressed', async () => {
      const onKeep = jest.fn();
      const onConfirm = jest.fn();
      await render(
        <CancellationSheetContent onKeep={onKeep} onConfirm={onConfirm}>
          <CancellationSheet.Title />
          <CancellationSheet.Actions />
        </CancellationSheetContent>,
      );

      fireEvent.press(screen.getByText(messages.confirmCancel));
      expect(onConfirm).toHaveBeenCalled();
    });

    it('calls onKeep when the backdrop is pressed', async () => {
      const onKeep = jest.fn();
      const onConfirm = jest.fn();
      await render(
        <CancellationSheetContent
          onKeep={onKeep}
          onConfirm={onConfirm}
          testID="cancel"
        >
          <CancellationSheet.Title />
          <CancellationSheet.Actions />
        </CancellationSheetContent>,
      );

      fireEvent.press(screen.getByTestId('cancel-backdrop'));
      expect(onKeep).toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('renders the session preview card when provided', async () => {
      const onKeep = jest.fn();
      const onConfirm = jest.fn();
      await render(
        <CancellationSheetContent
          onKeep={onKeep}
          onConfirm={onConfirm}
          sessionPreview={{
            name: 'Funcional',
            categoryColor: '#C6EBEE',
            dateLabel: 'Hoy',
            timeLabel: '18:00',
            durationMinutes: 60,
            instructor: 'Camila Ospina',
          }}
        >
          <CancellationSheet.Title />
          <CancellationSheet.Actions />
        </CancellationSheetContent>,
      );

      expect(screen.getByText('Funcional')).toBeTruthy();
      expect(screen.getByText('Hoy · 18:00 · 60 min')).toBeTruthy();
      expect(screen.getByText('Camila Ospina')).toBeTruthy();
    });
  });
});