import { useCallback, useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, View, type SectionListData } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useComposition } from '@features/class-booking/compositionProvider';
import { useUpcomingSessions } from '@features/class-booking/presentation/hooks/useUpcomingSessions';
import { useBookingCommands } from '@features/class-booking/presentation/hooks/useBookingCommands';
import { ClassCard } from '@features/class-booking/presentation/components/ClassCard';
import { BookingGateSheet, type SessionPreview } from '@shared/ui/components/BookingGateSheet';
import { SuccessCheckmark } from '@shared/ui/components/SuccessCheckmark';
import { BrandHeader } from '@shared/ui/components/BrandHeader';
import { FadeInOnView } from '@shared/ui/components/FadeInOnView';
import { designTokens } from '@shared/ui/tokens';
import { categoryColor } from '@shared/ui/categoryAssets';
import { dayLabel, messages } from '@features/class-booking/presentation/copy/messages';
import type { UpcomingSessionView } from '@features/class-booking/application/queries/ListUpcomingSessions';

interface DaySection {
  readonly title: string;
  readonly data: readonly UpcomingSessionView[];
}

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
    0 | 1 | 2 | 3 | 4 | 5 | 6;
}

function groupSessionsByDay(
  sessions: readonly UpcomingSessionView[],
  now: Date,
): readonly DaySection[] {
  const buckets = new Map<number, UpcomingSessionView[]>();
  for (const session of sessions) {
    const offset = computeDiaOffset(now, session.start);
    const bucket = buckets.get(offset) ?? [];
    bucket.push(session);
    buckets.set(offset, bucket);
  }
  const sortedOffsets = Array.from(buckets.keys()).sort((a, b) => a - b);
  return sortedOffsets.map((offset) => {
    const data = (buckets.get(offset) ?? []).sort((a, b) => a.start.getTime() - b.start.getTime());
    const representative = data[0];
    const title = representative ? dayLabel(offset, representative.start) : dayLabel(offset, now);
    return { title, data };
  });
}

export function UpcomingClassesScreen() {
  const composition = useComposition();
  const insets = useSafeAreaInsets();
  const { sessions } = useUpcomingSessions(composition.store, composition.clock);
  const commands = useBookingCommands({
    bookClass: composition.bookClass,
    cancelBooking: composition.cancelBooking,
  });

  // Two mutually-exclusive state slots:
  // - pendingSessionId drives the gate.
  // - confirmedSessionId drives the checkmark.
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [confirmedSessionId, setConfirmedSessionId] = useState<string | null>(null);

  const handleBook = useCallback((sessionId: string) => {
    setPendingSessionId(sessionId);
  }, []);

  const pendingSession = useMemo(
    () => (pendingSessionId ? (sessions.find((s) => s.id === pendingSessionId) ?? null) : null),
    [sessions, pendingSessionId],
  );

  const sessionPreview = useMemo<SessionPreview | null>(() => {
    if (!pendingSession) return null;
    const offset = computeDiaOffset(composition.clock.now(), pendingSession.start);
    return {
      name: pendingSession.name,
      categoryColor: categoryColor(pendingSession.name),
      dateLabel: dayLabel(offset, pendingSession.start),
      timeLabel: formatTime(pendingSession.start),
      durationMinutes: pendingSession.durationMinutes,
      instructor: pendingSession.instructor,
    };
  }, [pendingSession, composition.clock]);

  const confirmBook = useCallback(async () => {
    const id = pendingSessionId;
    setPendingSessionId(null);
    if (!id) return;
    const result = await commands.book(id);
    if (result.status === 'success') {
      setConfirmedSessionId(id);
    }
    // On rejection (RN-01/RN-02/RN-03) no overlay is shown — the gate only opens for eligible
    // bookings, and surfacing the rejection copy is a follow-up concern outside this change.
  }, [commands, pendingSessionId]);

  const cancelGate = useCallback(() => {
    setPendingSessionId(null);
  }, []);

  const dismissCheck = useCallback(() => {
    setConfirmedSessionId(null);
  }, []);

  const sections = useMemo<readonly SectionListData<UpcomingSessionView, DaySection>[]>(
    () => groupSessionsByDay(sessions, composition.clock.now()),
    [sessions, composition.clock],
  );

  return (
    <View style={styles.container}>
      <BrandHeader />
      <View style={styles.heroBlock}>
        <Text style={styles.greeting}>{messages.greeting}</Text>
        <Text style={styles.title}>{messages.upcomingTitle}</Text>
        <Text style={styles.dailyLimit}>{messages.dailyLimitHint}</Text>
      </View>
      <SectionList
        sections={sections}
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
        SectionSeparatorComponent={() => <View style={styles.sectionGap} />}
        ItemSeparatorComponent={() => <View style={styles.itemGap} />}
        renderSectionHeader={({ section }) => (
          <FadeInOnView style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
          </FadeInOnView>
        )}
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
          >
            <ClassCard.Header />
            <ClassCard.Body />
            <ClassCard.Actions />
          </ClassCard.Root>
        )}
      />
      {pendingSession ? (
        <BookingGateSheet.Root
          visible
          onCancel={cancelGate}
          onConfirm={confirmBook}
          sessionPreview={sessionPreview}
          testID="booking-gate"
        >
          <BookingGateSheet.Title />
          <BookingGateSheet.Description />
          <BookingGateSheet.Actions />
        </BookingGateSheet.Root>
      ) : null}
      {confirmedSessionId ? (
        <SuccessCheckmark
          visible
          onDismiss={dismissCheck}
          label={messages.success}
          testID="booking-success-checkmark"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.color.background,
  },
  heroBlock: {
    paddingHorizontal: designTokens.spacing.lg,
    paddingTop: designTokens.spacing.md,
    paddingBottom: designTokens.spacing.lg,
  },
  greeting: {
    fontSize: designTokens.fontSize.body,
    color: designTokens.color.textSecondary,
    marginBottom: designTokens.spacing.xs,
  },
  title: {
    fontSize: designTokens.fontSize.hero,
    fontWeight: '800',
    color: designTokens.color.textPrimary,
    letterSpacing: -0.8,
    lineHeight: designTokens.fontSize.hero + 4,
  },
  dailyLimit: {
    marginTop: designTokens.spacing.sm,
    fontSize: designTokens.fontSize.body,
    color: designTokens.color.textSecondary,
  },
  list: {
    paddingHorizontal: designTokens.spacing.lg,
  },
  sectionGap: {
    height: designTokens.spacing.lg,
  },
  itemGap: {
    height: designTokens.spacing.md,
  },
  sectionHeader: {
    marginBottom: designTokens.spacing.md,
  },
  sectionHeaderText: {
    fontSize: designTokens.fontSize.title,
    fontWeight: '700',
    color: designTokens.color.textPrimary,
  },
});
