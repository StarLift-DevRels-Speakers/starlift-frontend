import { Badge, Card, Grid, LinkButton } from '@/components/ui';
import { cx } from '@/utils/cx';
import { pricing, sectionSteps } from '@/features/landing/content';
import { tariffNote, tariffPlans } from '@/features/landing/tariffs';
import { roleLabels } from '@/types/role';
import { SectionHeading } from '../SectionHeading/SectionHeading';
import styles from './PricingSection.module.scss';

/** Three plans: the free level shared by both roles and the two subscriptions; prices come from the platform. */
export function PricingSection() {
  const plans = tariffPlans();

  return (
    <section id="pricing" className={styles.section}>
      <div className={styles.inner}>
        <SectionHeading
          kicker={pricing.kicker}
          title={pricing.title}
          description={pricing.description}
          step={sectionSteps.pricing}
          centered
        />

        <div className={styles.plans}>
          <Grid columns={3} as="ul" className={styles.grid}>
            {plans.map((plan) => (
              <li key={plan.id} className={styles.item}>
                <Card as="article" className={cx(styles.card, plan.popular && styles.popular)}>
                  <div className={styles.badges}>
                    <Badge tone={plan.role ? 'brand' : 'muted'}>{plan.role ? roleLabels[plan.role] : 'Обе роли'}</Badge>
                  </div>

                  <h3 className={styles.title}>{plan.title}</h3>
                  <p className={styles.price}>
                    {plan.priceLabel}
                    <span className={styles.period}> {plan.period}</span>
                  </p>
                  <p className={styles.description}>{plan.description}</p>

                  <ul className={styles.features}>
                    {plan.features.map((feature) => (
                      <li key={feature} className={styles.feature}>{feature}</li>
                    ))}
                  </ul>

                  {plan.rights.length > 0 && (
                    <div className={styles.rightsBlock}>
                      <p className={styles.rightsTitle}>Разово, без подписки</p>
                      <ul className={styles.rights}>
                        {plan.rights.map((right) => (
                          <li key={right.label} className={styles.right}>
                            <span>{right.label}</span>
                            <span className={styles.rightPrice}>{right.priceLabel}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <LinkButton
                    to="/login?mode=register"
                    variant={plan.popular ? 'primary' : 'secondary'}
                    fullWidth
                    className={styles.cta}
                  >
                    {plan.cta}
                  </LinkButton>
                </Card>
              </li>
            ))}
          </Grid>
        </div>

        <p className={styles.note}>{tariffNote}</p>
      </div>
    </section>
  );
}
