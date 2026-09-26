import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { designTokens } from '@shared/ui/tokens';
import { Pill } from '@shared/ui/components/Pill';
import { PixelPattern } from '@shared/ui/components/PixelPattern';
import { messages } from '../copy/messages';

export interface SessionPreview {
  readonly name: string;
  readonly categoryColor: string;
  readonly dateLabel: string;
  readonly timeLabel: string;
  readonly durationMinutes: number;
  readonly instructor: string;
}

export interface CancellationSheetProps {
  readonly visible: boolean;
  readonly onKeep: () => void;
  readonly onConfirm: () => void;
  readonly sessionPreview?: SessionPreview | null;
  readonly children: ReactNode;
}

type CancellationSheetContextValue = CancellationSheetProps;

const Context = createContext<CancellationSheetContextValue | null>(null);

function useSheet(): CancellationSheetContextValue {
  const value = useContext(Context);
  if (!value) {
    throw new Error('CancellationSheet parts must be rendered inside CancellationSheet.Root');
  }
  return value;
}

function Root(props: CancellationSheetProps) {
  const value = useMemo<CancellationSheetContextValue>(() => ({ ...props }), [props]);
  if (!props.visible) {
    return null;
  }
  return (
    <Context.Provider value={value}>
      <View style={styles.overlay} accessibilityViewIsModal>
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />
          {props.children}
          {props.sessionPreview ? (
            <SessionPreviewCard preview={props.sessionPreview} />
          ) : null}
        </View>
      </View>
    </Context.Provider>
  );
}

function Title() {
  return <Text style={styles.title}>{messages.cancelPrompt}</Text>;
}

function Description() {
  return <Text style={styles.description}>{messages.cancelDescription}</Text>;
}

function Actions() {
  const sheet = useSheet();
  return (
    <View style={styles.actions}>
      <Pill
        label={messages.keepBooking}
        variant="primary"
        onPress={sheet.onKeep}
        accessibilityLabel="Mantener tu reserva actual"
        style={styles.actionPill}
      />
      <Pill
        label={messages.confirmCancel}
        variant="destructive"
        onPress={sheet.onConfirm}
        accessibilityLabel="Confirmar cancelación"
        style={styles.actionPill}
      />
    </View>
  );
}

function SessionPreviewCard({ preview }: { preview: SessionPreview }) {
  return (
    <View
      style={[styles.previewCard, { backgroundColor: preview.categoryColor }]}
      accessibilityRole="summary"
    >
      <PixelPattern accent={designTokens.color.pixelAccent} opacity={0.35} />
      <View style={styles.previewContent}>
        <Text style={styles.previewName} numberOfLines={1}>
          {preview.name}
        </Text>
        <Text style={styles.previewMeta}>
          {preview.dateLabel} · {preview.timeLabel} · {preview.durationMinutes} min
        </Text>
        <Text style={styles.previewInstructor} numberOfLines={1}>
          {preview.instructor}
        </Text>
      </View>
    </View>
  );
}

export const CancellationSheet = {
  Root,
  Title,
  Description,
  Actions,
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: designTokens.color.cardSurface,
    borderTopLeftRadius: designTokens.radius.card,
    borderTopRightRadius: designTokens.radius.card,
    paddingHorizontal: designTokens.spacing.lg,
    paddingTop: designTokens.spacing.md,
    paddingBottom: designTokens.spacing.xl,
    gap: designTokens.spacing.lg,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: designTokens.color.textTertiary,
    alignSelf: 'center',
    marginBottom: designTokens.spacing.sm,
    opacity: 0.5,
  },
  title: {
    fontSize: designTokens.fontSize.display,
    fontWeight: '800',
    color: designTokens.color.textPrimary,
    letterSpacing: -0.6,
    lineHeight: designTokens.fontSize.display + 2,
  },
  description: {
    fontSize: designTokens.fontSize.bodyLg,
    color: designTokens.color.textSecondary,
    lineHeight: designTokens.fontSize.bodyLg + 4,
  },
  previewCard: {
    borderRadius: designTokens.radius.card,
    padding: designTokens.spacing.lg,
    overflow: 'hidden',
    minHeight: 96,
    justifyContent: 'center',
  },
  previewContent: {
    gap: designTokens.spacing.xs,
  },
  previewName: {
    fontSize: designTokens.fontSize.title,
    fontWeight: '700',
    color: designTokens.color.textPrimary,
    letterSpacing: -0.2,
  },
  previewMeta: {
    fontSize: designTokens.fontSize.body,
    fontWeight: '600',
    color: designTokens.color.textPrimary,
  },
  previewInstructor: {
    fontSize: designTokens.fontSize.body,
    color: designTokens.color.textSecondary,
  },
  actions: {
    gap: designTokens.spacing.sm,
  },
  actionPill: {
    alignSelf: 'stretch',
  },
});