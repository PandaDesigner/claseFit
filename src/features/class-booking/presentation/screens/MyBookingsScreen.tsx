import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useComposition } from '@features/class-booking/compositionProvider';
import { useMyBookings } from '@features/class-booking/presentation/hooks/useMyBookings';
import { useBookingCommands } from '@features/class-booking/presentation/hooks/useBookingCommands';
import {
  BookingCard,
} from '@features/class-booking/presentation/components/BookingCard';
import {
  CancellationSheet,
  type SessionPreview,
} from '@features/class-booking/presentation/components/CancellationSheet';
import { PrimaryButton } from '@shared/ui/components/PrimaryButton';
import { designTokens } from '@shared/ui/tokens';
import { categoryColor } from '@shared/ui/categoryAssets';
import { dayLabel, messages } from '@features/class-booking/presentation/copy/messages';

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function computeDiaOffset(now: Date, sessionStart: Date): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfSession = new Date(
    sessionStart.getFullYear(),
    sessionStart.getMonth(),
    sessionStart.getDate(),
  ).getTime();
  const diffMs = startOfSession - startOfNow;
  return Math.max(0, Math.min(6, Math.round(diffMs / (24 * 60 * 60 * 1000)))) as
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6;
}

export function MyBookingsScreen() {
  const composition = useComposition();
  const insets = useSafeAreaInsets();
  const { bookings } = useMyBookings(composition.store, composition.clock);
  const commands = useBookingCommands({
    bookClass: composition.bookClass,
    cancelBooking: composition.cancelBooking,
  });
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedBooking = useMemo(
    () => (selectedBookingId ? (bookings.find((b) => b.id === selectedBookingId) ?? null) : null),
    [bookings, selectedBookingId],
  );

  const sessionPreview = useMemo<SessionPreview | null>(() => {
    if (!selectedBooking) return null;
    const now = composition.clock.now();
    const offset = computeDiaOffset(now, selectedBooking.sessionStart);
    return {
      name: selectedBooking.sessionName,
      categoryColor: categoryColor(selectedBooking.sessionName),
      dateLabel: dayLabel(offset, selectedBooking.sessionStart),
      timeLabel: formatTime(selectedBooking.sessionStart),
      durationMinutes: selectedBooking.durationMinutes,
      instructor: selectedBooking.instructor,
    };
  }, [selectedBooking, composition.clock]);

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
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{messages.emptyBookings}</Text>
          <Text style={styles.emptyHint}>Vuelve a Clases para reservar.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>Mis reservas</Text>
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            {
              paddingBottom:
                Math.max(insets.bottom, designTokens.spacing.md) +
                designTokens.tabBarHeight +
                designTokens.spacing.lg,
            },
          ]}
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
          sessionPreview={sessionPreview}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: designTokens.color.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: designTokens.spacing.lg,
    paddingTop: designTokens.spacing.sm,
  },
  heading: {
    fontSize: designTokens.fontSize.hero,
    fontWeight: '800',
    color: designTokens.color.textPrimary,
    letterSpacing: -0.6,
    marginTop: designTokens.spacing.md,
    marginBottom: designTokens.spacing.lg,
  },
  list: {
    gap: designTokens.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: designTokens.spacing.lg,
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