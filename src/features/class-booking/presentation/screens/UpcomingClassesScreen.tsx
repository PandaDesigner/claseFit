import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useComposition } from '@features/class-booking/compositionProvider';
import { useUpcomingSessions } from '@features/class-booking/presentation/hooks/useUpcomingSessions';
import { useBookingCommands } from '@features/class-booking/presentation/hooks/useBookingCommands';
import { ClassCard } from '@features/class-booking/presentation/components/ClassCard';
import { designTokens } from '@shared/ui/tokens';
import { messages } from '@features/class-booking/presentation/copy/messages';

export function UpcomingClassesScreen() {
  const composition = useComposition();
  const { sessions } = useUpcomingSessions(composition.store, composition.clock);
  const commands = useBookingCommands({
    bookClass: composition.bookClass,
    cancelBooking: composition.cancelBooking,
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleBook = useMemo(
    () => async (sessionId: string) => {
      const result = await commands.book(sessionId);
      setFeedback(result.message);
    },
    [commands],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{messages.classesTab}</Text>
      <Text style={styles.subheading}>
        Estas son las próximas clases de ClaseFit · Sede Laureles.
      </Text>
      <Text style={styles.dailyLimit}>Máximo 2 reservas por día.</Text>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ClassCard.Root
            id={item.id}
            name={item.name}
            instructor={item.instructor}
            start={item.start}
            durationMinutes={item.durationMinutes}
            capacity={item.capacity}
            occupiedByOthers={item.occupiedByOthers}
            available={item.available}
            isFull={item.isFull}
            isAlreadyReserved={item.isAlreadyReserved}
            onBook={handleBook}
            onCancel={() => undefined}
          >
            <ClassCard.Header />
            <ClassCard.Body />
            <ClassCard.Actions />
          </ClassCard.Root>
        )}
      />
      {feedback ? (
        <View accessibilityRole="alert" style={styles.feedback}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.color.background,
    paddingHorizontal: designTokens.spacing.lg,
    paddingTop: designTokens.spacing.xl,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: designTokens.color.textPrimary,
  },
  subheading: {
    marginTop: designTokens.spacing.xs,
    fontSize: 14,
    color: designTokens.color.textSecondary,
  },
  dailyLimit: {
    marginTop: designTokens.spacing.xs,
    marginBottom: designTokens.spacing.lg,
    fontSize: 12,
    color: designTokens.color.textSecondary,
  },
  list: {
    gap: designTokens.spacing.md,
    paddingBottom: designTokens.spacing.xxl,
  },
  feedback: {
    position: 'absolute',
    bottom: designTokens.spacing.xl,
    left: designTokens.spacing.lg,
    right: designTokens.spacing.lg,
    padding: designTokens.spacing.md,
    borderRadius: designTokens.radius.control,
    backgroundColor: designTokens.color.successSurface,
  },
  feedbackText: {
    color: designTokens.color.successText,
    fontSize: 14,
    fontWeight: '600',
  },
});
