import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { designTokens } from '../../shared/ui/tokens';
import { BarbellIcon, ClipboardIcon } from './TabBarIcons';

interface TabConfig {
  readonly routeName: string;
  readonly label: string;
  readonly Icon: (props: { color: string; size?: number }) => React.ReactElement;
}

const TAB_CONFIG: readonly TabConfig[] = [
  { routeName: 'Clases', label: 'Clases', Icon: BarbellIcon },
  { routeName: 'Mis reservas', label: 'Mis reservas', Icon: ClipboardIcon },
];

const ACTIVE_COLOR = '#FFFFFF';
const INACTIVE_COLOR = 'rgba(255, 255, 255, 0.55)';

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeIndex = state.index;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, designTokens.spacing.md) + designTokens.spacing.sm }]}
    >
      <View style={styles.dock}>
        {state.routes.map((route, index) => {
          const config = TAB_CONFIG.find((entry) => entry.routeName === route.name);
          if (!config) return null;
          const { options } = descriptors[route.key]!;
          const isFocused = activeIndex === index;
          const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };
          const accessibilityLabel =
            typeof options.tabBarAccessibilityLabel === 'string'
              ? options.tabBarAccessibilityLabel
              : config.label;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={accessibilityLabel}
              onPress={onPress}
              style={({ pressed }) => [
                styles.tab,
                isFocused ? styles.tabActive : null,
                pressed ? styles.tabPressed : null,
              ]}
            >
              <config.Icon color={color} size={22} />
              <Text style={[styles.label, { color }]} numberOfLines={1}>
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: designTokens.spacing.lg,
    alignItems: 'center',
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: designTokens.spacing.xs,
    backgroundColor: designTokens.color.actionPrimary,
    borderRadius: designTokens.radius.pill,
    paddingVertical: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.sm,
    minHeight: 64,
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.md,
    borderRadius: designTokens.radius.pill,
    minHeight: 48,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  tabPressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: designTokens.fontSize.body,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});