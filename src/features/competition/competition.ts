import type { LeaderboardEntryDto, LeagueCode, LeagueZone, PointReason, SeasonDto } from '@/api/types';
import type { BadgeTone } from '@/components/ui';
import { pluralize } from '@/utils/plural';

// Labels and small helpers for the competition mode: weekly leagues, points and badges.

export const leagueTitles: Record<LeagueCode, string> = {
  BRONZE: 'Бронзовая лига',
  SILVER: 'Серебряная лига',
  GOLD: 'Золотая лига',
  PLATINUM: 'Платиновая лига',
  DIAMOND: 'Бриллиантовая лига',
};

export const leagueIcons: Record<LeagueCode, string> = {
  BRONZE: '🥉',
  SILVER: '🥈',
  GOLD: '🥇',
  PLATINUM: '💠',
  DIAMOND: '💎',
};

export const zoneLabels: Record<LeagueZone, string> = {
  PROMOTION: 'Зона повышения',
  SAFE: 'Остаётесь в лиге',
  DEMOTION: 'Зона понижения',
};

export const zoneTones: Record<LeagueZone, BadgeTone> = {
  PROMOTION: 'brand',
  SAFE: 'muted',
  DEMOTION: 'danger',
};

export const reasonLabels: Record<PointReason, string> = {
  TALK_CREATED: 'Добавлен доклад',
  TALK_DELETED: 'Доклад удален',
  FEEDBACK_RECEIVED: 'Отзыв слушателя',
  HIGH_RATING_FEEDBACK: 'Высокая оценка в отзыве',
  PROFILE_COMPLETED: 'Профиль заполнен',
  DAILY_CHECK_IN: 'Отметка дня',
  STREAK_BONUS: 'Бонус за серию дней',
  MANUAL: 'Начисление DevRel',
};

/** How points are earned; mirrors the backend defaults in app.gamification. */
export const pointRules: ReadonlyArray<{ title: string; points: string }> = [
  { title: 'Добавить выступление', points: '+50' },
  { title: 'Получить отзыв слушателя', points: '+10' },
  { title: 'Оценка в отзыве 9 или 10', points: '+15' },
  { title: 'Заполнить профиль полностью', points: '+100' },
  { title: 'Отметиться в течение дня', points: '+5' },
  { title: 'Каждые 7 дней подряд', points: '+25' },
];

export function participantName(entry: Pick<LeaderboardEntryDto, 'firstName' | 'lastName' | 'username'>): string {
  return [entry.firstName, entry.lastName].filter(Boolean).join(' ') || entry.username;
}

export function pointsLabel(points: number): string {
  return `${points} ${pluralize(Math.abs(points), ['балл', 'балла', 'баллов'])}`;
}

export function daysLabel(days: number): string {
  return `${days} ${pluralize(days, ['день', 'дня', 'дней'])}`;
}

/** Whole days left until the season closes (the week ends on Monday 00:00 Moscow time). */
export function daysLeft(season: SeasonDto, now = new Date()): number {
  const end = new Date(`${season.endsAt}+03:00`);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86_400_000));
}
