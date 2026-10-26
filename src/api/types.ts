// Response and request bodies of the backend REST API (see openapi.yaml of starlift-backend).
// Dates: `YYYY-MM-DD` for LocalDate, `YYYY-MM-DDTHH:mm:ss` for LocalDateTime.

export interface MeUser {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  about: string | null;
  company: string | null;
  companyRole: string | null;
  region: string | null;
  preferences: string | null;
  roles: string[];
  tags: string[] | null;
}

export interface MeResponse {
  me: MeUser;
}

export interface ProfilePatch {
  firstName: string;
  lastName: string;
  about: string;
  company: string;
  companyRole: string;
  region: string;
  preferences: string;
  tags: string[];
}

export interface SpeakerTalkDto {
  id: string;
  speakerId: number;
  name: string;
  topic: string;
  description: string | null;
  createdDate: string;
}

export interface SpeechDto {
  id: string;
  speakerId: number;
  topic: string;
  talkDate: string;
  conferenceType: string;
  format: string;
  activityName: string;
  speakerTalkId: string | null;
}

export interface SpeechCreate {
  speakerId: number;
  topic: string;
  talkDate: string;
  conferenceType: string;
  format: string;
  activityName: string;
  activityDate: string;
  speakerTalkId: string;
}

export interface FeedbackAnswersDto {
  utility: number | null;
  clarity: number | null;
  examples: number | null;
  pace: number | null;
  engagement: number | null;
}

export interface FeedbackDto {
  id: string;
  talkId: string;
  createdDate: string;
  rating: number;
  answers: FeedbackAnswersDto | null;
  comment: string | null;
  positive: string;
  negative: string;
  improvementSuggestions: string;
}

export interface PublicFeedbackForm {
  topic: string;
  eventName: string;
  date: string | null;
}

export interface MediaFileDto {
  id: string;
  name: string;
  sizeBytes: number | null;
  talkId: string | null;
  createdDate: string;
}

export type EventFormatCode = 'OFFLINE' | 'ONLINE' | 'HYBRID';

export interface EventDto {
  id: string;
  ownerId: number;
  ownerName: string | null;
  own: boolean;
  name: string;
  date: string;
  cfp: string | null;
  city: string | null;
  format: EventFormatCode;
  topic: string;
  audience: string | null;
  description: string | null;
  state: 'draft' | 'published';
}

export interface EventBody {
  name: string;
  date: string;
  cfp: string | null;
  city: string;
  format: EventFormatCode;
  topic: string;
  audience: string;
  description: string;
}

export interface ApplicationDto {
  id: string;
  eventId: string;
  speakerId: number;
  speakerName: string | null;
  talkId: string | null;
  topic: string;
  at: string;
  status: 'sent' | 'accepted' | 'reserve' | 'rejected';
  talkChange: { talkId: string | null; topic: string } | null;
}

export interface InvitationDto {
  id: string;
  eventId: string;
  speakerId: number;
  speakerName: string | null;
  topic: string;
  date: string;
  status: 'sent' | 'accepted' | 'declined';
}

export interface NotificationDto {
  id: string;
  text: string;
  createdDate: string;
  read: boolean;
}

export interface CatalogSpeakerDto {
  id: number;
  name: string;
  position: string;
  company: string;
  city: string;
  skills: string;
  about: string;
  preferences: string;
  feedbackCount: number;
  speechCount: number;
}

export interface CatalogSpeakerDetailsDto {
  profile: CatalogSpeakerDto;
  speeches: { id: string; talkId: string | null; topic: string; event: string; date: string | null }[];
  talks: SpeakerTalkDto[];
  feedback: FeedbackDto[];
}

export interface ProducerPlanDto {
  id: string;
  speakerId: number;
  status: 'ready' | 'insufficient_data' | 'failed';
  message: string | null;
  plan: {
    summary: string;
    strengths: { title: string; mentions: number; feedbackIds: string[] }[];
    growthAreas: { title: string; mentions: number; feedbackIds: string[] }[];
    steps: { title: string; why: string; dueDate: string | null; evidence: { type: string; id: string; label: string }[] }[];
  } | null;
  createdDate: string;
}

export interface TalentScoreDto {
  id: number;
  score: number;
  reason: string;
  confidence: 'low' | 'medium' | 'high';
}
