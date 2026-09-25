import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useComposition } from '@features/class-booking/compositionProvider';
import { useMyBookings } from '@features/class-booking/presentation/hooks/useMyBookings';
import { useBookingCommands } from '@features/class-booking/presentation/hooks/useBookingCommands';
import { BookingCard } from '@features/class-booking/presentation/components/BookingCard';
import { CancellationSheet } from '@features/class-booking/presentation/components/CancellationSheet';
import { PrimaryButton } from '@shared/ui/components/PrimaryButton';
import { designTokens } from '@shared/ui/tokens';
import { messages } from '@features/class-booking/presentation/copy/messages';

export function MyBookingsScreen() {
  const composition = useComposition();
  const { bookings } = useMyBookings(composition.store, composition.clock);
  const commands = useBookingCommands({
    bookClass: composition.bookClass,
    cancelBooking: composition.cancelBooking,
  });
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleCancel = (bookingId: string) => {
    setSelectedBookingId(bookingId);
  };

  const confirmCancel = useCallback(async () => {
    if (!selectedBookingId) return;
    const result = await commands.cancel(selectedBookingId);
    setFeedback(result.message);
    setSelectedBookingId(null);
  }, [commands, selectedBookingId]);

  const keepBooking = useCallback(() => setSelectedBookingId(null), []);

  if (bookings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{messages.emptyBookings}</Text>
        <Text style={styles.emptyHint}>Vuelve a Clases para reservar.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{messages.myBookingsTab}</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <BookingCard.Root
            id={item.id}
            sessionId={item.sessionId}
            sessionName={item.sessionName}
            sessionStart={item.sessionStart}
            durationMinutes={item.durationMinutes}
            instructor={item.instructor}
            cancellable
            onCancel={handleCancel}
          >
            <BookingCard.Body />
            <BookingCard.Actions />
          </BookingCard.Root>
        )}
      />
      <CancellationSheet.Root
        visible={Boolean(selectedBookingId)}
        onKeep={keepBooking}
        onConfirm={confirmCancel}
      >
        <CancellationSheet.Title />
        <CancellationSheet.Description />
        <CancellationSheet.Actions />
      </CancellationSheet.Root>
      {feedback ? (
        <View accessibilityRole="alert" style={styles.feedback}>
          <Text style={styles.feedbackText}>{feedback}</Text>
          <PrimaryButton label="Cerrar" onPress={() => setFeedback(null)} />
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
  list: {
    gap: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: designTokens.color.background,
    paddingHorizontal: designTokens.spacing.lg,
    paddingTop: designTokens.spacing.xxl,
    alignItems: 'center',
    gap: designTokens.spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: designTokens.color.textPrimary,
  },
  emptyHint: {
    fontSize: 14,
    color: designTokens.color.textSecondary,
    textAlign: 'center',
  },
  feedback: {
    position: 'absolute',
    bottom: designTokens.spacing.xl,
    left: designTokens.spacing.lg,
    right: designTokens.spacing.lg,
    padding: designTokens.spacing.md,
    borderRadius: designTokens.radius.control,
    backgroundColor: designTokens.color.successSurface,
    gap: designTokens.spacing.sm,
  },
  feedbackText: {
    color: designTokens.color.successText,
    fontSize: 14,
    fontWeight: '600',
  },
});
