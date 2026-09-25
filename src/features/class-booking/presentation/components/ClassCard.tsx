import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { designTokens } from '@shared/ui/tokens';
import { categoryColor } from '@shared/ui/categoryColor';
import { PrimaryButton } from '@shared/ui/components/PrimaryButton';
import { messages } from '@features/class-booking/presentation/copy/messages';

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
  readonly onCancel: (sessionId: string) => void;
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

function ClassCardRoot(props: ClassCardProps) {
  const value = useMemo<ClassCardContextValue>(() => ({ ...props }), [props]);
  return (
    <ClassCardContext.Provider value={value}>
      <View style={[styles.card, { backgroundColor: categoryColor(props.name) }]}>
        {props.children}
      </View>
    </ClassCardContext.Provider>
  );
}

function ClassCardHeader() {
  const card = useClassCard();
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.time}>{formatTime(card.start)}</Text>
        <Text style={styles.date}>{formatDate(card.start)}</Text>
      </View>
      <Text style={styles.duration}>{card.durationMinutes} min</Text>
    </View>
  );
}

function ClassCardBody() {
  const card = useClassCard();
  return (
    <View style={styles.body}>
      <Text style={styles.name}>{card.name}</Text>
      <Text style={styles.instructor}>{card.instructor}</Text>
      <Text style={styles.seats}>
        {card.available} de {card.capacity} cupos
      </Text>
    </View>
  );
}

function ClassCardActions() {
  const card = useClassCard();
  if (card.isAlreadyReserved) {
    return (
      <View style={styles.actions}>
        <Text style={styles.reservedTag}>Reservada</Text>
        <PrimaryButton label="Cancelar" onPress={() => card.onCancel(card.id)} />
      </View>
    );
  }
  if (card.isFull) {
    return (
      <View style={styles.actions}>
        <Text style={styles.fullTag}>{messages.sessionFull}</Text>
      </View>
    );
  }
  return (
    <View style={styles.actions}>
      <PrimaryButton label="Reservar" onPress={() => card.onBook(card.id)} />
    </View>
  );
}

export const ClassCard = {
  Root: ClassCardRoot,
  Header: ClassCardHeader,
  Body: ClassCardBody,
  Actions: ClassCardActions,
};

const styles = StyleSheet.create({
  card: {
    borderRadius: designTokens.radius.card,
    padding: designTokens.spacing.lg,
    gap: designTokens.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  time: {
    fontSize: 24,
    fontWeight: '700',
    color: designTokens.color.textPrimary,
  },
  date: {
    fontSize: 14,
    color: designTokens.color.textSecondary,
  },
  duration: {
    fontSize: 14,
    color: designTokens.color.textSecondary,
  },
  body: {
    gap: designTokens.spacing.xs,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: designTokens.color.textPrimary,
  },
  instructor: {
    fontSize: 16,
    color: designTokens.color.textPrimary,
  },
  seats: {
    fontSize: 14,
    color: designTokens.color.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: designTokens.spacing.md,
  },
  reservedTag: {
    fontSize: 14,
    fontWeight: '600',
    color: designTokens.color.successText,
  },
  fullTag: {
    fontSize: 14,
    fontWeight: '600',
    color: designTokens.color.destructiveText,
  },
});
