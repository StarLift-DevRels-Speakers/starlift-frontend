import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '@/api/client';
import { api } from '@/api/endpoints';
import type {
  BadgeDefinitionDto,
  GamificationProfileDto,
  GlobalLeaderboardDto,
  LeaderboardEntryDto,
  LeagueDto,
  LeagueLeaderboardDto,
  PointTransactionDto,
} from '@/api/types';
import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  FilterChips,
  Grid,
  Stack,
  Table,
  Tabs,
  useToast,
  type TableColumn,
} from '@/components/ui';
import {
  daysLabel,
  daysLeft,
  leagueIcons,
  leagueTitles,
  participantName,
  pointRules,
  pointsLabel,
  reasonLabels,
  zoneLabels,
  zoneTones,
} from '@/features/competition/competition';
import { formatLongDate } from '@/utils/date';
import { cx } from '@/utils/cx';
import styles from './CompetitionPage.module.scss';

interface CompetitionData {
  profile: GamificationProfileDto;
  league: LeagueLeaderboardDto;
  leagues: LeagueDto[];
  badges: BadgeDefinitionDto[];
  points: PointTransactionDto[];
}

type Loaded = { status: 'loading' } | { status: 'error'; error: string } | { status: 'ready'; data: CompetitionData };
type Period = 'WEEK' | 'ALL_TIME';

const periodOptions = [
  { value: 'WEEK', label: 'Эта неделя' },
  { value: 'ALL_TIME', label: 'За все время' },
] as const;

function ParticipantCell({ entry }: { entry: LeaderboardEntryDto }) {
  return (
    <span className={styles.participant}>
      <Avatar name={participantName(entry)} size="sm" decorative />
      <span>{participantName(entry)}</span>
      {entry.me && <Badge tone="ai">Вы</Badge>}
    </span>
  );
}

const leagueColumns: ReadonlyArray<TableColumn<LeaderboardEntryDto>> = [
  { key: 'rank', header: 'Место', width: '72px', render: (entry) => <strong>{entry.rank}</strong> },
  { key: 'name', header: 'Спикер', render: (entry) => <ParticipantCell entry={entry} /> },
  { key: 'points', header: 'Баллы за неделю', align: 'end', render: (entry) => entry.points },
  {
    key: 'zone',
    header: 'Итог недели',
    align: 'end',
    render: (entry) => (entry.zone ? <Badge tone={zoneTones[entry.zone]}>{zoneLabels[entry.zone]}</Badge> : '—'),
  },
];

const globalColumns: ReadonlyArray<TableColumn<LeaderboardEntryDto>> = [
  { key: 'rank', header: 'Место', width: '72px', render: (entry) => <strong>{entry.rank}</strong> },
  { key: 'name', header: 'Спикер', render: (entry) => <ParticipantCell entry={entry} /> },
  { key: 'league', header: 'Лига', render: (entry) => `${leagueIcons[entry.league]} ${leagueTitles[entry.league]}` },
  { key: 'points', header: 'Баллы', align: 'end', render: (entry) => entry.points },
];

const pointColumns: ReadonlyArray<TableColumn<PointTransactionDto>> = [
  { key: 'date', header: 'Дата', width: '180px', render: (tx) => formatLongDate(tx.createdDate) },
  { key: 'reason', header: 'За что', render: (tx) => (tx.comment ? `${reasonLabels[tx.reason]}: ${tx.comment}` : reasonLabels[tx.reason]) },
  {
    key: 'points',
    header: 'Баллы',
    align: 'end',
    render: (tx) => <span className={tx.points < 0 ? styles.negative : styles.positive}>{tx.points > 0 ? `+${tx.points}` : tx.points}</span>,
  },
];

