import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Pill } from './Pill';
import { designTokens } from '../tokens';

export interface SuccessSheetProps {
  readonly visible: boolean;
  readonly onDismiss: () => void;
  readonly children: ReactNode;
  readonly testID?: string;
}

interface SuccessSheetContextValue {
  readonly onDismiss: () => void;
}

const Context = createContext<SuccessSheetContextValue | null>(null);

function useSheet(): SuccessSheetContextValue {
  const value = useContext(Context);
  if (!value) {
    throw new Error('SuccessSheet parts must be rendered inside SuccessSheet.Root');
  }
  return value;
}

function Root({ visible, onDismiss, children, testID }: SuccessSheetProps) {
  const value = useMemo<SuccessSheetContextValue>(() => ({ onDismiss }), [onDismiss]);
  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onDismiss}
      testID={testID}
    >
      <SuccessSheetContent onDismiss={onDismiss} testID={testID}>
        <Context.Provider value={value}>{children}</Context.Provider>
      </SuccessSheetContent>
    </Modal>
  );
}

/**
 * Inner content rendered inside the Modal. Exported separately so tests
 * can render it directly without going through the Modal host (which
 * jest-expo does not expose to the test renderer).
 */
export function SuccessSheetContent({
  onDismiss,
  testID,
  children,
}: {
  readonly onDismiss: () => void;
  readonly testID?: string;
  readonly children: ReactNode;
}) {
  const value = useMemo<SuccessSheetContextValue>(() => ({ onDismiss }), [onDismiss]);
  return (
    <Context.Provider value={value}>
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onDismiss}
          accessibilityLabel="Cerrar"
          testID={testID ? `${testID}-backdrop` : undefined}
        />
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />
          {children}
        </View>
      </View>
    </Context.Provider>
  );
}

function Title({ children }: { readonly children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

function Message({ children }: { readonly children: ReactNode }) {
  return <Text style={styles.message}>{children}</Text>;
}

function Actions({
  ctaLabel,
  onPress,
}: {
  readonly ctaLabel: string;
  readonly onPress?: () => void;
}) {
  const sheet = useSheet();
  return (
    <View style={styles.actions}>
      <Pill
        label={ctaLabel}
        variant="primary"
        onPress={onPress ?? sheet.onDismiss}
        accessibilityLabel={ctaLabel}
        style={styles.actionPill}
      />
    </View>
  );
}

export const SuccessSheet = {
  Root,
  Title,
  Message,
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
  message: {
    fontSize: designTokens.fontSize.bodyLg,
    color: designTokens.color.textSecondary,
    lineHeight: designTokens.fontSize.bodyLg + 4,
  },
  actions: {
    gap: designTokens.spacing.sm,
  },
  actionPill: {
    alignSelf: 'stretch',
  },
});
