import { useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, View, type SectionListData } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useComposition } from '@features/class-booking/compositionProvider';
import { useUpcomingSessions } from '@features/class-booking/presentation/hooks/useUpcomingSessions';
import { useBookingCommands } from '@features/class-booking/presentation/hooks/useBookingCommands';
import { ClassCard } from '@features/class-booking/presentation/components/ClassCard';
import { BrandHeader } from '@shared/ui/components/BrandHeader';
import { designTokens } from '@shared/ui/tokens';
import { dayLabel, messages } from '@features/class-booking/presentation/copy/messages';
import type { UpcomingSessionView } from '@features/class-booking/application/queries/ListUpcomingSessions';

interface DaySection {
  readonly title: string;
  readonly data: readonly UpcomingSessionView[];
}

function computeDiaOffset(now: Date, sessionStart: Date): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfSession = new Date(
    sessionStart.getFullYear(),
    sessionStart.getMonth(),
    sessionStart.getDate(),
  ).getTime();
  const diffMs = startOfSession - startOfNow;
  return Math.max(0, Math.min(6, Math.round(diffMs / (24 * 60 * 60 * 1000)))) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
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
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleBook = useMemo(
    () => async (sessionId: string) => {
      const result = await commands.book(sessionId);
      setFeedback(result.message);
    },
    [commands],
  );

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
          { paddingBottom: Math.max(insets.bottom, designTokens.spacing.md) + designTokens.tabBarHeight + designTokens.spacing.lg },
        ]}
        SectionSeparatorComponent={() => <View style={styles.sectionGap} />}
        ItemSeparatorComponent={() => <View style={styles.itemGap} />}
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
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
    fontSize: designTokens.fontSize.title,
    fontWeight: '700',
    color: designTokens.color.textPrimary,
    marginBottom: designTokens.spacing.md,
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