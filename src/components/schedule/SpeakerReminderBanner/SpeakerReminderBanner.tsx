import { useState } from 'react';
import { rolePath } from '@/app/navigation';
import { CalendarActions } from '@/components/schedule/CalendarActions/CalendarActions';
import { LinkButton } from '@/components/ui';
import { activeReminders, countdownLabel, dismissKey, loadDismissed, reminderCopy, saveDismissed } from '@/features/schedule/reminders';
import { useAppState } from '@/store/useAppStore';
import type { ScheduledTalk } from '@/types/domain';
import { cx } from '@/utils/cx';
import { formatLongDate } from '@/utils/date';
import { pluralize } from '@/utils/plural';
import styles from './SpeakerReminderBanner.module.scss';

const dayForms = ['день', 'дня', 'дней'] as const;

function whenLabel(talk: ScheduledTalk): string {
  if (talk.daysLeft === 0) return 'сегодня';
  if (talk.daysLeft === 1) return 'завтра';
  return `через ${talk.daysLeft} ${pluralize(talk.daysLeft, dayForms)}`;
}

/**
 * Large reminder at the top of every speaker page: a week, 3 days, a day before and on the day of a confirmed speech.
 * Hiding lasts until the next stage, so the speaker sees it again closer to the event.
 */
export function SpeakerReminderBanner() {
  const { schedule, profile } = useAppState();
  const [dismissed, setDismissed] = useState(() => loadDismissed(profile.id));
  const reminders = activeReminders(schedule, dismissed);
  const [talk, ...others] = reminders;
  if (!talk?.reminder) return null;

  const copy = reminderCopy[talk.reminder];
  const hide = () => {
    const next = new Set(dismissed).add(dismissKey(talk));
    setDismissed(next);
    saveDismissed(profile.id, next, schedule);
  };

  return (
    <section className={cx(styles.banner, styles[talk.reminder])} aria-labelledby="speaker-reminder-title">
      <div className={styles.countdown} aria-hidden="true">
        <span className={styles.number}>{countdownLabel(talk)}</span>
        <span className={styles.unit}>{talk.daysLeft > 0 ? pluralize(talk.daysLeft, dayForms) : 'день X'}</span>
      </div>

      <div className={styles.body}>
        <p className={styles.kicker}>🔔 {copy.kicker}</p>
        <h2 id="speaker-reminder-title" className={styles.title}>{copy.title(talk.eventName)}</h2>
        <p className={styles.meta}>
          {formatLongDate(talk.date)}
          {talk.city && ` · ${talk.city}`} · {talk.format}
          {talk.ownerName && ` · DevRel: ${talk.ownerName}`}
        </p>
        <p className={styles.topic}>Доклад: «{talk.topic}»</p>
        <p className={styles.hint}>{copy.hint}</p>

        <div className={styles.actions}>
          <CalendarActions talk={talk} size="md" variant={talk.reminder === 'today' ? 'secondary' : 'primary'} className={styles.calendar} />
          <LinkButton to={rolePath('speaker', 'applications')} size="md" variant="text" className={styles.link}>
            Мои заявки →
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
