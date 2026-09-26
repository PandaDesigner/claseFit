import { render, screen, fireEvent } from '@testing-library/react-native';
import {
  SuccessSheet,
  SuccessSheetContent,
} from '@shared/ui/components/SuccessSheet';

describe('SuccessSheet', () => {
  describe('inner content (renders without Modal wrapping for testability)', () => {
    it('renders the title, message, and CTA', async () => {
      await render(
        <SuccessSheetContent onDismiss={jest.fn()} testID="success">
          <SuccessSheet.Title>¡Listo!</SuccessSheet.Title>
          <SuccessSheet.Message>¡Listo! Tu cupo está reservado</SuccessSheet.Message>
          <SuccessSheet.Actions ctaLabel="Listo" />
        </SuccessSheetContent>,
      );
      expect(screen.getByText('¡Listo!')).toBeTruthy();
      expect(screen.getByText('¡Listo! Tu cupo está reservado')).toBeTruthy();
      expect(screen.getByText('Listo')).toBeTruthy();
    });

    it('calls onDismiss when the CTA is pressed', async () => {
      const onDismiss = jest.fn();
      await render(
        <SuccessSheetContent onDismiss={onDismiss} testID="success">
          <SuccessSheet.Title>¡Listo!</SuccessSheet.Title>
          <SuccessSheet.Actions ctaLabel="Listo" />
        </SuccessSheetContent>,
      );
      fireEvent.press(screen.getByText('Listo'));
      expect(onDismiss).toHaveBeenCalled();
    });

    it('calls onDismiss when the backdrop is pressed', async () => {
      const onDismiss = jest.fn();
      await render(
        <SuccessSheetContent onDismiss={onDismiss} testID="success">
          <SuccessSheet.Title>¡Listo!</SuccessSheet.Title>
        </SuccessSheetContent>,
      );
      fireEvent.press(screen.getByTestId('success-backdrop'));
      expect(onDismiss).toHaveBeenCalled();
    });

    it('calls a custom onPress instead of onDismiss when provided', async () => {
      const onDismiss = jest.fn();
      const onCtaPress = jest.fn();
      await render(
        <SuccessSheetContent onDismiss={onDismiss} testID="success">
          <SuccessSheet.Title>¡Listo!</SuccessSheet.Title>
          <SuccessSheet.Actions ctaLabel="Listo" onPress={onCtaPress} />
        </SuccessSheetContent>,
      );
      fireEvent.press(screen.getByText('Listo'));
      expect(onCtaPress).toHaveBeenCalled();
      expect(onDismiss).not.toHaveBeenCalled();
    });
  });
});