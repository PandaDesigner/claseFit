import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { designTokens } from '../tokens';

export type PillVariant =
  'primary' | 'disabled' | 'success' | 'outline' | 'reserved' | 'destructive';

export interface PillProps {
  readonly label: string;
  readonly onPress?: () => void;
  readonly disabled?: boolean;
  readonly variant?: PillVariant;
  readonly withArrow?: boolean;
  readonly testID?: string;
  readonly style?: ViewStyle;
  readonly accessibilityLabel?: string;
}

const variantBackgrounds = new Map<PillVariant, string>([
  ['primary', designTokens.color.actionPrimary],
  ['disabled', designTokens.color.actionDisabled],
  ['success', designTokens.color.successText],
  ['outline', 'transparent'],
  ['reserved', designTokens.color.successText],
  ['destructive', designTokens.color.destructiveSurface],
]);

const variantTextColors = new Map<PillVariant, string>([
  ['primary', '#FFFFFF'],
  ['disabled', '#FFFFFF'],
  ['success', designTokens.color.successSurface],
  ['reserved', designTokens.color.successSurface],
  ['outline', designTokens.color.textPrimary],
  ['destructive', designTokens.color.destructiveText],
]);

const variantBorders = new Map<PillVariant, string>([
  ['outline', designTokens.color.textPrimary],
]);

function variantBackground(variant: PillVariant): string {
  return variantBackgrounds.get(variant) ?? designTokens.color.actionPrimary;
}

function variantTextColor(variant: PillVariant): string {
  return variantTextColors.get(variant) ?? '#FFFFFF';
}

function variantBorder(variant: PillVariant): string | undefined {
  return variantBorders.get(variant);
}

export function Pill({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  withArrow = false,
  testID,
  style,
  accessibilityLabel,
}: PillProps) {
  const bg = disabled ? variantBackground('disabled') : variantBackground(variant);
  const fg = variantTextColor(variant);
  const borderColor = variantBorder(variant);
  const isInteractive = Boolean(onPress) && !disabled;

  const baseStyle = [
    styles.pill,
    { backgroundColor: bg },
    borderColor ? { borderWidth: 1.5, borderColor } : null,
    style,
  ];

  const content = (
    <>
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
      {withArrow ? (
        <View style={styles.arrow}>
          <Text style={[styles.arrowGlyph, { color: fg }]}>→</Text>
        </View>
      ) : null}
    </>
  );

  return (
    <Pressable
      accessibilityRole={isInteractive ? 'button' : 'text'}
      accessibilityState={{ disabled: !isInteractive }}
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={!isInteractive}
      onPress={() => {
        onPress?.();
      }}
      testID={testID}
      style={({ pressed }) => [...baseStyle, pressed && isInteractive ? styles.pressed : null]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 44,
    paddingHorizontal: designTokens.spacing.xl,
    paddingVertical: designTokens.spacing.sm,
    borderRadius: designTokens.radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  label: {
    fontSize: designTokens.fontSize.body,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  arrow: {
    marginLeft: designTokens.spacing.sm,
  },
  arrowGlyph: {
    fontSize: designTokens.fontSize.bodyLg,
    fontWeight: '700',
  },
});
