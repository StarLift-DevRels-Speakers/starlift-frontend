import type { WorkspaceIconName } from '@/components/layout/WorkspaceIcon/WorkspaceIcon';

// Copy of the marketing page: the sections and their texts live here, the screens only render them.
// The page is split by audience: what a speaker gets, what DevRel gets.

/** Sections of the landing page, in the order they are rendered. */
export type LandingBlockId = 'hero' | 'speakers' | 'events' | 'devrel' | 'pricing' | 'cta';

export const landingBlocks: readonly LandingBlockId[] = ['hero', 'speakers', 'events', 'devrel', 'pricing', 'cta'];

export interface LandingNavItem {
  readonly block: LandingBlockId;
  readonly label: string;
}

export const landingNav: readonly LandingNavItem[] = [
  { block: 'speakers', label: 'Спикерам' },
  { block: 'events', label: 'Мероприятия' },
  { block: 'devrel', label: 'DevRel' },
  { block: 'pricing', label: 'Тарифы' },
];

export interface SectionCopy {
  readonly kicker: string;
  readonly title: string;
  readonly description: string;
}

export const hero = {
  kicker: 'Спикеры и DevRel в одном пространстве',
  title: 'Превращайте знания в приглашения на сцену',
  /** First line of the headline. */
  titleLead: 'Превращайте знания',
  /** Second line of the headline, painted with the action colour of the design system. */
  titleAccent: 'в приглашения на сцену',
  /** The accent line broken in two: «на» always starts a new line. */
  titleAccentLines: ['в приглашения', 'на сцену'],
  subtitle:
    'StarLift помогает эксперту превратить опыт в доклад и найти площадку, а DevRel — собрать программу и пригласить нужных спикеров. Мероприятия, заявки и AI-подбор в одном месте.',
  primaryCta: 'Создать аккаунт',
  secondaryCta: 'Войти',
  highlights: ['AI-продюсер', 'AI-подбор по вашим темам', 'Каталог спикеров и мероприятий'],
} as const;

/** Section numbers used by the landing headings, like "/ 01". */
export const sectionSteps = {
  speakers: '/ 01',
  events: '/ 02',
  devrel: '/ 03',
  pricing: '/ 04',
} as const;

/** Label of the small link at the bottom of every capability card. */
export const cardCta = 'Попробовать';

export interface FeatureCard {
  readonly icon: WorkspaceIconName;
  readonly title: string;
  readonly description: string;
  readonly bullets: readonly string[];
  /** Built on StarLift AI: rendered with the AI accent of the design system. */
  readonly ai?: boolean;
  /** The lead card of the section: filled with the masthead colour. */
  readonly featured?: boolean;
}

export const speakers: SectionCopy & { readonly cards: readonly FeatureCard[] } = {
  kicker: 'Спикерам',
  title: 'От идеи до приглашения на сцену',
  description:
    'StarLift держит вместе доклады, мероприятия с открытыми CFP, заявки и приглашения — и подсказывает, где ваш опыт ждут.',
  cards: [
    {
      icon: 'tag',
      ai: true,
      featured: true,
      title: 'AI-продюсер: траектория развития',
      description: 'Персональный план: какие темы раскрыть и где выступить дальше.',
      bullets: ['Шаги на ближайшие месяцы', 'История версий плана', 'Опирается на выступления'],
    },
    {
      icon: 'star',
      ai: true,
      title: 'AI-подбор мероприятий',
      description: 'Где ваша тема уместна и где выше шанс попасть в программу.',
      bullets: ['Опирается на ваши доклады', 'Показывает причины выбора', 'Подписка или разовая покупка'],
    },
    {
      icon: 'waveform',
      title: 'Анализ речи',
      description: 'Загрузите аудио доклада — StarLift покажет темп, паузы и расшифровку с таймкодами.',
      bullets: ['Расшифровка по таймкодам', 'Темп, паузы и повторы', 'Только аудио, до 60 минут'],
    },
  ],
};

/** A conference or meetup teaser of the "upcoming events" block; dates are counted from today. */
export interface EventTeaser {
  readonly name: string;
  readonly city: string;
  readonly format: string;
  readonly level: string;
  readonly tags: readonly string[];
  readonly description: string;
  /** Days until the CFP deadline. */
  readonly daysLeft: number;
}

