import { createContext, useContext, type ReactNode } from 'react';
import type { Composition } from '@features/class-booking/composition';

const CompositionContext = createContext<Composition | null>(null);

export interface CompositionProviderProps {
  readonly composition: Composition;
  readonly children: ReactNode;
}

export function CompositionProvider({ composition, children }: CompositionProviderProps) {
  return <CompositionContext.Provider value={composition}>{children}</CompositionContext.Provider>;
}

export function useComposition(): Composition {
  const value = useContext(CompositionContext);
  if (!value) {
    throw new Error('useComposition must be called within a CompositionProvider');
  }
  return value;
}
