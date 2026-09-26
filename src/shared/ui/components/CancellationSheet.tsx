import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Pill } from './Pill';
import { PixelPattern } from './PixelPattern';
import { designTokens } from '../tokens';

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
  readonly testID?: string;
}

interface CancellationSheetContextValue {
  readonly onKeep: () => void;
  readonly onConfirm: () => void;
}

const Context = createContext<CancellationSheetContextValue | null>(null);

function useSheet(): CancellationSheetContextValue {
  const value = useContext(Context);
  if (!value) {
    throw new Error('CancellationSheet parts must be rendered inside CancellationSheet.Root');
  }
  return value;
}

function Root({
  visible,
  onKeep,
  onConfirm,
  sessionPreview,
  children,
  testID,
}: CancellationSheetProps) {
  const value = useMemo<CancellationSheetContextValue>(
    () => ({ onKeep, onConfirm }),
    [onKeep, onConfirm],
  );
  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onKeep}
      testID={testID}
    >
      <CancellationSheetContent
        onKeep={onKeep}
        onConfirm={onConfirm}
        sessionPreview={sessionPreview}
        testID={testID}
      >
        <Context.Provider value={value}>{children}</Context.Provider>
      </CancellationSheetContent>
    </Modal>
  );
}

export interface CancellationSheetContentProps {
  readonly onKeep: () => void;
  readonly onConfirm: () => void;
  readonly sessionPreview?: SessionPreview | null;
  readonly children: ReactNode;
  readonly testID?: string;
}

/**
 * Inner content rendered inside the Modal. Exported separately so tests
 * can render it directly without going through the Modal host (which
 * jest-expo does not expose to the test renderer).
 */
export function CancellationSheetContent({
  onKeep,
  onConfirm,
  sessionPreview,
  children,
  testID,
}: CancellationSheetContentProps) {
  const value = useMemo<CancellationSheetContextValue>(
    () => ({ onKeep, onConfirm }),
    [onKeep, onConfirm],
  );
  return (
    <Context.Provider value={value}>
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onKeep}
          accessibilityLabel="Cerrar"
          testID={testID ? `${testID}-backdrop` : undefined}
        />
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />
          {children}
          {sessionPreview ? <SessionPreviewCard preview={sessionPreview} /> : null}
        </View>
      </View>
    </Context.Provider>
  );
}

function Title() {
  return <Text style={styles.title}>{'¿Cancelar tu reserva?'}</Text>;
}

function Description() {
  return <Text style={styles.description}>{'Tu cupo quedará disponible para otra persona.'}</Text>;
}

function Actions() {
  const sheet = useSheet();
  return (
    <View style={styles.actions}>
      <Pill
        label="Mantener reserva"
        variant="primary"
        onPress={sheet.onKeep}
        accessibilityLabel="Mantener tu reserva actual"
        style={styles.actionPill as ViewStyle}
      />
      <Pill
        label="Sí, cancelar"
        variant="destructive"
        onPress={sheet.onConfirm}
        accessibilityLabel="Confirmar cancelación"
        style={styles.actionPill as ViewStyle}
      />
    </View>
  );
}

function SessionPreviewCard({ preview }: { readonly preview: SessionPreview }) {
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
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
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
    fontSize: designTokens.fontSize.hero,
    fontWeight: '800',
    color: designTokens.color.textPrimary,
    letterSpacing: -0.6,
    lineHeight: designTokens.fontSize.hero + 2,
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
    letterSpacing: -0.4,
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