export const events: SectionCopy & {
  readonly cta: string;
  readonly catalogueCta: string;
  readonly items: readonly EventTeaser[];
} = {
  kicker: 'Мероприятия',
  title: 'Ближайшие события и CFP',
  description: 'Смотрите открытые CFP и подавайте заявки. Для подачи нужна регистрация — это бесплатно.',
  cta: 'Подать заявку',
  catalogueCta: 'Все мероприятия',
  items: [
    {
      name: 'Mobile Frontier 2026',
      city: 'Москва',
      format: 'Офлайн',
      level: 'Федеральный уровень',
      tags: ['Java', 'Backend', 'Архитектура'],
      description: 'Крупнейшая конференция по мобильной и backend-разработке. Собирает senior-разработчиков, тимлидов и архитекторов.',
      daysLeft: 3,
    },
    {
      name: 'Backend Meetup Kazan',
      city: 'Казань',
      format: 'Офлайн',
      level: 'Региональный уровень',
      tags: ['Backend', 'Java'],
      description: 'Региональный митап для backend-разработчиков. Практические доклады, разбор кейсов, нетворкинг.',
      daysLeft: 5,
    },
    {
      name: 'KubeCon EU 2027',
      city: 'Амстердам',
      format: 'Офлайн',
      level: 'Международный уровень',
      tags: ['Kubernetes', 'Cloud native', 'Platform engineering'],
      description: 'Крупнейшая конференция по Kubernetes и cloud-native технологиям. Доклады, воркшопы, нетворкинг.',
      daysLeft: 11,
    },
    {
      name: 'Jfokus 2027',
      city: 'Стокгольм',
      format: 'Офлайн',
      level: 'Международный уровень',
      tags: ['Java', 'JVM', 'Архитектура'],
      description: 'Одна из крупнейших Java-конференций в Скандинавии. Технические доклады, воркшопы, общение с экспертами.',
      daysLeft: 24,
    },
  ],
};

export const devrel: SectionCopy & { readonly cards: readonly FeatureCard[] } = {
  kicker: 'DevRel',
  title: 'Спикеры, программа и аудитория',
  description:
    'Каталог спикеров, AI-подбор под тему и аналитика: кого пригласить, какие темы заходят и что поправить в программе.',
  cards: [
    {
      icon: 'user',
      title: 'Каталог спикеров',
      description: 'Профили с темами, историей выступлений и оценкой соответствия аудитории.',
      bullets: ['Поиск по темам и опыту', 'Карточка спикера с докладами', 'Слабые сигналы: перспективные эксперты'],
    },
    {
      icon: 'chat',
      ai: true,
      title: 'AI-подбор спикеров',
      description: 'Кандидаты под тему мероприятия с объяснением выбора и оценкой релевантности.',
      bullets: ['Шорт-лист под программу', 'Оценка соответствия аудитории', 'Приглашение из карточки'],
    },
    {
      icon: 'talk',
      title: 'Аналитика программы',
      description: 'Заявки, приглашения и отклик аудитории видны в одном экране — без ручных сводок.',
      bullets: ['Распределение ответов аудитории', 'Соответствие доклада аудитории', 'Публикации и подписка'],
    },
  ],
};

export const pricing: SectionCopy & { readonly note: string } = {
  kicker: 'Тарифы',
  title: 'Начните бесплатно, платите за нужное',
  description:
    'Базовые сценарии доступны без подписки. AI-подбор и публикации — по подписке или разовой покупкой без автопродления.',
  note: 'Покупки в MVP тестовые: деньги не списываются.',
};

export const finalCta = {
  title: 'Готовы вывести выступление на новый уровень?',
  description: 'Создайте аккаунт за минуту: бесплатный уровень открывается сразу.',
} as const;

export interface FooterLink {
  readonly label: string;
  readonly href: string;
}

export interface FooterColumn {
  readonly title: string;
  readonly links: readonly FooterLink[];
}

export const footer = {
  tagline: 'Платформа для спикеров и DevRel: доклады, мероприятия и подбор под аудиторию.',
  columns: [
    {
      title: 'Продукт',
      links: [
        { label: 'Спикерам', href: '#speakers' },
        { label: 'Мероприятия', href: '#events' },
        { label: 'DevRel', href: '#devrel' },
        { label: 'Тарифы', href: '#pricing' },
      ],
    },
    {
      title: 'Аккаунт',
      links: [
        { label: 'Войти', href: '/login' },
        { label: 'Регистрация', href: '/login?mode=register' },
      ],
    },
  ] satisfies readonly FooterColumn[],
  note: 'StarLift — платформа для спикеров и DevRel.',
} as const;
