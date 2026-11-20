import { Link } from 'react-router';
import { WorkspaceIcon } from '@/components/layout/WorkspaceIcon/WorkspaceIcon';
import { Card, Grid, IconTile } from '@/components/ui';
import { cx } from '@/utils/cx';
import { cardCta, type FeatureCard, type SectionCopy } from '@/features/landing/content';
import { SectionHeading } from '../SectionHeading/SectionHeading';
import styles from './FeatureShowcase.module.scss';

export interface FeatureShowcaseProps {
  id: string;
  copy: SectionCopy;
  cards: readonly FeatureCard[];
  /** Section number shown in the kicker. */
  step?: string;
  className?: string;
}

/** Section of capability cards for one audience: speakers or DevRel. */
export function FeatureShowcase({ id, copy, cards, step, className }: FeatureShowcaseProps) {
  return (
    <section id={id} className={cx(styles.section, className)}>
      <div className={styles.inner}>
        <SectionHeading
          kicker={copy.kicker}
          title={copy.title}
          description={copy.description}
          step={step}
          centered
        />

        <Grid columns={3} as="ul" className={styles.grid}>
          {cards.map((card) => (
            <li key={card.title} className={styles.item}>
              <Card
                as="article"
                variant={card.ai ? 'ai' : 'default'}
                className={cx(styles.card, card.ai && styles.aiCard, card.featured && styles.featured)}
              >
                <IconTile className={styles.icon}>
                  <WorkspaceIcon name={card.icon} />
                </IconTile>
                <h3 className={styles.title}>{card.title}</h3>
                <p className={styles.text}>{card.description}</p>
                <ul className={styles.bullets}>
                  {card.bullets.map((bullet) => (
                    <li key={bullet} className={styles.bullet}>{bullet}</li>
                  ))}
                </ul>
                <Link className={styles.more} to="/login?mode=register">
                  {cardCta} <span aria-hidden="true">→</span>
                </Link>
              </Card>
            </li>
          ))}
        </Grid>
      </div>
    </section>
  );
}
