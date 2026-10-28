import type {
  ApplicationDto,
  CatalogSpeakerDto,
  EventDto,
  EventFormatCode,
  FeedbackDto,
  InvitationDto,
  MediaFileDto,
  MeUser,
  NotificationDto,
  ProducerPlanDto,
  ProfilePatch,
  SpeakerTalkDto,
  SpeechDto,
} from './types';
import type {
  AppNotification,
  Application,
  DevelopmentPlan,
  EventFormat,
  Feedback,
  FeedbackQuestionKey,
  Invitation,
  MediaFile,
  Speech,
  Talk,
  TechEvent,
  UserProfile,
} from '@/types/domain';
import { feedbackQuestions } from '@/features/feedback/questions';

// Backend DTOs → domain entities used by the screens, and back for writes.

/** Default values of users.region and users.company mean "not filled in". */
const EMPTY_REGION = 'Другие регионы';
const EMPTY_COMPANY = 'Unknown';

const formats: Record<EventFormatCode, EventFormat> = { OFFLINE: 'Офлайн', ONLINE: 'Онлайн', HYBRID: 'Гибрид' };

export function formatCode(format: EventFormat): EventFormatCode {
  return (Object.keys(formats) as EventFormatCode[]).find((code) => formats[code] === format) ?? 'OFFLINE';
}

const day = (value: string | null | undefined): string => (value ?? '').slice(0, 10);

export function toProfile(me: MeUser): UserProfile {
  const name = [me.firstName, me.lastName].filter(Boolean).join(' ');
  return {
    id: String(me.id),
    name: name || me.username,
    position: me.companyRole ?? '',
    company: me.company && me.company !== EMPTY_COMPANY ? me.company : '',
    city: me.region && me.region !== EMPTY_REGION ? me.region : '',
    skills: (me.tags ?? []).join(', '),
    preferences: me.preferences ?? '',
    about: me.about ?? '',
  };
}

/** The form has one name field: the first word is the first name, the rest is the last name. */
export function toProfilePatch(profile: Omit<UserProfile, 'id'>): ProfilePatch {
  const [firstName = '', ...rest] = profile.name.trim().split(/\s+/);
  return {
    firstName,
    lastName: rest.join(' '),
    about: profile.about,
    company: profile.company,
    companyRole: profile.position,
    region: profile.city,
    preferences: profile.preferences,
    tags: profile.skills.split(',').map((tag) => tag.trim()).filter(Boolean),
  };
}

export function toCatalogProfile(speaker: CatalogSpeakerDto): UserProfile {
  return {
    id: String(speaker.id),
    name: speaker.name,
    position: speaker.position,
    company: speaker.company === EMPTY_COMPANY ? '' : speaker.company,
    city: speaker.city,
    skills: speaker.skills,
    preferences: speaker.preferences,
    about: speaker.about,
  };
}

export function toTalk(talk: SpeakerTalkDto): Talk {
  return { id: talk.id, name: talk.name, topic: talk.topic, description: talk.description ?? '' };
}

export function toSpeech(speech: SpeechDto): Speech {
  return { id: speech.id, talkId: speech.speakerTalkId ?? '', event: speech.activityName, date: day(speech.talkDate) };
}

export function toFeedback(item: FeedbackDto): Feedback {
  const answers = item.answers;
  // Every question of the form must have an answer, otherwise the review is shown by its rating.
  const complete = answers && feedbackQuestions.every(({ key }) => typeof answers[key] === 'number');
  return {
    id: item.id,
    at: day(item.createdDate),
    speechId: item.talkId,
    rating: item.rating,
    answers: complete ? (answers as Record<FeedbackQuestionKey, number>) : null,
    comment: item.comment ?? '',
    positive: item.positive,
    negative: item.negative,
  };
}

export function toMediaFile(file: MediaFileDto): MediaFile {
  return { id: file.id, name: file.name, talkId: file.talkId ?? '', sizeBytes: file.sizeBytes ?? 0 };
}

export function toEvent(event: EventDto): TechEvent {
  return {
    id: event.id,
    owner: event.own ? 'devrel' : 'other',
    ownerName: event.ownerName ?? '',
    name: event.name,
    date: event.date,
    cfp: event.cfp ?? undefined,
    city: event.city ?? '',
    format: formats[event.format] ?? 'Офлайн',
    topic: event.topic,
    audience: event.audience ?? '',
    description: event.description ?? '',
    state: event.state,
  };
}

export function toApplication(application: ApplicationDto): Application {
  return {
    id: application.id,
    eventId: application.eventId,
    speakerId: String(application.speakerId),
    speakerName: application.speakerName ?? 'Спикер',
    talkId: application.talkId ?? '',
    topic: application.topic,
    at: application.at,
    status: application.status,
    ...(application.talkChange && { talkChange: { talkId: application.talkChange.talkId ?? '', topic: application.talkChange.topic } }),
  };
}

export function toInvitation(invitation: InvitationDto): Invitation {
  return {
    id: invitation.id,
    eventId: invitation.eventId,
    speakerId: String(invitation.speakerId),
    speakerName: invitation.speakerName ?? 'Спикер',
    status: invitation.status,
    date: invitation.date,
    topic: invitation.topic,
  };
}

export function toNotification(notification: NotificationDto): AppNotification {
  return { id: notification.id, at: day(notification.createdDate), text: notification.text, read: notification.read };
}

function themes(items: { title: string; mentions: number }[], empty: string): string {
  return items.length > 0 ? items.map((item) => `${item.title} (упоминаний: ${item.mentions})`).join('; ') : empty;
}

/** Ready producer plans become numbered versions; failed and insufficient runs are not versions. */
export function toPlans(plans: ProducerPlanDto[]): DevelopmentPlan[] {
  return plans
    .filter((item) => item.status === 'ready' && item.plan)
    .map((item, index) => {
      const plan = item.plan!;
      return {
        id: item.id,
        version: index + 1,
        at: day(item.createdDate),
        strong: themes(plan.strengths, 'Устойчивых сильных сторон пока не выявлено.'),
        improve: themes(plan.growthAreas, 'Повторяющихся зон роста не выявлено.'),
        source: plan.summary,
        action: plan.steps[0]?.title ?? 'Продолжить сбор отзывов и повторно оценить динамику.',
        steps: plan.steps.map((step, stepIndex) => ({
          phase: `Шаг ${stepIndex + 1}`,
          title: step.title,
          description: step.why,
          due: day(step.dueDate),
          feedbackIds: step.evidence.filter((evidence) => evidence.type === 'FEEDBACK').map((evidence) => evidence.id),
        })),
      };
    });
}
