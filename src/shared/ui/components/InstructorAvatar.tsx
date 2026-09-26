import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { designTokens } from '../tokens';
import { instructorAvatar } from '../categoryAssets';

export interface InstructorAvatarProps {
  readonly name: string;
  readonly size?: number;
}

function initialsFor(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .filter((part) => /^[A-Za-zÀ-ÿ]+$/.test(part));
  if (parts.length === 0) return name.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function hashToIndex(name: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

export function InstructorAvatar({ name, size = 36 }: InstructorAvatarProps) {
  const photo = instructorAvatar(name);
  const palette = designTokens.color.instructorPalette;
  const bg = palette[hashToIndex(name, palette.length)] ?? palette[0]!;
  const dimensionStyle = {
    width: size,
    height: size,
    borderRadius: designTokens.radius.avatar,
  };
  if (photo) {
    return (
      <Image
        source={photo as ImageSourcePropType}
        style={[styles.image, dimensionStyle]}
        accessibilityRole="image"
        accessibilityLabel={`Foto de ${name}`}
      />
    );
  }
  return (
    <View
      style={[styles.fallback, dimensionStyle, { backgroundColor: bg }]}
      accessibilityRole="image"
      accessibilityLabel={`Avatar de ${name}`}
    >
      <Text style={[styles.initials, { fontSize: Math.round(size * 0.4) }]}>
        {initialsFor(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    overflow: 'hidden',
    backgroundColor: designTokens.color.cardSurface,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontWeight: '700',
    color: designTokens.color.textPrimary,
    letterSpacing: 0.4,
  },
});
