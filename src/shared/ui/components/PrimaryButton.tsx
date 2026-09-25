import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { designTokens } from '../tokens';

export interface PrimaryButtonProps {
  readonly label: string;
  readonly onPress?: () => void;
  readonly disabled?: boolean;
  readonly testID?: string;
  readonly style?: ViewStyle;
}

export function PrimaryButton({ label, onPress, disabled, testID, style }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={() => {
        if (disabled) return;
        onPress?.();
      }}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
        style,
      ]}
    >
      <Text style={[styles.label, disabled ? styles.labelDisabled : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: designTokens.spacing.xl,
    paddingVertical: designTokens.spacing.md,
    borderRadius: designTokens.radius.control,
    backgroundColor: designTokens.color.actionPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    backgroundColor: designTokens.color.actionDisabled,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  labelDisabled: {
    color: '#FFFFFF',
  },
});
