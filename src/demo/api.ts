import type { RequestOptions } from '@/api/client';
import type {
  ApplicationDto, CatalogSpeakerDto, EventDto, FeedbackDto, InvitationDto, MediaFileDto,
  MeUser, NotificationDto, ProducerPlanDto, SpeakerTalkDto, SpeechDto,
} from '@/api/types';
import { demoSession, emptyDemo } from './config';

const storageKey = emptyDemo ? 'starlift-design-demo-empty-v1' : 'starlift-design-demo-v1';
const date = (offset = 0) => {
  const value = new Date();
  value.setDate(value.getDate() + offset);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
};
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const user = () => demoSession().user;

interface DemoData {
  profiles: Record<string, MeUser>;
  talks: SpeakerTalkDto[];
  speeches: SpeechDto[];
  events: EventDto[];
  applications: ApplicationDto[];
  invitations: InvitationDto[];
  feedback: FeedbackDto[];
  media: MediaFileDto[];
  notifications: NotificationDto[];
  plans: ProducerPlanDto[];
}

function seed(): DemoData {
  const fixtures: DemoData = {
    profiles: Object.fromEntries([-1, -2].map((speakerId) => [String(speakerId), {
      id: speakerId, username: `demo-${speakerId}`, firstName: speakerId === -1 ? 'Алексей' : 'Мария',
      lastName: speakerId === -1 ? 'Петров' : 'Смирнова', about: 'Помогаю командам создавать удобные продукты и делюсь опытом с IT-сообществом.',
      company: 'ТехноЛаб', companyRole: speakerId === -1 ? 'Frontend Lead' : 'DevRel Manager', region: 'Москва',
      preferences: 'Конференции и митапы, онлайн и офлайн', roles: [speakerId === -1 ? 'SPEAKER' : 'DEVREL'],
      tags: ['React', 'TypeScript', 'Архитектура', 'Доступность'],
    }])),
    talks: [
      { id: 'talk-1', speakerId: -1, name: 'React без лишней сложности', topic: 'React', description: 'Практические подходы к архитектуре и производительности приложений.', createdDate: now() },
      { id: 'talk-2', speakerId: -1, name: 'Доступность начинается с компонентов', topic: 'Доступность', description: 'Как встроить доступность в дизайн-систему команды.', createdDate: now() },
      { id: 'talk-3', speakerId: -1, name: 'TypeScript в большой команде', topic: 'TypeScript', description: 'Типизация, которая помогает развивать продукт.', createdDate: now() },
    ],
    speeches: [
      { id: 'speech-1', speakerId: -1, topic: 'React без лишней сложности', talkDate: `${date(-14)}T12:00:00`, conferenceType: 'CONFERENCE', format: 'OFFLINE', activityName: 'Frontend Community', speakerTalkId: 'talk-1' },
      { id: 'speech-2', speakerId: -1, topic: 'Доступность начинается с компонентов', talkDate: `${date(-7)}T15:00:00`, conferenceType: 'MEETUP', format: 'ONLINE', activityName: 'Design Systems Meetup', speakerTalkId: 'talk-2' },
    ],
    events: ['Frontend Conf', 'React Meetup', 'Дизайн-системы: практика', 'TypeScript Day', 'Новый митап команды'].map((name, index) => ({
      id: `event-${index + 1}`, ownerId: -2, ownerName: 'Мария Смирнова', own: true, name,
      date: date(10 + index * 7), cfp: date(5 + index * 7), city: index === 1 ? '' : 'Москва',
      format: index === 1 ? 'ONLINE' : index === 2 ? 'HYBRID' : 'OFFLINE', topic: ['React', 'TypeScript', 'Доступность'][index % 3],
      audience: 'Разработчики, тимлиды и архитекторы', description: 'Обмен опытом, практические доклады и знакомство с IT-сообществом.',
      state: index === 4 ? 'draft' : 'published',
    })),
    applications: ['sent', 'accepted', 'reserve'].map((status, index) => ({
      id: `application-${index + 1}`, eventId: `event-${index + 1}`, speakerId: -1, speakerName: 'Алексей Петров',
      talkId: `talk-${index + 1}`, topic: ['React без лишней сложности', 'Доступность начинается с компонентов', 'TypeScript в большой команде'][index],
      at: date(-index), status: status as ApplicationDto['status'], talkChange: null,
    })),
    invitations: [{ id: 'invitation-1', eventId: 'event-4', speakerId: -1, speakerName: 'Алексей Петров', topic: 'TypeScript в большой команде', date: date(-1), status: 'sent' }],
    feedback: Array.from({ length: 6 }, (_, index) => ({
      id: `feedback-${index + 1}`, talkId: index % 2 ? 'speech-2' : 'speech-1', createdDate: `${date(-index - 2)}T14:00:00`,
      rating: index % 3 ? 9 : 8, answers: null, comment: 'Полезный доклад с понятными примерами. Хочется больше времени на вопросы.',
      positive: 'Понятная структура и практические примеры', negative: 'Не хватило времени на обсуждение', improvementSuggestions: 'Добавить разбор вопросов аудитории',
    })),
    media: [{ id: 'media-1', name: 'React — презентация.pdf', sizeBytes: 2200000, talkId: 'talk-1', createdDate: now() }],
    notifications: [
      { id: 'notification-1', text: 'Заявка на React Meetup принята', createdDate: now(), read: false },
      { id: 'notification-2', text: 'Новое приглашение на TypeScript Day', createdDate: now(), read: false },
      { id: 'notification-3', text: 'Получен отзыв на выступление Frontend Community', createdDate: now(), read: true },
    ],
    plans: [makePlan()],
  };
  if (!emptyDemo) return fixtures;

  Object.assign(fixtures.profiles['-1'], { about: '', preferences: '', tags: [] });
  return {
    ...fixtures,
    talks: [],
    speeches: [],
    applications: [],
    invitations: [],
    feedback: [],
    media: [],
    notifications: [],
    plans: [],
  };
}

