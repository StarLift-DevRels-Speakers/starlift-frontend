import { isCfpOpen } from '@/features/events/events';
import { feedbackRef } from '@/features/feedback/feedbackRef';
import type { DevelopmentPlan, Feedback, FeedbackQuestionKey, PlanStep, Speech, Talk, TechEvent } from '@/types/domain';
import { daysFromToday, parseDay } from '@/utils/date';
import { pluralize } from '@/utils/plural';

// Facts the AI producer screen shows before and next to the plan: counters and answer
// distributions are counted in the browser; the plan itself is built by the backend model.

/** Minimum number of matching answers before a pattern counts as confirmed. */
export const CONFIRMATION_THRESHOLD = 3;
const FEEDBACK_SAMPLE_LIMIT = 80;
const SPEECH_SAMPLE_LIMIT = 12;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ProducerSource {
  talks: Talk[];
  speeches: Speech[];
  events: TechEvent[];
  feedback: Feedback[];
}

export interface ProducerFacts {
  /** Reviews of the last 12 months, newest first, at most 80. */
  feedback: Feedback[];
  /** Latest speeches, newest first, at most 12. */
  speeches: Speech[];
  openCfp: TechEvent[];
  talkCount: number;
  /** Enough data for a plan: 3 reviews, a talk and a speech. */
  ready: boolean;
}

function dayTime(value: string): number {
  return (parseDay(value) ?? new Date(value)).getTime();
}

export function collectFacts({ talks, speeches, events, feedback }: ProducerSource, now = new Date()): ProducerFacts {
  const yearAgo = now.getTime() - 365 * DAY_MS;
  const recentFeedback = feedback
    .filter((item) => dayTime(item.at) >= yearAgo)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, FEEDBACK_SAMPLE_LIMIT);
  const latestSpeeches = [...speeches].sort((a, b) => b.date.localeCompare(a.date)).slice(0, SPEECH_SAMPLE_LIMIT);
  const openCfp = events.filter((event) => event.state === 'published' && isCfpOpen(event, now));

  return {
    feedback: recentFeedback,
    speeches: latestSpeeches,
    openCfp,
    talkCount: talks.length,
    ready: recentFeedback.length >= CONFIRMATION_THRESHOLD && talks.length > 0 && latestSpeeches.length > 0,
  };
}

/** Reviews where the listener picked option `choice` for question `key`. */
export function answersWith(facts: ProducerFacts, key: FeedbackQuestionKey, choice: number): Feedback[] {
  return facts.feedback.filter((item) => item.answers?.[key] === choice);
}

/** How many times each of the three options was chosen. */
export function answerCounts(facts: ProducerFacts, key: FeedbackQuestionKey): [number, number, number] {
  return [0, 1, 2].map((choice) => answersWith(facts, key, choice).length) as [number, number, number];
}

/** Past speeches of the last 90 days. */
export function recentSpeechCount(facts: ProducerFacts, now = new Date()): number {
  const from = now.getTime() - 90 * DAY_MS;
  return facts.speeches.filter((speech) => {
    const time = dayTime(speech.date);
    return time >= from && time <= now.getTime();
  }).length;
}


export function countLabel(count: number, forms: readonly [string, string, string]): string {
  return `${count} ${pluralize(count, forms)}`;
}

export const reviewForms = ['отзыв', 'отзыва', 'отзывов'] as const;
const recordForms = ['запись', 'записи', 'записей'] as const;

export interface ReadinessRule {
  ok: boolean;
  title: string;
  value: string;
}

/** What the conclusions can rely on and what stays unknown. */
export function readinessRules(facts: ProducerFacts): ReadinessRule[] {
  return [
    { ok: facts.feedback.length >= CONFIRMATION_THRESHOLD, title: 'Не менее 3 отзывов за последний год', value: `${facts.feedback.length} из ${CONFIRMATION_THRESHOLD}` },
    { ok: facts.talkCount > 0, title: 'Есть хотя бы один доклад', value: countLabel(facts.talkCount, recordForms) },
    { ok: facts.speeches.length > 0, title: 'Есть история выступлений', value: countLabel(facts.speeches.length, recordForms) },
    { ok: facts.openCfp.length > 0, title: 'Есть открытые CFP для следующего шага', value: `${facts.openCfp.length} доступно` },
    { ok: false, title: 'Расчет NPS и его динамики', value: 'Нет вопроса 0–10' },
    { ok: true, title: 'Связь каждого отзыва с выступлением', value: 'Ссылка на выступление' },
  ];
}

export interface ProducerSignal {
  key: FeedbackQuestionKey;
  choice: number;
  title: string;
  /** Growth area rather than a strength. */
  problem: boolean;
}

