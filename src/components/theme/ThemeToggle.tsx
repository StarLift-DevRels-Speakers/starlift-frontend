import { useSyncExternalStore } from 'react';
import { getTheme, subscribeTheme, toggleTheme } from '@/features/theme/theme';
import styles from './ThemeToggle.module.scss';

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribeTheme, getTheme) === 'dark';
  const label = dark ? 'Включить светлую тему' : 'Включить тёмную тему';
  return (
    <button type="button" className={styles.toggle} onClick={toggleTheme} aria-label={label} title={label} aria-pressed={dark}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {dark ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></> : <path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z" />}
      </svg>
    </button>
  );
}
