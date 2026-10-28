import { useContext } from 'react';
import { AppActionsContext, AppStateContext, type AppActions } from './appContext';
import type { AppState } from './appState';

export function useAppState(): AppState {
  const state = useContext(AppStateContext);
  if (!state) throw new Error('useAppState must be used inside <AppStoreProvider>');
  return state;
}

export function useAppActions(): AppActions {
  const actions = useContext(AppActionsContext);
  if (!actions) throw new Error('useAppActions must be used inside <AppStoreProvider>');
  return actions;
}
