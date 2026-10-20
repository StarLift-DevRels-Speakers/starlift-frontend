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
  { id: 't4', name: 'Как говорить о сложном просто', topic: 'Публичные выступления', description: 'Структура доклада, работа с аудиторией и трудными вопросами.' },
  { id: 't5', name: 'Цифровые сервисы для городской среды', topic: 'Урбанистика / Цифровизация', description: 'Как данные и простые сервисы меняют работу городских служб.' },
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
  // The DevRel's own events cover every case of the applications screen: open and closed CFP,
  // a past event and drafts.
  {
    id: 'e3',
    owner: 'devrel',
    name: 'Форум «Умный город»',
    date: daysFromToday(45),
    cfp: daysFromToday(30),
    city: 'Казань',
    format: 'Офлайн',
    topic: 'Урбанистика / Городские сервисы',
    audience: 'Сотрудники мэрий, урбанисты, разработчики городских сервисов',
    description: 'Как города используют данные, транспорт и цифровые сервисы для жителей.',
    state: 'published',
  },
  {
    id: 'e4',
    owner: 'devrel',
    name: 'Сибирский агрофорум',
    date: daysFromToday(12),
    cfp: daysFromToday(-5),
    city: 'Новосибирск',
    format: 'Гибрид',
    topic: 'Агротехнологии / Сельское хозяйство',
    audience: 'Фермеры, агрономы, руководители хозяйств',
    description: 'Точное земледелие, мониторинг полей и работа с урожайными данными.',
    state: 'published',
  },
  {
    id: 'e5',
    owner: 'devrel',
    name: 'Уральская школа публичных выступлений',
    date: daysFromToday(20),
    cfp: daysFromToday(-3),
    city: 'Екатеринбург',
    format: 'Офлайн',
    topic: 'Коммуникации / Публичные выступления',
    audience: 'Эксперты, преподаватели, руководители команд',
    description: 'Практикум о том, как готовить доклады и держать внимание зала.',
    state: 'published',
  },
  {
    id: 'e6',
    owner: 'devrel',
    name: 'Музеи и цифровые медиа',
    date: daysFromToday(-10),
    cfp: daysFromToday(-25),
    city: 'Нижний Новгород',
    format: 'Офлайн',
    topic: 'Культура / Музейное дело',
    audience: 'Музейные сотрудники, кураторы, медиапродюсеры',
    description: 'Виртуальные экспозиции, аудиогиды и работа с посетителями онлайн.',
    state: 'published',
  },
  {
    id: 'e7',
    owner: 'devrel',
    name: 'Балтийская конференция по энергетике',
    date: daysFromToday(70),
    cfp: daysFromToday(50),
    city: 'Калининград',
    format: 'Гибрид',
    topic: 'Энергетика / Устойчивое развитие',
    audience: 'Инженеры-энергетики, представители сетевых компаний',
    description: 'Возобновляемая энергетика и энергоэффективность предприятий.',
    state: 'draft',
  },
  {
    id: 'e8',
    owner: 'devrel',
    name: 'Медицина и данные пациентов',
    date: daysFromToday(85),
    city: 'Самара',
    format: 'Онлайн',
    topic: 'Здравоохранение / Медицинские данные',
    audience: 'Врачи, администраторы клиник, аналитики',
    description: 'Электронные медкарты, телемедицина и защита персональных данных.',
    state: 'draft',
  },
  // Other organizers' events fill the speaker's catalog.
  {
    id: 'e9',
    owner: 'other',
    name: 'Байкальский форум экотуризма',
    date: daysFromToday(60),
    cfp: daysFromToday(15),
    city: 'Иркутск',
    format: 'Офлайн',
    topic: 'Туризм / Экология',
    audience: 'Туроператоры, сотрудники нацпарков, гиды',
    description: 'Развитие экотуризма без вреда для природы Байкала.',
    state: 'published',
  },
  {
    id: 'e10',
    owner: 'other',
    name: 'Дальневосточная неделя логистики',
    date: daysFromToday(25),
    cfp: daysFromToday(8),
    city: 'Владивосток',
    format: 'Гибрид',
    topic: 'Логистика / Морские перевозки',
    audience: 'Логисты, сотрудники портов, экспедиторы',
    description: 'Порты, контейнерные перевозки и цифровые сервисы отслеживания грузов.',
    state: 'published',
  },
  {
    id: 'e11',
    owner: 'other',
    name: 'Южный гастрономический форум',
    date: daysFromToday(18),
    cfp: daysFromToday(-2),
    city: 'Краснодар',
    format: 'Офлайн',
    topic: 'Гастрономия / Ресторанный бизнес',
    audience: 'Шеф-повара, рестораторы, фермеры',
    description: 'Локальные продукты, сезонное меню и экономика ресторана.',
    state: 'published',
  },
  {
    id: 'e12',
    owner: 'other',
    name: 'Наука рядом: фестиваль популяризаторов',
    date: daysFromToday(50),
    cfp: daysFromToday(35),
    city: 'Томск',
    format: 'Онлайн',
    topic: 'Наука / Просвещение',
    audience: 'Учёные, преподаватели, научные журналисты',
    description: 'Как рассказывать о науке школьникам и широкой аудитории.',
    state: 'published',
  },
  {
    id: 'e13',
    owner: 'other',
    name: 'Дни деревянного зодчества',
    date: daysFromToday(40),
    city: 'Вологда',
    format: 'Офлайн',
    topic: 'Архитектура / Наследие',
    audience: 'Архитекторы, реставраторы, краеведы',
    description: 'Сохранение деревянной архитектуры Русского Севера. Доклады только по приглашению.',
    state: 'published',
  },
];

