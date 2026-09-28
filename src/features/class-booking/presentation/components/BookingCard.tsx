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
import { Pill, type PillProps } from '@shared/ui/components/Pill';
import { instructorEyebrow } from '@features/class-booking/presentation/copy/messages';

export interface BookingCardProps {
  readonly id: string;
  readonly sessionId: string;
  readonly sessionName: string;
  readonly sessionStart: Date;
  readonly durationMinutes: number;
  readonly instructor: string;
  readonly cancellable: boolean;
  readonly onCancel: (bookingId: string) => void;
  readonly children: ReactNode;
}

type BookingCardContextValue = BookingCardProps;

const BookingCardContext = createContext<BookingCardContextValue | null>(null);

function useBookingCard(): BookingCardContextValue {
  const value = useContext(BookingCardContext);
  if (!value) {
    throw new Error('BookingCard compound parts must be rendered inside BookingCard.Root');
  }
  return value;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function buildCancelPillProps(card: BookingCardContextValue): {
  readonly config: PillProps;
  readonly a11yLabel: string;
} {
  const config: PillProps = {
    label: 'Cancelar',
    variant: 'destructive',
    disabled: !card.cancellable,
    onPress: () => card.onCancel(card.id),
  };
  const a11yLabel = card.cancellable
    ? `Cancelar reserva de ${card.sessionName}`
    : `No se puede cancelar la reserva de ${card.sessionName}`;
  return { config, a11yLabel };
}

function BookingCardRoot(props: BookingCardProps) {
  const value = useMemo<BookingCardContextValue>(() => ({ ...props }), [props]);
  const backgroundColor = categoryColor(props.sessionName);
  const asset = categoryAsset(props.sessionName);

  const leftChildren: ReactNode[] = [];
  const rightChildren: ReactNode[] = [];
  Children.forEach(props.children, (child) => {
    if (isValidElement(child) && child.type === BookingCardActions) {
      rightChildren.push(child);
    } else {
      leftChildren.push(child);
    }
  });

  return (
    <BookingCardContext.Provider value={value}>
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
    </BookingCardContext.Provider>
  );
}

function BookingCardBody() {
  const card = useBookingCard();
  const gender = instructorGender(card.instructor);
  return (
    <View style={styles.body}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.time}>{formatTime(card.sessionStart)}</Text>
          <View style={styles.durationDivider} />
          <Text style={styles.duration}>{card.durationMinutes} min</Text>
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {card.sessionName}
        </Text>
      </View>
      <View style={styles.instructorRow}>
        <InstructorAvatar name={card.instructor} size={32} />
        <View style={styles.instructorMeta}>
          <Text style={styles.instructorName} numberOfLines={1}>
            {card.instructor}
          </Text>
          <Text style={styles.instructorEyebrow}>{instructorEyebrow(gender)}</Text>
        </View>
      </View>
    </View>
  );
}

function BookingCardActions() {
  const card = useBookingCard();
  const { config, a11yLabel } = buildCancelPillProps(card);
  return (
    <View style={styles.actionsOverlay}>
      <Pill {...config} accessibilityLabel={a11yLabel} />
    </View>
  );
}

export const BookingCard = {
  Root: BookingCardRoot,
  Body: BookingCardBody,
  Actions: BookingCardActions,
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
  body: {
    gap: designTokens.spacing.sm,
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
});
