import { LinkButton } from '@/components/ui';
import { demoEnabled } from '@/demo/config';
import { finalCta, hero } from '@/features/landing/content';
import styles from './FinalCta.module.scss';

/** Last screen: a dark masthead panel with the same way into the product as the hero. */
export function FinalCta() {
  return (
    <section id="cta" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.panel}>
          <span className={styles.glow} aria-hidden="true" />
          <span className={styles.star} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 1 3.2 7.8L23 12l-7.8 3.2L12 23l-3.2-7.8L1 12l7.8-3.2Z" />
            </svg>
          </span>

          <p className={styles.kicker}>Начните сегодня</p>
          <h2 className={styles.title}>{finalCta.title}</h2>
          <p className={styles.description}>{finalCta.description}</p>

          <div className={styles.actions}>
            <LinkButton size="lg" to="/login?mode=register" className={styles.cta}>
              {hero.primaryCta}
            </LinkButton>
            <LinkButton size="lg" to="/login" className={styles.ctaSecondary}>
              {hero.secondaryCta}
            </LinkButton>
          </div>

          {demoEnabled && (
            <p className={styles.demo}>
              <span className={styles.demoLabel}>Или посмотрите демо:</span>
              {/* Full page load: the demo role is read from the address on startup. */}
              <a className={styles.demoLink} href="/speaker">спикер</a>
              <span aria-hidden="true">·</span>
              <a className={styles.demoLink} href="/devrel">DevRel</a>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
