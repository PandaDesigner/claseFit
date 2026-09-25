import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { designTokens } from '@shared/ui/tokens';
import { PrimaryButton } from '@shared/ui/components/PrimaryButton';

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

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function BookingCardRoot(props: BookingCardProps) {
  const value = useMemo<BookingCardContextValue>(() => ({ ...props }), [props]);
  return (
    <BookingCardContext.Provider value={value}>
      <View style={styles.card}>{props.children}</View>
    </BookingCardContext.Provider>
  );
}

function BookingCardBody() {
  const card = useBookingCard();
  return (
    <View style={styles.body}>
      <Text style={styles.session}>{card.sessionName}</Text>
      <Text style={styles.meta}>
        {formatDate(card.sessionStart)} · {formatTime(card.sessionStart)} · {card.durationMinutes}{' '}
        min
      </Text>
      <Text style={styles.instructor}>{card.instructor}</Text>
    </View>
  );
}

function BookingCardActions() {
  const card = useBookingCard();
  return (
    <View style={styles.actions}>
      <PrimaryButton
        label="Cancelar"
        disabled={!card.cancellable}
        onPress={() => card.onCancel(card.id)}
      />
    </View>
  );
}

export const BookingCard = {
  Root: BookingCardRoot,
  Body: BookingCardBody,
  Actions: BookingCardActions,
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: designTokens.color.cardSurface,
    borderRadius: designTokens.radius.card,
    padding: designTokens.spacing.lg,
    gap: designTokens.spacing.md,
  },
  body: {
    gap: designTokens.spacing.xs,
  },
  session: {
    fontSize: 20,
    fontWeight: '700',
    color: designTokens.color.textPrimary,
  },
  meta: {
    fontSize: 14,
    color: designTokens.color.textSecondary,
  },
  instructor: {
    fontSize: 14,
    color: designTokens.color.textPrimary,
  },
  actions: {
    alignItems: 'flex-end',
  },
});