function makePlan(): ProducerPlanDto {
  return {
    id: id(), speakerId: -1, status: 'ready', message: null, createdDate: now(),
    plan: {
      summary: 'План развития на основе выступлений и отзывов аудитории.',
      strengths: [{ title: 'Практические примеры и понятная структура', mentions: 5, feedbackIds: ['feedback-1'] }],
      growthAreas: [{ title: 'Больше времени на вопросы', mentions: 3, feedbackIds: ['feedback-2'] }],
      steps: [
        { title: 'Подготовить интерактивный разбор', why: 'Вовлечь аудиторию в обсуждение практического примера.', dueDate: date(14), evidence: [{ type: 'FEEDBACK', id: 'feedback-1', label: 'Отзыв слушателя' }] },
        { title: 'Выступить на профильном митапе', why: 'Проверить новый формат и собрать обратную связь.', dueDate: date(30), evidence: [] },
      ],
    },
  };
}

function load(): DemoData {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved) as DemoData;
  } catch { /* Use fresh fixtures when storage is unavailable. */ }
  return seed();
}

const data = load();
const catalog: CatalogSpeakerDto[] = [
  { id: -1, name: 'Алексей Петров', position: 'Frontend Lead', company: 'ТехноЛаб', city: 'Москва', skills: 'React, TypeScript, Архитектура', about: 'Разрабатываю веб-приложения и делюсь практическим опытом.', preferences: 'Конференции и митапы', feedbackCount: 6, speechCount: 2 },
  { id: -3, name: 'Анна Волкова', position: 'Senior Developer', company: 'Облако', city: 'Санкт-Петербург', skills: 'TypeScript, Доступность, CSS', about: 'Создаю доступные интерфейсы и дизайн-системы.', preferences: 'Онлайн и офлайн', feedbackCount: 12, speechCount: 8 },
  { id: -4, name: 'Дмитрий Соколов', position: 'Tech Lead', company: 'Платформа', city: 'Екатеринбург', skills: 'React, Архитектура, Node.js', about: 'Помогаю командам масштабировать продукты.', preferences: 'Конференции', feedbackCount: 9, speechCount: 5 },
];

/** Local API adapter: never falls through to the real backend. */
export async function demoRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const url = new URL(path, window.location.origin);
  const route = url.pathname;
  const method = options.method ?? 'GET';
  const body = (options.body ?? {}) as Record<string, unknown>;
  const result = routeRequest(route, method, body, url, options.body);
  if (method !== 'GET') {
    try { localStorage.setItem(storageKey, JSON.stringify(data)); } catch { /* Keep changes in memory. */ }
  }
  return structuredClone(result) as T;
}

