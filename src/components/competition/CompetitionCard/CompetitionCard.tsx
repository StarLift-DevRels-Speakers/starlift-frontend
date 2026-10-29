import { useEffect, useState } from 'react';
import { api } from '@/api/endpoints';
import type { GamificationProfileDto } from '@/api/types';
import { rolePath } from '@/app/navigation';
import { Badge, Card, LinkButton } from '@/components/ui';
import { daysLabel, leagueIcons, leagueTitles, pointsLabel, zoneLabels, zoneTones } from '@/features/competition/competition';
import styles from './CompetitionCard.module.scss';

/** Dashboard summary of the competition mode; hidden when the rating is unavailable. */
export function CompetitionCard() {
  const [profile, setProfile] = useState<GamificationProfileDto>();

  useEffect(() => {
    let cancelled = false;
    api.competitionProfile()
      .then((data) => !cancelled && setProfile(data))
      .catch(() => {
        // The dashboard stays usable without the competition block.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!profile) return null;

  return (
    <Card
      as="section"
      title="Соревнование"
      actions={<Badge tone={zoneTones[profile.zone]}>{zoneLabels[profile.zone]}</Badge>}
    >
      <p className={styles.league}>
        <span aria-hidden="true">{leagueIcons[profile.league]}</span> {leagueTitles[profile.league]} · {profile.weeklyRank} место из {profile.leagueSize}
      </p>
      <p className={styles.meta}>
        За неделю {pointsLabel(profile.weeklyPoints)} · серия {daysLabel(profile.currentStreak)}
      </p>
      <LinkButton to={rolePath('speaker', 'competition')} variant="secondary" size="sm">Открыть рейтинг</LinkButton>
    </Card>
  );
}
