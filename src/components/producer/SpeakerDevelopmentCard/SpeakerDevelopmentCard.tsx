import { rolePath } from '@/app/navigation';
import { Badge, Card, LinkButton } from '@/components/ui';
import type { UserProfile } from '@/types/domain';
import { cx } from '@/utils/cx';
import shared from '../producer.module.scss';
import styles from './SpeakerDevelopmentCard.module.scss';

export interface SpeakerDevelopmentCardProps {
  profile: UserProfile;
  hasSubscription: boolean;
}

/** Who the analysis is about and where its data comes from. */
export function SpeakerDevelopmentCard({ profile, hasSubscription }: SpeakerDevelopmentCardProps) {
  const subtitle = [profile.position, profile.skills].filter(Boolean).join(' · ');

  return (
    <Card as="section" variant="ai" aria-labelledby="producer-speaker-name">
      <div className={styles.header}>
        <div className={styles.identity}>
          <p className={styles.eyebrow}>Карточка развития спикера</p>
          <h2 id="producer-speaker-name" className={styles.name}>{profile.name}</h2>
          {subtitle && <p className={shared.muted}>{subtitle}</p>}
        </div>
        <div className={styles.actions}>
          <Badge tone={hasSubscription ? 'brand' : 'ai'}>{hasSubscription ? 'Подписка активна' : 'План по подписке'}</Badge>
          <LinkButton to={rolePath('speaker', 'reviews')} variant="secondary" size="sm">К отзывам</LinkButton>
        </div>
      </div>
      <hr className={cx(shared.divider, styles.divider)} />
      <p className={shared.muted}>
        Данные ниже взяты из демонстрационного профиля, истории выступлений и публичных отзывов; расчеты выполняются
        непосредственно в браузере. Персональный план формируется только при наличии подписки.
      </p>
    </Card>
  );
}
