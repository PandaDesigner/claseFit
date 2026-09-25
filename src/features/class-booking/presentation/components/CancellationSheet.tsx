import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { designTokens } from '@shared/ui/tokens';
import { PrimaryButton } from '@shared/ui/components/PrimaryButton';
import { messages } from '../copy/messages';

export interface CancellationSheetProps {
  readonly visible: boolean;
  readonly onKeep: () => void;
  readonly onConfirm: () => void;
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
  if (!value.visible) {
    return null;
  }
  return (
    <Context.Provider value={value}>
      <View style={styles.overlay} accessibilityViewIsModal>
        <View style={styles.sheet}>{value.children}</View>
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
      <PrimaryButton label={messages.keepBooking} onPress={sheet.onKeep} />
      <Pressable accessibilityRole="button" onPress={sheet.onConfirm} style={styles.destructive}>
        <Text style={styles.destructiveLabel}>{messages.confirmCancel}</Text>
      </Pressable>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: designTokens.color.cardSurface,
    borderTopLeftRadius: designTokens.radius.card,
    borderTopRightRadius: designTokens.radius.card,
    padding: designTokens.spacing.xl,
    gap: designTokens.spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: designTokens.color.textPrimary,
  },
  description: {
    fontSize: 16,
    color: designTokens.color.textSecondary,
  },
  actions: {
    gap: designTokens.spacing.md,
  },
  destructive: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: designTokens.spacing.xl,
    paddingVertical: designTokens.spacing.md,
  },
  destructiveLabel: {
    color: designTokens.color.destructiveText,
    fontSize: 16,
    fontWeight: '600',
  },
});
