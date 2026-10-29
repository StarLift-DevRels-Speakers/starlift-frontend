import { request, type AuthTokensResponse } from './client';
import type {
  ApplicationDto,
  BadgeDefinitionDto,
  CatalogSpeakerDetailsDto,
  CatalogSpeakerDto,
  CheckInDto,
  EventBody,
  EventDto,
  FeedbackDto,
  GamificationProfileDto,
  GlobalLeaderboardDto,
  InvitationDto,
  LeagueDto,
  LeagueLeaderboardDto,
  MediaFileDto,
  MeResponse,
  NotificationDto,
  ProducerPlanDto,
  PointTransactionDto,
  ProfilePatch,
  PublicFeedbackForm,
  SpeakerTalkDto,
  SpeechCreate,
  SpeechDto,
  TalentScoreDto,
} from './types';
import type { FeedbackQuestionKey } from '@/types/domain';

const json = (method: string, body?: unknown) => ({ method, body });

export const api = {
  // ---------- Auth ----------
  signIn: (username: string, password: string) =>
    request<AuthTokensResponse>('/api/auth/sign-in', { ...json('POST', { username, password }), anonymous: true }),
  signUp: (body: { username: string; password: string; firstName: string; lastName: string }) =>
    request<AuthTokensResponse>('/api/auth/sign-on', { ...json('POST', body), anonymous: true }),
  logout: (refreshToken: string) => request<void>('/api/auth/logout', { ...json('POST', { refreshToken }), anonymous: true }),

  // ---------- Profile ----------
  me: () => request<MeResponse>('/api/me'),
  patchMe: (body: ProfilePatch) => request<MeResponse>('/api/me', json('PATCH', body)),

  // ---------- Talks and speeches ----------
  speakerTalks: () => request<SpeakerTalkDto[]>('/api/speaker-talks'),
  createSpeakerTalk: (body: { name: string; topic: string; description: string }) =>
    request<SpeakerTalkDto>('/api/speaker-talks', json('POST', body)),
  updateSpeakerTalk: (id: string, body: { name: string; topic: string; description: string }) =>
    request<SpeakerTalkDto>(`/api/speaker-talks/${id}`, json('PUT', body)),
  speeches: (speakerId: number) => request<SpeechDto[]>(`/api/talks?speakerId=${speakerId}`),
  createSpeech: (body: SpeechCreate) => request<SpeechDto>('/api/talks', json('POST', body)),

  // ---------- Feedback ----------
  myFeedback: () => request<FeedbackDto[]>('/api/me/feedback'),
  feedbackLink: (speechId: string) => request<{ talkId: string; token: string }>(`/api/talks/${speechId}/feedback-link`, json('POST')),
  publicFeedbackForm: (token: string) =>
    request<PublicFeedbackForm>(`/api/public/feedback/${encodeURIComponent(token)}`, { anonymous: true }),
  submitPublicFeedback: (token: string, answers: Record<FeedbackQuestionKey, number>, comment: string) =>
    request<void>(`/api/public/feedback/${encodeURIComponent(token)}`, { ...json('POST', { answers, comment }), anonymous: true }),

  // ---------- Media ----------
  mediaFiles: () => request<MediaFileDto[]>('/api/media/files'),
  uploadMedia: (file: File, talkId: string) => {
    const form = new FormData();
    form.append('file', file);
    const query = talkId ? `?talkId=${talkId}` : '';
    return request<MediaFileDto>(`/api/media/upload${query}`, { method: 'POST', body: form });
  },
  deleteMedia: (id: string) => request<void>(`/api/media/files/${id}`, json('DELETE')),

  // ---------- Events, applications, invitations ----------
  events: () => request<EventDto[]>('/api/events'),
  createEvent: (body: EventBody) => request<EventDto>('/api/events', json('POST', body)),
  updateEvent: (id: string, body: EventBody) => request<EventDto>(`/api/events/${id}`, json('PUT', body)),
  publishEvent: (id: string) => request<EventDto>(`/api/events/${id}/publish`, json('POST')),
  applications: () => request<ApplicationDto[]>('/api/applications'),
  submitApplication: (eventId: string, talkId: string) => request<void>('/api/applications', json('POST', { eventId, talkId })),
  requestTalkChange: (id: string, talkId: string) => request<void>(`/api/applications/${id}/talk-change`, json('POST', { talkId })),
  answerTalkChange: (id: string, approved: boolean) =>
    request<void>(`/api/applications/${id}/talk-change/answer`, json('POST', { approved })),
  decideApplication: (id: string, status: string) => request<void>(`/api/applications/${id}/decision`, json('POST', { status })),
  invitations: () => request<InvitationDto[]>('/api/invitations'),
  sendInvitation: (eventId: string, speakerId: number, topic: string) =>
    request<void>('/api/invitations', json('POST', { eventId, speakerId, topic })),
  answerInvitation: (id: string, status: string) => request<void>(`/api/invitations/${id}/answer`, json('POST', { status })),

  // ---------- Notifications ----------
  notifications: () => request<NotificationDto[]>('/api/notifications'),
  markNotificationsRead: (id?: string) => request<void>('/api/notifications/read', json('POST', { id: id ?? null })),

  // ---------- Catalog, weak signals, producer ----------
  catalog: (query: string) => request<CatalogSpeakerDto[]>(`/api/catalog/speakers?query=${encodeURIComponent(query)}`),
  catalogSpeaker: (id: string) => request<CatalogSpeakerDetailsDto>(`/api/catalog/speakers/${encodeURIComponent(id)}`),
  talentScore: (speakerId: string) => request<TalentScoreDto>(`/api/signals/speakers/${encodeURIComponent(speakerId)}/talent-score`, json('POST')),
  producerPlans: () => request<ProducerPlanDto[]>('/api/producer/me/plans'),
  buildProducerPlan: () => request<ProducerPlanDto>('/api/producer/me/plan', json('POST')),

  // ---------- Competition ----------
  competitionProfile: () => request<GamificationProfileDto>('/api/gamification/me'),
  checkIn: () => request<CheckInDto>('/api/gamification/me/check-in', json('POST')),
  myPoints: (limit = 50) => request<PointTransactionDto[]>(`/api/gamification/me/points?limit=${limit}`),
  leagues: () => request<LeagueDto[]>('/api/gamification/leagues'),
  leagueLeaderboard: () => request<LeagueLeaderboardDto>('/api/gamification/leaderboard/league'),
  globalLeaderboard: (period: 'WEEK' | 'ALL_TIME') =>
    request<GlobalLeaderboardDto>(`/api/gamification/leaderboard/global?period=${period}`),
  badges: () => request<BadgeDefinitionDto[]>('/api/gamification/badges'),
};