function routeRequest(route: string, method: string, body: Record<string, unknown>, url: URL, rawBody: unknown): unknown {
  const parts = route.split('/');
  const itemId = decodeURIComponent(parts[3] ?? '');
  if (route === '/api/audio-analyses') {
    if (method === 'GET') return [];
    throw new Error('Анализ речи доступен при подключении к серверу. В деморежиме аудио не обрабатывается.');
  }
  if (route.startsWith('/api/media/files/') && route.endsWith('/url')) {
    throw new Error('Воспроизведение записи доступно при подключении к серверу.');
  }
  if (route === '/api/me') {
    const profile = data.profiles[String(user().id)];
    if (method === 'PATCH') Object.assign(profile, body);
    return { me: profile };
  }
  if (route.startsWith('/api/auth/')) return { ...demoSession() };
  if (route === '/api/speaker-talks') {
    if (method === 'POST') data.talks.push({ ...body, id: id(), speakerId: -1, createdDate: now() } as unknown as SpeakerTalkDto);
    return method === 'POST' ? data.talks.at(-1) : data.talks;
  }
  if (route.startsWith('/api/speaker-talks/')) {
    const talk = data.talks.find((item) => item.id === itemId);
    if (!talk) throw new Error('Доклад не найден');
    Object.assign(talk, body);
    return talk;
  }
  if (route === '/api/talks') {
    if (method === 'POST') data.speeches.push({ ...body, id: id() } as unknown as SpeechDto);
    return method === 'POST' ? data.speeches.at(-1) : data.speeches.filter((speech) => speech.speakerId === Number(url.searchParams.get('speakerId')));
  }
  if (route.endsWith('/feedback-link')) {
    if (!data.speeches.some((speech) => speech.id === itemId)) throw new Error('Выступление не найдено');
    return { talkId: itemId, token: `demo-${itemId}` };
  }
  if (route === '/api/me/feedback') return data.feedback;
  if (route.startsWith('/api/public/feedback/')) {
    const token = decodeURIComponent(parts[4] ?? '');
    const speech = data.speeches.find((item) => token === `demo-${item.id}`);
    if (!speech) throw new Error('Форма отзыва не найдена');
    if (method === 'GET') return { topic: speech.topic, eventName: speech.activityName, date: speech.talkDate };
    const answers = body.answers as NonNullable<FeedbackDto['answers']>;
    const rating = Math.round(Object.values(answers).reduce((sum: number, value) => sum + (2 - Number(value)) * 5, 0) / 5);
    data.feedback.push({
      id: id(), talkId: speech.id, createdDate: now(), rating, comment: String(body.comment ?? ''), answers,
      positive: '', negative: '', improvementSuggestions: '',
    });
    return;
  }
  if (route === '/api/events') {
    if (method === 'POST') data.events.push({ ...body, id: id(), ownerId: -2, ownerName: 'Мария Смирнова', own: true, state: 'draft' } as unknown as EventDto);
    return method === 'POST' ? data.events.at(-1) : data.events.filter((event) => user().id === -2 || event.state === 'published').map((event) => ({ ...event, own: user().id === -2 }));
  }
  if (route.startsWith('/api/events/')) {
    const event = data.events.find((item) => item.id === itemId);
    if (!event) throw new Error('Мероприятие не найдено');
    Object.assign(event, route.endsWith('/publish') ? { state: 'published' } : body);
    return event;
  }
  if (route === '/api/applications') {
    if (method === 'POST') {
      const talk = data.talks.find((item) => item.id === body.talkId);
      data.applications.push({ id: id(), eventId: String(body.eventId), talkId: talk?.id ?? '', topic: talk?.name ?? '', speakerId: -1, speakerName: 'Алексей Петров', at: date(), status: 'sent', talkChange: null });
    }
    return data.applications;
  }
  if (route.startsWith('/api/applications/')) {
    const application = data.applications.find((item) => item.id === itemId);
    if (!application) throw new Error('Заявка не найдена');
    if (route.endsWith('/decision')) application.status = body.status as ApplicationDto['status'];
    else if (route.endsWith('/answer')) {
      if (body.approved && application.talkChange) Object.assign(application, application.talkChange);
      application.talkChange = null;
    } else {
      const talk = data.talks.find((item) => item.id === body.talkId);
      if (talk) application.talkChange = { talkId: talk.id, topic: talk.name };
    }
    return;
  }
  if (route === '/api/invitations') {
    if (method === 'POST') data.invitations.push({ ...body, id: id(), speakerName: catalog.find((item) => item.id === body.speakerId)?.name ?? 'Спикер', date: date(), status: 'sent' } as unknown as InvitationDto);
    return user().id === -2 ? data.invitations : data.invitations.filter((item) => item.speakerId === user().id);
  }
  if (route.startsWith('/api/invitations/')) {
    const invitation = data.invitations.find((item) => item.id === itemId);
    if (invitation) invitation.status = body.status as InvitationDto['status'];
    return;
  }
  if (route === '/api/notifications') return data.notifications;
  if (route === '/api/notifications/read') {
    data.notifications.forEach((item) => { if (!body.id || body.id === item.id) item.read = true; });
    return;
  }
  if (route === '/api/media/files') return data.media;
  if (route === '/api/media/upload' && rawBody instanceof FormData) {
    const file = rawBody.get('file') as File;
    const media = { id: id(), name: file.name, sizeBytes: file.size, talkId: url.searchParams.get('talkId'), createdDate: now() };
    data.media.push(media);
    return media;
  }
  if (route.startsWith('/api/media/files/') && method === 'DELETE') {
    data.media = data.media.filter((item) => item.id !== parts[4]);
    return;
  }
  if (route === '/api/catalog/speakers') {
    const query = (url.searchParams.get('query') ?? '').toLocaleLowerCase();
    return catalog.filter((item) => Object.values(item).join(' ').toLocaleLowerCase().includes(query));
  }
  if (route.startsWith('/api/catalog/speakers/')) {
    const profile = catalog.find((item) => String(item.id) === parts[4]);
    if (!profile) throw new Error('Спикер не найден');
    const speeches = data.speeches.filter((speech) => speech.speakerId === profile.id);
    return {
      profile,
      talks: data.talks.filter((talk) => talk.speakerId === profile.id),
      feedback: data.feedback.filter((feedback) => speeches.some((speech) => speech.id === feedback.talkId)),
      speeches: speeches.map((speech) => ({ id: speech.id, talkId: speech.speakerTalkId, topic: speech.topic, event: speech.activityName, date: speech.talkDate })),
    };
  }
  if (route.endsWith('/talent-score')) return { id: Number(parts[4]), score: 87, reason: 'Релевантные темы и высокая оценка аудитории', confidence: 'high' };
  if (route === '/api/producer/me/plans') return data.plans;
  if (route === '/api/producer/me/plan') {
    const plan = makePlan();
    data.plans.push(plan);
    return plan;
  }
  if (route.startsWith('/api/gamification/')) return competition(route, url);
  throw new Error(`В деморежиме пока нет операции: ${method} ${route}`);
}