export const producerSignals: ProducerSignal[] = [
  { key: 'utility', choice: 0, title: 'Сильная сторона: практическая полезность материала', problem: false },
  { key: 'engagement', choice: 0, title: 'Сильная сторона: интересная подача', problem: false },
  { key: 'examples', choice: 1, title: 'Зона роста: аудитории требуется больше примеров', problem: true },
  { key: 'pace', choice: 1, title: 'Зона роста: ускоренный темп объяснения', problem: true },
];

function planSteps(facts: ProducerFacts): PlanStep[] {
  const moreExamples = answersWith(facts, 'examples', 1);
  const tooFast = answersWith(facts, 'pace', 1);
  const steps: PlanStep[] = [];

  if (moreExamples.length >= CONFIRMATION_THRESHOLD) {
    steps.push({
      phase: 'Первые 14 дней',
      title: 'Добавить в доклад один последовательный практический кейс',
      description: `${countLabel(moreExamples.length, ['слушатель хотел', 'слушателя хотели', 'слушателей хотели'])} больше примеров. Подготовить схему, исходные условия и разбор решения.`,
      due: daysFromToday(14),
      feedbackIds: moreExamples.slice(0, 3).map((item) => item.id),
    });
  }
  if (tooFast.length >= CONFIRMATION_THRESHOLD) {
    steps.push({
      phase: 'До 30-го дня',
      title: 'Переработать темп и структуру объяснений',
      description: `${countLabel(tooFast.length, ['слушатель отметил', 'слушателя отметили', 'слушателей отметили'])} слишком быстрый темп. Добавить паузы после ключевых идей и показать промежуточные шаги.`,
      due: daysFromToday(30),
      feedbackIds: tooFast.slice(0, 3).map((item) => item.id),
    });
  }
  steps.push({
    phase: 'До 60-го дня',
    title: 'Проверить результат на следующем выступлении',
    description: 'Повторно собрать отзывы и сравнить распределение ответов по темпу и примерам. Связь с конкретным выступлением пока не поддерживается формой.',
    due: daysFromToday(60),
    feedbackIds: [],
  });
  return steps;
}

/** Plan content from the current facts; id, version and date are set by the store. */
export function buildPlanContent(facts: ProducerFacts): Omit<DevelopmentPlan, 'id' | 'version' | 'at'> {
  const total = facts.feedback.length;
  const useful = answersWith(facts, 'utility', 0);
  const moreExamples = answersWith(facts, 'examples', 1);
  const tooFast = answersWith(facts, 'pace', 1);

  const strong = useful.length >= CONFIRMATION_THRESHOLD
    ? `Полезность выступлений отмечена ${useful.length} из ${total} слушателей; записи: ${useful.slice(0, 5).map((item) => feedbackRef(item.id)).join(', ')}.`
    : 'Устойчивой положительной темы пока не выявлено: требуется больше подтверждений.';

  const issues: string[] = [];
  if (moreExamples.length >= CONFIRMATION_THRESHOLD) issues.push(`больше практических примеров (${countLabel(moreExamples.length, reviewForms)})`);
  if (tooFast.length >= CONFIRMATION_THRESHOLD) issues.push(`более комфортный темп (${countLabel(tooFast.length, reviewForms)})`);

  return {
    strong,
    improve: issues.length > 0 ? `Повторяющиеся запросы: ${issues.join('; ')}.` : 'Повторяющихся критических замечаний не выявлено.',
    source:
      `Снимок на момент формирования: ${countLabel(total, reviewForms)} (не более ${FEEDBACK_SAMPLE_LIMIT} за год), ` +
      `${countLabel(facts.talkCount, ['доклад', 'доклада', 'докладов'])}, ` +
      `${countLabel(facts.speeches.length, ['последнее выступление', 'последних выступления', 'последних выступлений'])} (не более ${SPEECH_SAMPLE_LIMIT}), ` +
      `${countLabel(facts.openCfp.length, ['открытый CFP', 'открытых CFP', 'открытых CFP'])}. NPS не рассчитан.`,
    action: issues.length > 0
      ? 'Проверить изменения на следующем выступлении и сравнить повторные отзывы.'
      : 'Продолжить сбор данных и повторно оценить динамику.',
    steps: planSteps(facts),
  };
}

/** DOM id of a review card in the producer's review list, target of the evidence links. */
export function reviewAnchorId(feedbackId: string): string {
  return `producer-review-${feedbackId}`;
}

/** DOM id of the latest plan section; the page scrolls there after a new version is built. */
export const PLAN_SECTION_ID = 'producer-plan';
