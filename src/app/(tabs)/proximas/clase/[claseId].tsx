import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { designTokens } from '@shared/ui/tokens';

/**
 * Placeholder for the future class detail screen.
 *
 * Renders the dynamic `claseId` param verbatim. Does not call useComposition,
 * does not import feature modules, does not trigger navigation effects. A real
 * implementation will live behind its own OpenSpec change.
 */
export default function ClaseDetailPlaceholder(): React.ReactElement {
  const { claseId } = useLocalSearchParams<{ claseId: string }>();
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
      <Text testID="clase-detail-placeholder">Class detail: {claseId ?? ''}</Text>
    </View>
  );
}
