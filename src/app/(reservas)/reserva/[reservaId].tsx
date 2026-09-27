import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { designTokens } from '../../../shared/ui/tokens';

/**
 * Placeholder for the future reservation detail screen.
 *
 * Renders the dynamic `reservaId` param verbatim. Does not call useComposition,
 * does not import feature modules, does not trigger navigation effects. A real
 * implementation will live behind its own OpenSpec change.
 */
export default function ReservaDetailPlaceholder(): React.ReactElement {
  const { reservaId } = useLocalSearchParams<{ reservaId: string }>();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: designTokens.color.background,
        padding: designTokens.spacing.lg,
      }}
    >
      <Text testID="reserva-detail-placeholder">Reservation detail: {reservaId ?? ''}</Text>
    </View>
  );
}
