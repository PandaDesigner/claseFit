import { StyleSheet, View, type ViewStyle } from 'react-native';
import { designTokens } from '../../shared/ui/tokens';

export interface TabIconProps {
  readonly color: string;
  readonly size?: number;
}

const ICON_SIZE_DEFAULT = 22;

export function BarbellIcon({ color, size = ICON_SIZE_DEFAULT }: TabIconProps) {
  const plateWidth = Math.round(size * 0.32);
  const plateHeight = Math.round(size * 0.68);
  const barHeight = Math.round(size * 0.18);
  return (
    <View
      style={[styles.row, { height: plateHeight, width: size }]}
      accessible={false}
      importantForAccessibility="no"
    >
      <View
        style={[
          styles.plate,
          {
            width: plateWidth,
            height: plateHeight,
            backgroundColor: color,
            borderTopLeftRadius: 2,
            borderBottomLeftRadius: 2,
            borderTopRightRadius: 1,
            borderBottomRightRadius: 1,
          },
        ]}
      />
      <View
        style={[
          styles.bar,
          {
            height: barHeight,
            backgroundColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.plate,
          {
            width: plateWidth,
            height: plateHeight,
            backgroundColor: color,
            borderTopRightRadius: 2,
            borderBottomRightRadius: 2,
            borderTopLeftRadius: 1,
            borderBottomLeftRadius: 1,
          },
        ]}
      />
    </View>
  );
}

export function ClipboardIcon({ color, size = ICON_SIZE_DEFAULT }: TabIconProps) {
  const boardWidth = Math.round(size * 0.78);
  const boardHeight = Math.round(size * 0.92);
  const clipWidth = Math.round(size * 0.4);
  const clipHeight = Math.round(size * 0.18);
  return (
    <View
      style={[
        styles.clipboardContainer,
        { width: size, height: size },
      ]}
      accessible={false}
      importantForAccessibility="no"
    >
      <View
        style={[
          styles.clipboardBoard,
          {
            width: boardWidth,
            height: boardHeight,
            borderColor: color,
            borderWidth: 1.6,
            borderRadius: 2,
          },
        ]}
      >
        <View
          style={[
            styles.clipboardLine,
            {
              width: Math.round(boardWidth * 0.55),
              backgroundColor: color,
            },
          ]}
        />
        <View
          style={[
            styles.clipboardLine,
            {
              width: Math.round(boardWidth * 0.4),
              backgroundColor: color,
            },
          ]}
        />
      </View>
      <View
        style={[
          styles.clipboardClip,
          {
            width: clipWidth,
            height: clipHeight,
            borderColor: color,
            borderWidth: 1.6,
            backgroundColor: designTokens.color.background,
            borderRadius: 1.5,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,
  plate: {},
  bar: {
    flexGrow: 1,
  },
  clipboardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clipboardBoard: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 2,
    gap: 2,
  },
  clipboardLine: {
    height: 1.6,
    borderRadius: 1,
  },
  clipboardClip: {
    position: 'absolute',
    top: 1,
  },
});