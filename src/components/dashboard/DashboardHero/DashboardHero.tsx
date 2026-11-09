import type { ReactNode } from 'react';
import type { Role } from '@/types/role';
import { formatLongDate, todayKey } from '@/utils/date';
import styles from './DashboardHero.module.scss';

interface DashboardHeroProps {
  role: Role;
  name: string;
  description: string;
  action: ReactNode;
}

export function DashboardHero({ role, name, description, action }: DashboardHeroProps) {
  const today = todayKey();

  return (
    <header className={styles.hero} data-role={role}>
      <div className={styles.copy}>
        <p className={styles.kicker}>{role === 'speaker' ? 'Пульт спикера' : 'Пульт DevRel'}</p>
        <h1>{name ? `Здравствуйте, ${name}!` : 'Добро пожаловать!'}</h1>
        <p>{description}</p>
      </div>
      <div className={styles.tools}>
        <time dateTime={today}>{formatLongDate(today)}</time>
        {action}
      </div>
    </header>
  );
}
