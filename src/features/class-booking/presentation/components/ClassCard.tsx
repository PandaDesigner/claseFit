import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { designTokens } from '@shared/ui/tokens';
import { categoryColor, categoryAsset, instructorGender } from '@shared/ui/categoryAssets';
import { InstructorAvatar } from '@shared/ui/components/InstructorAvatar';
import { PixelPattern } from '@shared/ui/components/PixelPattern';
import { Pill as PillComponent, type PillProps } from '@shared/ui/components/Pill';
import {
  messages,
  instructorEyebrow,
  seatsLabel,
} from '@features/class-booking/presentation/copy/messages';

export interface ClassCardProps {
  readonly id: string;
  readonly name: string;
  readonly instructor: string;
  readonly start: Date;
  readonly durationMinutes: number;
  readonly capacity: number;
  readonly occupiedByOthers: number;
  readonly available: number;
  readonly isFull: boolean;
  readonly isAlreadyReserved: boolean;
  readonly onBook: (sessionId: string) => void;
  readonly children: ReactNode;
}

type ClassCardContextValue = ClassCardProps;

const ClassCardContext = createContext<ClassCardContextValue | null>(null);

function useClassCard(): ClassCardContextValue {
  const value = useContext(ClassCardContext);
  if (!value) {
    throw new Error('ClassCard compound parts must be rendered inside ClassCard.Root');
  }
  return value;
}

type ActionState =
  | { readonly kind: 'available'; readonly onBook: () => void }
  | { readonly kind: 'full' }
  | { readonly kind: 'reserved' };

function deriveActionState(card: ClassCardContextValue): ActionState {
  if (card.isAlreadyReserved) {
    return { kind: 'reserved' };
  }
  if (card.isFull) {
    return { kind: 'full' };
  }
  return { kind: 'available', onBook: () => card.onBook(card.id) };
}

function buildPillProps(
  state: ActionState,
  className: string,
): {
  readonly config: PillProps;
  readonly a11yLabel: string;
} {
  switch (state.kind) {
    case 'available':
      return {
        config: {
          label: messages.bookAction,
          variant: 'primary',
          withArrow: true,
          onPress: state.onBook,
        },
        a11yLabel: `Reservar ${className}`,
      };
    case 'full':
      return {
        config: {
          label: messages.sessionFull,
          variant: 'disabled',
        },
        a11yLabel: `${className} sin cupos`,
      };
    case 'reserved':
      return {
        config: {
          label: messages.reservedTag,
          variant: 'reserved',
        },
        a11yLabel: `${className} ya está reservada`,
      };
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function ClassCardRoot(props: ClassCardProps) {
  const value = useMemo<ClassCardContextValue>(() => ({ ...props }), [props]);
  const backgroundColor = categoryColor(props.name);
  const asset = categoryAsset(props.name);

  const leftChildren: ReactNode[] = [];
  const rightChildren: ReactNode[] = [];
  Children.forEach(props.children, (child) => {
    if (isValidElement(child) && child.type === ClassCardActions) {
      rightChildren.push(child);
    } else {
      leftChildren.push(child);
    }
  });

  return (
    <ClassCardContext.Provider value={value}>
      <View style={[styles.card, { backgroundColor }]}>
        <PixelPattern accent={designTokens.color.pixelAccent} opacity={0.4} />
        <View style={styles.leftColumn}>{leftChildren}</View>
        <View style={styles.rightColumn}>
          {asset ? (
            <Image
              source={asset as ImageSourcePropType}
              style={styles.asset}
              resizeMode="contain"
              accessible={false}
              importantForAccessibility="no"
            />
          ) : null}
        </View>
        {rightChildren}
      </View>
    </ClassCardContext.Provider>
  );
}

function ClassCardHeader() {
  const card = useClassCard();
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <Text style={styles.time}>{formatTime(card.start)}</Text>
        <View style={styles.durationDivider} />
        <Text style={styles.duration}>{card.durationMinutes} min</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {card.name}
      </Text>
    </View>
  );
}

function ClassCardBody() {
  const card = useClassCard();
  const gender = instructorGender(card.instructor);
  return (
    <View style={styles.body}>
      <View style={styles.instructorRow}>
        <InstructorAvatar name={card.instructor} size={32} />
        <View style={styles.instructorMeta}>
          <Text style={styles.instructorName} numberOfLines={1}>
            {card.instructor}
          </Text>
          <Text style={styles.instructorEyebrow}>{instructorEyebrow(gender)}</Text>
        </View>
      </View>
      <View style={styles.seatsRow}>
        <Text style={styles.seatsGlyph}>👥</Text>
        <Text style={styles.seats}>{seatsLabel(card.available, card.capacity)}</Text>
      </View>
    </View>
  );
}

function ClassCardActions() {
  const card = useClassCard();
  const actionState = deriveActionState(card);
  const { config, a11yLabel } = buildPillProps(actionState, card.name);

  return (
    <View style={styles.actionsOverlay}>
      <PillComponent {...config} accessibilityLabel={a11yLabel} />
    </View>
  );
}

export const ClassCard = {
  Root: ClassCardRoot,
  Header: ClassCardHeader,
  Body: ClassCardBody,
  Actions: ClassCardActions,
};

const ASSET_WIDTH = 175;
const ASSET_HEIGHT = 150;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: designTokens.radius.card,
    padding: designTokens.spacing.lg,
    gap: designTokens.spacing.md,
    overflow: 'hidden',
    minHeight: 230,
  },
  leftColumn: {
    flex: 1,
    gap: designTokens.spacing.md,
    minWidth: 0,
  },
  rightColumn: {
    width: ASSET_WIDTH,
    height: ASSET_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  asset: {
    width: '100%',
    height: '100%',
  },
  actionsOverlay: {
    position: 'absolute',
    right: designTokens.spacing.lg,
    bottom: designTokens.spacing.lg,
  },
  header: {
    gap: designTokens.spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: designTokens.fontSize.display,
    fontWeight: '800',
    color: designTokens.color.textPrimary,
    letterSpacing: -0.5,
    lineHeight: designTokens.fontSize.display + 2,
  },
  durationDivider: {
    width: 1,
    height: 14,
    backgroundColor: designTokens.color.textPrimary,
    opacity: 0.4,
    marginHorizontal: designTokens.spacing.sm,
  },
  duration: {
    fontSize: designTokens.fontSize.body,
    fontWeight: '500',
    color: designTokens.color.textSecondary,
  },
  name: {
    fontSize: designTokens.fontSize.title,
    fontWeight: '700',
    color: designTokens.color.textPrimary,
    letterSpacing: -0.2,
  },
  body: {
    gap: designTokens.spacing.sm,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },
  instructorMeta: {
    flexDirection: 'column',
    flexShrink: 1,
  },
  instructorName: {
    fontSize: designTokens.fontSize.body,
    fontWeight: '600',
    color: designTokens.color.textPrimary,
  },
  instructorEyebrow: {
    fontSize: designTokens.fontSize.eyebrow,
    fontWeight: '700',
    letterSpacing: 1,
    color: designTokens.color.textSecondary,
    marginTop: 2,
  },
  seatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.xs,
  },
  seatsGlyph: {
    fontSize: designTokens.fontSize.body,
  },
  seats: {
    fontSize: designTokens.fontSize.body,
    color: designTokens.color.textPrimary,
    fontWeight: '500',
  },
});