function competition(route: string, url: URL): unknown {
  const season = { id: 1, startsAt: `${date(-3)}T00:00:00`, endsAt: `${date(4)}T00:00:00`, status: 'ACTIVE', closedAt: null };
  const codes = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
  const entries = catalog.map((speaker, index) => ({ rank: index + 1, speakerId: speaker.id, username: `speaker-${index}`, firstName: speaker.name.split(' ')[0], lastName: speaker.name.split(' ')[1], avatarColor: null, league: 'SILVER', points: 320 - index * 50, zone: index === 0 ? 'PROMOTION' : 'SAFE', me: speaker.id === -1 }));
  if (route.endsWith('/me')) return { speakerId: -1, username: 'demo-speaker', firstName: 'Алексей', lastName: 'Петров', avatarColor: null, league: 'SILVER', weeklyPoints: 320, weeklyRank: 1, leagueSize: 3, zone: 'PROMOTION', totalPoints: 1450, currentStreak: 5, longestStreak: 12, checkedInToday: true, season, badges: [] };
  if (route.endsWith('/check-in')) return { alreadyCheckedIn: true, awardedPoints: 0, currentStreak: 5, longestStreak: 12, newBadges: [] };
  if (route.endsWith('/leagues')) return codes.map((code, index) => ({ code, title: ['Бронзовая', 'Серебряная', 'Золотая', 'Платиновая', 'Алмазная'][index], order: index, participants: 3, promotionCount: 1, demotionCount: 0 }));
  if (route.endsWith('/leaderboard/league')) return { league: 'SILVER', season, promotionCount: 1, demotionCount: 0, entries };
  if (route.endsWith('/leaderboard/global')) return { period: url.searchParams.get('period'), season, entries };
  if (route.endsWith('/badges')) return [{ code: 'FIRST_TALK', title: 'Первое выступление', description: 'Добавить первое выступление', category: 'ACTIVITY', repeatable: false }];
  if (route.endsWith('/points')) return [{ id: 'points-1', speakerId: -1, points: 50, reason: 'TALK_CREATED', sourceId: 'speech-1', comment: null, awardedBy: null, createdDate: now() }];
  throw new Error('Данные соревнования не найдены');
}
