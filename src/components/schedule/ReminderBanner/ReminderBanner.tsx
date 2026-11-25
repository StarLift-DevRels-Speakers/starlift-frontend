import { useState } from 'react';
import { rolePath } from '@/app/navigation';
import { CalendarActions } from '@/components/schedule/CalendarActions/CalendarActions';
import { LinkButton } from '@/components/ui';
import { activeReminders, copyFor, countdownLabel, dismissKey, loadDismissed, saveDismissed } from '@/features/schedule/reminders';
import { useAppState } from '@/store/useAppStore';
import type { ScheduledTalk } from '@/types/domain';
import type { Role } from '@/types/role';
import { cx } from '@/utils/cx';
import { formatLongDate } from '@/utils/date';
import { pluralize } from '@/utils/plural';
import styles from './ReminderBanner.module.scss';

const dayForms = ['день', 'дня', 'дней'] as const;

function whenLabel(talk: ScheduledTalk): string {
  if (talk.daysLeft === 0) return 'сегодня';
  if (talk.daysLeft === 1) return 'завтра';
  return `через ${talk.daysLeft} ${pluralize(talk.daysLeft, dayForms)}`;
}

const nextStep: Record<Role, { slug: string; label: string }> = {
  speaker: { slug: 'applications', label: 'Мои заявки →' },
  devrel: { slug: 'events', label: 'Мои мероприятия →' },
};

/**
 * Large reminder at the top of every page: a week, 3 days, a day before and on the day of the speaker's confirmed
 * speech or the DevRel's own event. Hiding lasts until the next stage, so it comes back closer to the event.
 */
export function ReminderBanner({ role }: { role: Role }) {
  const { schedule, profile } = useAppState();
  const [dismissed, setDismissed] = useState(() => loadDismissed(profile.id));
  const reminders = activeReminders(schedule, dismissed);
  const [talk, ...others] = reminders;
  if (!talk?.reminder) return null;

  const copy = copyFor({ ...talk, reminder: talk.reminder });
  const hosting = talk.kind === 'hosting';
  const hide = () => {
    const next = new Set(dismissed).add(dismissKey(talk));
    setDismissed(next);
    saveDismissed(profile.id, next, schedule);
  };

  return (
    <section className={cx(styles.banner, styles[talk.reminder])} aria-labelledby="reminder-banner-title">
      <div className={styles.countdown} aria-hidden="true">
        <span className={styles.number}>{countdownLabel(talk)}</span>
        <span className={styles.unit}>{talk.daysLeft > 0 ? pluralize(talk.daysLeft, dayForms) : 'день X'}</span>
      </div>

      <div className={styles.body}>
        <p className={styles.kicker}>🔔 {copy.kicker}</p>
        <h2 id="reminder-banner-title" className={styles.title}>{copy.title(talk.eventName)}</h2>
        <p className={styles.meta}>
          {formatLongDate(talk.date)}
          {talk.city && ` · ${talk.city}`} · {talk.format}
          {!hosting && talk.ownerName && ` · DevRel: ${talk.ownerName}`}
        </p>
        <p className={styles.topic}>{hosting ? `Тематика: ${talk.topic}` : `Доклад: «${talk.topic}»`}</p>
        <p className={styles.hint}>{copy.hint}</p>

        <div className={styles.actions}>
          <CalendarActions talk={talk} size="md" variant={talk.reminder === 'today' ? 'secondary' : 'primary'} className={styles.calendar} />
          <LinkButton to={rolePath(role, nextStep[role].slug)} size="md" variant="text" className={styles.link}>
            {nextStep[role].label}
          </LinkButton>
        </div>

        {others.length > 0 && (
          <p className={styles.others}>
            Ещё на этой неделе:{' '}
            {others.map((item, index) => (
              <span key={item.eventId}>
                {index > 0 && ', '}«{item.eventName}» {whenLabel(item)}
              </span>
            ))}
          </p>
        )}
      </div>

      <button type="button" className={styles.close} onClick={hide} aria-label="Скрыть напоминание до следующего этапа">
        ×
      </button>
    </section>
  );
}
