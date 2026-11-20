import { rolePath } from '@/app/navigation';
import { roleOf } from '@/auth/session';
import { useAuth } from '@/auth/useAuth';
import { WorkspaceIcon } from '@/components/layout/WorkspaceIcon/WorkspaceIcon';
import { LinkButton } from '@/components/ui';
import { demoEnabled } from '@/demo/config';
import { hero } from '@/features/landing/content';
import styles from './LandingHero.module.scss';

/** Four-pointed star of the logo mark, used as a decorative accent. */
function Star({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m12 1 3.2 7.8L23 12l-7.8 3.2L12 23l-3.2-7.8L1 12l7.8-3.2Z" />
    </svg>
  );
}

/** First screen: what the product does, the way in, and a decorative preview of the workspace. */
export function LandingHero() {
  const { session } = useAuth();
  const role = session ? roleOf(session.user) : null;

  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.badge}>
            <Star className={styles.badgeStar} />
            {hero.kicker}
          </p>

          <h1 className={styles.title}>
            <Star className={styles.starTitle} />
            {hero.titleLead}
            <br />
            <span className={styles.titleAccent}>
              {hero.titleAccentLines[0]}
              <br />
              {hero.titleAccentLines[1]}
            </span>
          </h1>

          <p className={styles.subtitle}>{hero.subtitle}</p>

          <div className={styles.actions}>
            {role ? (
              <LinkButton size="lg" to={rolePath(role)} className={styles.cta}>Открыть платформу</LinkButton>
            ) : (
              <LinkButton size="lg" to="/login?mode=register" className={styles.cta}>{hero.primaryCta}</LinkButton>
            )}
            <LinkButton variant="secondary" size="lg" to="/login" className={styles.ctaSecondary}>
              {hero.secondaryCta}
            </LinkButton>
          </div>

          {demoEnabled && (
            <p className={styles.demo}>
              <span className={styles.demoLabel}>Демо без регистрации:</span>
              {/* Full page load on purpose: the demo role comes from the address. */}
              <a className={styles.demoLink} href="/speaker">спикер</a>
              <span aria-hidden="true">·</span>
              <a className={styles.demoLink} href="/devrel">DevRel</a>
            </p>
          )}

          <ul className={styles.highlights}>
            {hero.highlights.map((item) => (
              <li key={item} className={styles.highlight}>{item}</li>
            ))}
          </ul>
        </div>

        <div className={styles.visual} aria-hidden="true">
          <div className={styles.stage}>
            <span className={styles.orbit} />

            <div className={styles.previewCard}>
              <div className={styles.previewHead}>
                <span className={styles.previewIcon}><WorkspaceIcon name="star" /></span>
                <span className={styles.previewKicker}>StarLift AI</span>
              </div>
              <p className={styles.previewTitle}>Подбор мероприятий</p>
              <div className={styles.previewRows}>
                <span className={styles.previewRow}><span className={styles.dotBrand} />Frontend Conf · CFP до пятницы</span>
                <span className={styles.previewRow}><span className={styles.dotBrand} />React Meetup · онлайн, 3 дня</span>
                <span className={styles.previewRow}><span className={styles.dotMuted} />TypeScript Day · не подходит по теме</span>
              </div>
            </div>

            <div className={styles.previewColumn}>
              <div className={styles.previewSmall}>
                <div className={styles.previewHead}>
                  <span className={styles.previewIcon}><WorkspaceIcon name="chat" /></span>
                  <span className={styles.previewKicker}>Отзывы</span>
                </div>
                <p className={styles.previewScore}>9,2<span className={styles.previewScoreMax}>/10</span></p>
                <p className={styles.previewCaption}>средняя оценка выступления</p>
              </div>

              <div className={styles.previewSmall}>
                <div className={styles.previewHead}>
                  <span className={styles.previewIcon}><WorkspaceIcon name="cup" /></span>
                  <span className={styles.previewKicker}>Лига</span>
                </div>
                <div className={styles.league}>
                  <span className={styles.leagueBar} />
                  <span className={styles.leagueBar} />
                  <span className={styles.leagueBarShort} />
                </div>
                <p className={styles.previewCaption}>место в сезоне по очкам</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
