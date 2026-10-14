import type {
  AppNotification,
  Application,
  Billing,
  Feedback,
  Invitation,
  MediaFile,
  Speech,
  Talk,
  TechEvent,
} from '@/types/domain';
import type { Role } from '@/types/role';
import { daysFromToday, todayKey } from '@/utils/date';

// Shared demo world from StarLift_Макеты.html (`seed()`): the speaker applies to and is invited
// to the DevRel's events. Relative dates keep upcoming items in the future.

export const talks: Talk[] = [
  { id: 't1', name: 'Надежные Java API', topic: 'Java / Архитектура', description: 'Практические подходы к надежности API.' },
  { id: 't2', name: 'Spring Boot на практике', topic: 'Spring Boot', description: 'Решения из проектов и типичные ошибки.' },
  { id: 't3', name: 'Наблюдаемость Java-сервисов', topic: 'Observability', description: 'Метрики, трассировки и реальные сценарии диагностики.' },
];

export const media: MediaFile[] = [
  { id: 'm1', name: 'java-api-slides.pdf', talkId: 't1', sizeBytes: 2_202_010 },
];

export const speeches: Speech[] = [
  { id: 's1', talkId: 't1', event: 'Backend Meetup', date: '2026-06-18' },
  { id: 's2', talkId: 't2', event: 'Java Community Day', date: '2026-08-22' },
  { id: 's4', talkId: 't3', event: 'DevOps & Observability Meetup', date: '2026-09-21' },
  { id: 's5', talkId: 't1', event: 'Java Engineering Forum', date: '2026-07-03' },
  { id: 's3', talkId: 't1', event: 'Java Evening · доклад', date: daysFromToday(16) },
];

export const events: TechEvent[] = [
  {
    id: 'e1',
    owner: 'devrel',
    name: 'Backend Architecture Meetup',
    date: daysFromToday(31),
    cfp: daysFromToday(22),
    city: 'Москва',
    format: 'Офлайн',
    topic: 'Backend / Java',
    audience: 'Senior-разработчики',
    description: 'Практические доклады о надежной архитектуре.',
    state: 'published',
  },
  {
    id: 'e2',
    owner: 'other',
    name: 'Java Engineering Conference',
    date: daysFromToday(54),
    cfp: daysFromToday(40),
    city: 'Санкт-Петербург',
    format: 'Гибрид',
    topic: 'Java / Cloud',
    audience: 'Разработчики и архитекторы',
    description: 'Техническая конференция сообщества.',
    state: 'published',
  },
];

export const applications: Application[] = [
  { id: 'a1', eventId: 'e1', talkId: 't1', topic: 'Надежные Java API', at: todayKey(), status: 'sent' },
];

export const invitations: Invitation[] = [
  { id: 'i1', eventId: 'e1', status: 'sent', date: todayKey(), topic: 'Надежные Java API' },
];

export const feedback: Feedback[] = [
  { id: 'f1', at: '2026-04-12', answers: { utility: 0, clarity: 0, examples: 1, pace: 0, engagement: 0 }, comment: 'Полезная архитектурная тема. Добавьте пошаговый пример миграции.' },
  { id: 'f2', at: '2026-05-08', answers: { utility: 0, clarity: 1, examples: 1, pace: 1, engagement: 1 }, comment: 'Интересно, но некоторые схемы объяснялись слишком быстро.' },
  { id: 'f3', at: '2026-06-19', answers: { utility: 0, clarity: 0, examples: 0, pace: 0, engagement: 0 }, comment: 'Хорошие кейсы из реальных проектов, понятная структура.' },
  { id: 'f4', at: '2026-06-20', answers: { utility: 0, clarity: 1, examples: 1, pace: 1, engagement: 1 }, comment: 'Хотелось больше времени на схемы и рабочий пример API.' },
  { id: 'f5', at: '2026-07-04', answers: { utility: 1, clarity: 0, examples: 0, pace: 0, engagement: 0 }, comment: 'Практические рекомендации удалось применить в команде.' },
  { id: 'f6', at: '2026-08-23', answers: { utility: 0, clarity: 0, examples: 1, pace: 0, engagement: 0 }, comment: 'Содержание полезное, хотелось еще один пример для начинающих.' },
  { id: 'f7', at: '2026-08-24', answers: { utility: 0, clarity: 1, examples: 1, pace: 1, engagement: 1 }, comment: 'Очень сильный материал, но темп выше комфортного.' },
  { id: 'f8', at: '2026-09-03', answers: { utility: 0, clarity: 0, examples: 0, pace: 0, engagement: 0 }, comment: 'Четкая подача основных принципов надежности сервисов.' },
  { id: 'f9', at: '2026-09-28', answers: { utility: 0, clarity: 1, examples: 1, pace: 1, engagement: 1 }, comment: 'Хорошо разобраны ошибки, но на сложных местах не хватало пауз.' },
  { id: 'f10', at: '2026-10-04', answers: { utility: 0, clarity: 0, examples: 0, pace: 0, engagement: 0 }, comment: 'Разбор инцидентов и выводы были особенно полезны.' },
];

export const notifications: Record<Role, AppNotification[]> = {
  speaker: [
    { id: 'n1', at: '2026-10-09', text: 'Вам отправлено приглашение на мероприятие', read: false },
  ],
  devrel: [],
};

const noRights = { publication: 0, match_devrel: 0, match_speaker: 0 };

export const billing: Record<Role, Billing> = {
  speaker: { expires: null, trialUsed: false, rights: { ...noRights }, history: [] },
  devrel: { expires: null, trialUsed: false, rights: { ...noRights }, history: [] },
};
