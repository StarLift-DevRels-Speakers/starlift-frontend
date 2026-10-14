import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cx } from '@/utils/cx';
import { ToastContext } from './toastContext';
import styles from './Toast.module.scss';

const TOAST_DURATION_MS = 2800;

/** Provides `useToast()`. The live region is always mounted so screen readers announce every message. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const api = useMemo(
    () => ({
      toast: (next: string) => {
        window.clearTimeout(timerRef.current);
        setMessage(next);
        timerRef.current = window.setTimeout(() => setMessage(null), TOAST_DURATION_MS);
      },
    }),
    [],
  );

  return (
    <ToastContext value={api}>
      {children}
      <div role="status" aria-live="polite" className={cx(styles.toast, message !== null && styles.visible)}>
        {message}
      </div>
    </ToastContext>
  );
}
