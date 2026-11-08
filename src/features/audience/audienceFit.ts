import type {
  AudienceConfidence,
  AudienceFitCheckDto,
  AudienceLevel,
  AudienceProfileDto,
  AudienceProfileUpdate,
  AudienceVerdict,
} from '@/api/types';
import type { BadgeTone } from '@/components/ui';

// Pure helpers for the audience fit screens. Only type imports here: the unit tests run them with `node --test`.

export const AUDIENCE_LEVELS: ReadonlyArray<AudienceLevel> = ['junior', 'middle', 'senior', 'lead'];

export const levelLabels: Record<AudienceLevel, string> = {
  junior: 'Junior',
  middle: 'Middle',
  senior: 'Senior',
  lead: 'Lead',
};

export const confidenceLabels: Record<AudienceConfidence, string> = {
  low: 'низкая',
  medium: 'средняя',
  high: 'высокая',
};

const verdictLabels: Record<AudienceVerdict, string> = {
  fits: 'Подходит',
  partially: 'Подходит частично',
  not_fits: 'Не подходит',
};

const verdictTones: Record<AudienceVerdict, BadgeTone> = {
  fits: 'brand',
  partially: 'warning',
  not_fits: 'danger',
};

export function verdictLabel(verdict: AudienceVerdict): string {
  return verdictLabels[verdict];
}

/** Short status of a check for a badge: verdict with score, or what is going on. */
export function checkLabel(check: AudienceFitCheckDto): string {
  switch (check.status) {
    case 'ready':
      return check.result ? `${verdictLabels[check.result.verdict]} · ${check.result.score}/100` : 'Готово';
    case 'pending':
      return 'Проверяется…';
    case 'insufficient_data':
      return 'Мало материала';
    default:
      return 'Не удалось проверить';
  }
}

export function checkTone(check: AudienceFitCheckDto): BadgeTone {
  if (check.status === 'ready' && check.result) return verdictTones[check.result.verdict];
  if (check.status === 'pending') return 'ai';
  return 'muted';
}

/** Newest first, by creation time; ISO dates compare as strings. */
export function newestFirst(checks: ReadonlyArray<AudienceFitCheckDto>): AudienceFitCheckDto[] {
  return [...checks].sort((a, b) => b.createdDate.localeCompare(a.createdDate));
}

/** The newest check per key, e.g. per event and talk. Checks without a key are skipped. */
export function latestBy(
  checks: ReadonlyArray<AudienceFitCheckDto>,
  key: (check: AudienceFitCheckDto) => string | null,
): Map<string, AudienceFitCheckDto> {
  const latest = new Map<string, AudienceFitCheckDto>();
  for (const check of newestFirst(checks)) {
    const value = key(check);
    if (value !== null && !latest.has(value)) latest.set(value, check);
  }
  return latest;
}

export const eventTalkKey = (eventId: string, talkId: string | null) => `${eventId}:${talkId ?? ''}`;

export function hasPending(checks: ReadonlyArray<AudienceFitCheckDto>): boolean {
  return checks.some((check) => check.status === 'pending');
}

/** Levels with a non-zero share, in the junior → lead order. */
export function levelShares(levels: AudienceProfileDto['levels']): { level: AudienceLevel; label: string; percent: number }[] {
  return AUDIENCE_LEVELS
    .map((level) => ({ level, label: levelLabels[level], percent: levels[level] ?? 0 }))
    .filter((share) => share.percent > 0);
}

/** Multiline input: one item per line, blanks dropped. */
export function parseLines(text: string): string[] {
  return text.split('\n').map((line) => line.trim()).filter(Boolean);
}

export function formatLines(items: ReadonlyArray<string>): string {
  return items.join('\n');
}

/** Level inputs as typed by the DevRel; empty or invalid values count as zero. */
export function parseLevels(values: Record<AudienceLevel, string>): Record<AudienceLevel, number> {
  const levels = {} as Record<AudienceLevel, number>;
  for (const level of AUDIENCE_LEVELS) {
    const value = Number(values[level].replace(',', '.'));
    levels[level] = Number.isFinite(value) && value > 0 ? value : 0;
  }
  return levels;
}

export function profileToUpdate(profile: AudienceProfileDto | null): AudienceProfileUpdate {
  const levels = {} as Record<AudienceLevel, number>;
  for (const level of AUDIENCE_LEVELS) levels[level] = profile?.levels[level] ?? 0;
  return {
    summary: profile?.summary ?? '',
    levels,
    roles: profile?.roles ?? [],
    domains: profile?.domains ?? [],
    expectations: profile?.expectations ?? [],
    assumedKnowledge: profile?.assumedKnowledge ?? [],
    turnoffs: profile?.turnoffs ?? [],
  };
}

/** Files the backend can read the text of (PDF pages, PPTX slides, DOCX, plain text). */
export function isCheckableFile(name: string): boolean {
  return /\.(pdf|pptx|docx|txt|md)$/i.test(name.trim());
}
