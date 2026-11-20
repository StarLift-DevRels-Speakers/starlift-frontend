import { EventShowcase } from '@/components/landing/EventShowcase/EventShowcase';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase/FeatureShowcase';
import { FinalCta } from '@/components/landing/FinalCta/FinalCta';
import { LandingFooter } from '@/components/landing/LandingFooter/LandingFooter';
import { LandingHeader } from '@/components/landing/LandingHeader/LandingHeader';
import { LandingHero } from '@/components/landing/LandingHero/LandingHero';
import { PricingSection } from '@/components/landing/PricingSection/PricingSection';
import { devrel, sectionSteps, speakers } from '@/features/landing/content';
import { cx } from '@/utils/cx';
import styles from './LandingPage.module.scss';

/** Free-form decorative curves below the first screen; a few of them are dashed and drift. */
const decorativeCurves = [
  { d: 'M-60 1120 C 280 1000, 520 1240, 840 1120 S 1240 960, 1500 1160', dashed: true },
  { d: 'M1500 1460 C 1180 1360, 980 1580, 660 1480 S 220 1330, -60 1520' },
  { d: 'M-60 1900 C 320 1760, 620 2040, 980 1900 S 1320 1760, 1500 1940' },
  { d: 'M1500 2260 C 1120 2140, 900 2400, 560 2280 S 180 2140, -60 2340', dashed: true },
  { d: 'M-60 2660 C 260 2540, 520 2800, 860 2660 S 1240 2520, 1500 2720' },
  { d: 'M1500 3060 C 1140 2940, 920 3220, 580 3080 S 200 2940, -60 3140' },
  { d: 'M-60 3560 C 340 3420, 640 3700, 1000 3560 S 1340 3420, 1500 3600', dashed: true },
];

const curveMotion = [styles.curveA, styles.curveB, styles.curveC];

/** Public marketing page: explains the product by audience and leads to sign-in, registration or the demos. */
export function LandingPage() {
  return (
    <div className={styles.page}>
      {/* One decorative layer for the whole page, so the blobs never stop at a section border. */}
      <div className={styles.decor} aria-hidden="true">
        <span className={styles.blobA} />
        <span className={styles.blobB} />
        <span className={styles.blobC} />
        <span className={styles.blobD} />

        {/* Free-form curves of the same weight as the orbit ring of the first screen. */}
        <svg className={styles.curves} viewBox="0 0 1440 4200" preserveAspectRatio="none" focusable="false">
          <g className={styles.curveGroup}>
            {decorativeCurves.map((curve, index) => (
              <path
                key={curve.d}
                d={curve.d}
                className={cx(styles.curve, curve.dashed && styles.curveDashed, curveMotion[Math.floor(index / 2) % curveMotion.length])}
              />
            ))}
          </g>
        </svg>
      </div>

      <LandingHeader />

      <main className={styles.main}>
        <LandingHero />

        <FeatureShowcase id="speakers" copy={speakers} cards={speakers.cards} step={sectionSteps.speakers} />
        <EventShowcase />
        <FeatureShowcase id="devrel" copy={devrel} cards={devrel.cards} step={sectionSteps.devrel} />

        <PricingSection />
        <FinalCta />
      </main>

      <LandingFooter />
    </div>
  );
}