/** Speaker's competition mode: weekly league table, global rating, daily streak, badges and points history. */
export function CompetitionPage() {
  const { toast } = useToast();
  const [loaded, setLoaded] = useState<Loaded>({ status: 'loading' });
  const [period, setPeriod] = useState<Period>('WEEK');
  const [global, setGlobal] = useState<GlobalLeaderboardDto>();
  const [globalError, setGlobalError] = useState<string>();
  const [checkingIn, setCheckingIn] = useState(false);

  const load = useCallback(async () => {
    const [profile, league, leagues, badges, points] = await Promise.all([
      api.competitionProfile(),
      api.leagueLeaderboard(),
      api.leagues(),
      api.badges(),
      api.myPoints(),
    ]);
    return { profile, league, leagues, badges, points };
  }, []);

  useEffect(() => {
    let cancelled = false;
    load()
      .then((data) => !cancelled && setLoaded({ status: 'ready', data }))
      .catch((error: unknown) => !cancelled && setLoaded({ status: 'error', error: errorMessage(error) }));
    return () => {
      cancelled = true;
    };
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    api.globalLeaderboard(period)
      .then((data) => {
        if (cancelled) return;
        setGlobal(data);
        setGlobalError(undefined);
      })
      .catch((error: unknown) => !cancelled && setGlobalError(errorMessage(error)));
    return () => {
      cancelled = true;
    };
  }, [period]);

  const checkIn = async () => {
    setCheckingIn(true);
    try {
      const result = await api.checkIn();
      toast(result.alreadyCheckedIn ? 'Сегодня вы уже отмечались' : `Отметка засчитана: +${result.awardedPoints}`);
      setLoaded({ status: 'ready', data: await load() });
    } catch (error) {
      toast(errorMessage(error));
    } finally {
      setCheckingIn(false);
    }
  };

  if (loaded.status === 'loading') return <p className={styles.muted} role="status">Загрузка рейтинга…</p>;
  if (loaded.status === 'error') return <Alert tone="danger" title="Не удалось загрузить соревнование">{loaded.error}</Alert>;

  const { profile, league, leagues, badges, points } = loaded.data;
  const earned = new Map(profile.badges.map((badge) => [badge.code, badge]));
  const left = daysLeft(profile.season);

  return (
    <>
      <PageHeader
        title="Соревнование"
        description="Недельные лиги спикеров: баллы за выступления, отзывы и регулярную активность. Лучшие поднимаются в лиге выше."
        actions={
          <Button onClick={checkIn} disabled={checkingIn || profile.checkedInToday} variant={profile.checkedInToday ? 'secondary' : 'primary'}>
            {profile.checkedInToday ? '✓ Сегодня вы отметились' : 'Отметиться сегодня'}
          </Button>
        }
      />

      <Stack>
        <Card variant="ai" as="section" aria-label="Моя лига">
          <div className={styles.hero}>
            <span className={styles.leagueIcon} aria-hidden="true">{leagueIcons[profile.league]}</span>
            <div className={styles.heroText}>
              <h2 className={styles.leagueTitle}>{leagueTitles[profile.league]}</h2>
              <p className={styles.muted}>
                {profile.weeklyRank} место из {profile.leagueSize} · до конца недели {daysLabel(left)} (до {formatLongDate(profile.season.endsAt)})
              </p>
            </div>
            <Badge tone={zoneTones[profile.zone]}>{zoneLabels[profile.zone]}</Badge>
          </div>
        </Card>

        <Grid columns={3} aria-label="Мои показатели">
          <StatCard label="Баллы за неделю" value={profile.weeklyPoints} hint="Определяют место в лиге" />
          <StatCard label="Серия дней" value={profile.currentStreak} hint={`Рекорд: ${daysLabel(profile.longestStreak)}`} />
          <StatCard label="Всего баллов" value={profile.totalPoints} hint={`Значков: ${profile.badges.length}`} />
        </Grid>

        <Tabs
          label="Разделы соревнования"
          defaultValue="league"
          items={[
            {
              value: 'league',
              label: 'Моя лига',
              content: (
                <Stack gap={3}>
                  <p className={styles.muted}>
                    По итогам недели первые {league.promotionCount} поднимаются в лиге выше
                    {league.demotionCount > 0 ? `, последние ${league.demotionCount} опускаются ниже` : ''}. Без баллов повышения нет.
                  </p>
                  <Table
                    caption={`${leagueTitles[league.league]}: таблица недели`}
                    columns={leagueColumns}
                    rows={league.entries}
                    getRowKey={(entry) => entry.speakerId}
                    empty="В лиге пока нет участников"
                  />
                </Stack>
              ),
            },
            {
              value: 'global',
              label: 'Общий рейтинг',
              content: (
                <Stack gap={3}>
                  <FilterChips label="Период:" options={periodOptions} value={period} onChange={setPeriod} />
                  {globalError && <Alert tone="danger">{globalError}</Alert>}
                  {global && (
                    <Table
                      caption="Общий рейтинг спикеров"
                      columns={globalColumns}
                      rows={global.entries}
                      getRowKey={(entry) => entry.speakerId}
                      empty="Рейтинг пока пуст"
                    />
                  )}
                </Stack>
              ),
            },
            {
              value: 'badges',
              label: `Значки · ${profile.badges.length}`,
              content: (
                <ul className={styles.badges}>
                  {badges.map((badge) => {
                    const got = earned.get(badge.code);
                    return (
                      <li key={badge.code} className={cx(styles.badge, got ? styles.badgeEarned : styles.badgeLocked)}>
                        <span className={styles.badgeIcon} aria-hidden="true">{got ? '★' : '☆'}</span>
                        <span className={styles.badgeTitle}>{badge.title}</span>
                        <span className={styles.badgeText}>{badge.description}</span>
                        <span className={styles.badgeStatus}>{got ? `Получен ${formatLongDate(got.awardedDate)}` : 'Пока не получен'}</span>
                      </li>
                    );
                  })}
                </ul>
              ),
            },
            {
              value: 'points',
              label: 'История баллов',
              content: points.length > 0 ? (
                <Table caption="История начислений баллов" columns={pointColumns} rows={points} getRowKey={(tx) => tx.id} />
              ) : (
                <EmptyState
                  variant="plain"
                  title="Баллов пока нет"
                  description="Добавьте выступление, соберите отзывы или отметьтесь сегодня, чтобы получить первые баллы."
                />
              ),
            },
          ]}
        />

        <Grid columns={2}>
          <Card title="Как заработать баллы" as="section">
            <ul className={styles.rules}>
              {pointRules.map((rule) => (
                <li key={rule.title} className={styles.rule}>
                  <span>{rule.title}</span>
                  <strong className={styles.positive}>{rule.points}</strong>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Лиги" as="section">
            <ol className={styles.rules}>
              {[...leagues].sort((a, b) => b.order - a.order).map((item) => (
                <li key={item.code} className={cx(styles.rule, item.code === profile.league && styles.current)}>
                  <span>{leagueIcons[item.code]} {leagueTitles[item.code]}</span>
                  <span className={styles.muted}>{item.participants} {item.code === profile.league ? '· вы здесь' : ''}</span>
                </li>
              ))}
            </ol>
          </Card>
        </Grid>
        <p className={styles.muted}>Итоги недели подводятся в понедельник в 00:05 по Москве. {pointsLabel(5)} за отметку начисляются один раз в день.</p>
      </Stack>
    </>
  );
}
