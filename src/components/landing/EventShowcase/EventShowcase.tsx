import { rolePath } from '@/app/navigation';
import { roleOf } from '@/auth/session';
import { useAuth } from '@/auth/useAuth';
import { Badge, LinkButton } from '@/components/ui';
import { events as eventsCopy, sectionSteps } from '@/features/landing/content';
import { eventCards } from '@/features/landing/events';
import { SectionHeading } from '../SectionHeading/SectionHeading';
import styles from './EventShowcase.module.scss';

/** Upcoming events with an open CFP: the calling action is a talk submission. */
export function EventShowcase() {
  const { session } = useAuth();
  const role = session ? roleOf(session.user) : null;
  const cards = eventCards(eventsCopy.items);

  // Submitting a talk always starts with an account; the catalogue opens the role's own events page.
  const apply = '/login?mode=register';
  const catalogue = role ? rolePath(role, 'events') : '/login?next=/speaker/events';

  return (
    <section id="events" className={styles.section}>
      <div className={styles.inner}>
        <SectionHeading
          kicker={eventsCopy.kicker}
          title={eventsCopy.title}
          description={eventsCopy.description}
          step={sectionSteps.events}
          centered
        />

        <ul className={styles.grid}>
          {cards.map((card) => (
            <li key={card.name} className={styles.item}>
              <article className={styles.card}>
                <div className={styles.top}>
                  <time className={styles.date} dateTime={card.iso}>
                    <span className={styles.day}>{card.day}</span>
                    <span className={styles.month}>{card.month}</span>
                  </time>
                  <div className={styles.nameBlock}>
                    <h3 className={styles.name}>{card.name}</h3>
                    <p className={styles.meta}>{card.city} · {card.format} · {card.level}</p>
                  </div>
                  <Badge tone="warning" className={styles.badge}>CFP открыт</Badge>
                </div>

                <ul className={styles.tags}>
                  {card.tags.map((tag) => (
                    <li key={tag} className={styles.tag}>{tag}</li>
                  ))}
                </ul>

                <p className={styles.text}>{card.description}</p>

                <div className={styles.bottom}>
                  <p className={styles.deadline}>
                    Дедлайн: <strong>{card.deadline}</strong>
                  </p>
                  <LinkButton to={apply} className={styles.apply}>{eventsCopy.cta}</LinkButton>
                </div>
              </article>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <LinkButton variant="secondary" to={catalogue}>
            {eventsCopy.catalogueCta} →
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
