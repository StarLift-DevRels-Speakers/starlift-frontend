import { createContext } from 'react';

export interface ToastApi {
  /** Shows a short confirmation; a new toast replaces the current one. */
  toast: (message: string) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);