export const applications: Application[] = [
  { id: 'a1', eventId: 'e1', talkId: 't1', topic: 'Надежные Java API', at: todayKey(), status: 'sent' },
  // The speaker asked to switch the talk; the DevRel has not answered yet.
  {
    id: 'a2',
    eventId: 'e3',
    talkId: 't4',
    topic: 'Как говорить о сложном просто',
    at: daysFromToday(-3),
    status: 'sent',
    talkChange: { talkId: 't5', topic: 'Цифровые сервисы для городской среды' },
  },
  { id: 'a3', eventId: 'e4', talkId: 't3', topic: 'Наблюдаемость Java-сервисов', at: daysFromToday(-20), status: 'accepted' },
  { id: 'a4', eventId: 'e4', talkId: 't1', topic: 'Надежные Java API', at: daysFromToday(-18), status: 'rejected' },
  { id: 'a5', eventId: 'e5', talkId: 't4', topic: 'Как говорить о сложном просто', at: daysFromToday(-9), status: 'reserve' },
  { id: 'a6', eventId: 'e6', talkId: 't5', topic: 'Цифровые сервисы для городской среды', at: daysFromToday(-40), status: 'accepted' },
  { id: 'a7', eventId: 'e9', talkId: 't4', topic: 'Как говорить о сложном просто', at: daysFromToday(-1), status: 'sent' },
  { id: 'a8', eventId: 'e12', talkId: 't4', topic: 'Как говорить о сложном просто', at: daysFromToday(-6), status: 'rejected' },
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
    { id: 'n2', at: daysFromToday(-4), text: 'Заявка на «Уральская школа публичных выступлений»: резерв', read: false },
    { id: 'n3', at: daysFromToday(-12), text: 'Заявка на «Сибирский агрофорум»: принята', read: true },
    { id: 'n4', at: daysFromToday(-12), text: 'Заявка на «Сибирский агрофорум»: отклонена', read: true },
  ],
  devrel: [
    {
      id: 'n5',
      at: daysFromToday(-2),
      text: 'Запрошена смена доклада в заявке на «Форум «Умный город»»: «Как говорить о сложном просто» → «Цифровые сервисы для городской среды»',
      read: false,
    },
  ],
};

const noRights = { publication: 0, match_devrel: 0, match_speaker: 0 };

export const billing: Record<Role, Billing> = {
  speaker: { expires: null, trialUsed: false, rights: { ...noRights }, history: [] },
  devrel: { expires: null, trialUsed: false, rights: { ...noRights }, history: [] },
};
