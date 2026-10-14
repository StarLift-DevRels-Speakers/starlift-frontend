import { Button } from '@/components/ui';
import styles from './MonthSwitcher.module.scss';

export interface MonthSwitcherProps {
  onPrevious: () => void;
  onToday: () => void;
  onNext: () => void;
}

export function MonthSwitcher({ onPrevious, onToday, onNext }: MonthSwitcherProps) {
  return (
    <div className={styles.switcher}>
      <Button variant="secondary" size="sm" aria-label="Предыдущий месяц" onClick={onPrevious}>←</Button>
      <Button variant="soft" size="sm" onClick={onToday}>Сегодня</Button>
      <Button variant="secondary" size="sm" aria-label="Следующий месяц" onClick={onNext}>→</Button>
    </div>
  );
}
