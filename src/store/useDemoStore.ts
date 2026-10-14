import { useContext } from 'react';
import { DemoActionsContext, DemoStateContext, type DemoActions } from './demoContext';
import type { DemoState } from './demoState';

export function useDemoState(): DemoState {
  const state = useContext(DemoStateContext);
  if (!state) throw new Error('useDemoState must be used inside <DemoStoreProvider>');
  return state;
}

export function useDemoActions(): DemoActions {
  const actions = useContext(DemoActionsContext);
  if (!actions) throw new Error('useDemoActions must be used inside <DemoStoreProvider>');
  return actions;
}
