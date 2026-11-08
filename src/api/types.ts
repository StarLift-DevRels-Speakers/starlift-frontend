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

// ---------- Competition (gamification) ----------

export type LeagueCode = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
export type LeagueZone = 'PROMOTION' | 'SAFE' | 'DEMOTION';
export type PointReason =
  | 'TALK_CREATED'
  | 'TALK_DELETED'
  | 'FEEDBACK_RECEIVED'
  | 'HIGH_RATING_FEEDBACK'
  | 'PROFILE_COMPLETED'
  | 'DAILY_CHECK_IN'
  | 'STREAK_BONUS'
  | 'MANUAL';
export type BadgeCategory = 'ACTIVITY' | 'LEAGUE' | 'SEASON';

export interface SeasonDto {
  id: number;
  startsAt: string;
  endsAt: string;
  status: 'ACTIVE' | 'CLOSED';
  closedAt: string | null;
}

export interface EarnedBadgeDto {
  code: string;
  title: string;
  description: string;
  category: BadgeCategory;
  seasonId: number | null;
  awardedDate: string;
}

export interface BadgeDefinitionDto {
  code: string;
  title: string;
  description: string;
  category: BadgeCategory;
  repeatable: boolean;
}

export interface GamificationProfileDto {
  speakerId: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatarColor: string | null;
  league: LeagueCode;
  weeklyPoints: number;
  weeklyRank: number;
  leagueSize: number;
  zone: LeagueZone;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  checkedInToday: boolean;
  season: SeasonDto;
  badges: EarnedBadgeDto[];
}

export interface CheckInDto {
  alreadyCheckedIn: boolean;
  awardedPoints: number;
  currentStreak: number;
  longestStreak: number;
  newBadges: EarnedBadgeDto[];
}

export interface LeaderboardEntryDto {
  rank: number;
  speakerId: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatarColor: string | null;
  league: LeagueCode;
  points: number;
  zone: LeagueZone | null;
  me: boolean;
}

export interface LeagueLeaderboardDto {
  league: LeagueCode;
  season: SeasonDto;
  promotionCount: number;
  demotionCount: number;
  entries: LeaderboardEntryDto[];
}

export interface GlobalLeaderboardDto {
  period: 'WEEK' | 'ALL_TIME';
  season: SeasonDto | null;
  entries: LeaderboardEntryDto[];
}

export interface LeagueDto {
  code: LeagueCode;
  title: string;
  order: number;
  participants: number;
  promotionCount: number;
  demotionCount: number;
}

export interface PointTransactionDto {
  id: string;
  speakerId: number;
  points: number;
  reason: PointReason;
  sourceId: string | null;
  comment: string | null;
  awardedBy: number | null;
  createdDate: string;
}

// ---------- Audience fit ----------

export type AudienceLevel = 'junior' | 'middle' | 'senior' | 'lead';
export type AudienceSegment = 'schoolchildren' | 'students' | 'beginners' | 'practitioners' | 'experts';
export type AudienceConfidence = 'low' | 'medium' | 'high';
export type VisualExpectation = 'low' | 'medium' | 'high';

/** Expected audience of an event, inferred by the backend from the event data or set by its DevRel. */
export interface AudienceProfileDto {
  summary: string | null;
  /** Who will mostly be in the room; the backend picks the largest share of `experience`. Missing in older profiles. */
  primarySegment?: AudienceSegment | null;
  segmentLabel?: string | null;
  /** What in the event data points to this segment. */
  segmentReason?: string | null;
  /** Share of each segment in percent, summing to 100. */
  experience?: Partial<Record<AudienceSegment, number>>;
  /** Only when the age follows directly from the event data. */
  ageRange?: { from: number | null; to: number | null } | null;
  visualExpectation?: VisualExpectation;
  /** Share of each level in percent, summing to 100; empty when the level is unclear. */
  levels: Partial<Record<AudienceLevel, number>>;
  roles: string[];
  domains: string[];
  expectations: string[];
  assumedKnowledge: string[];
  turnoffs: string[];
  confidence: AudienceConfidence;
  evidence: { source: string; id: string | null; label: string }[];
}

export interface AudienceProfileResponseDto {
  eventId: string;
  status: 'ready' | 'failed';
  message: string | null;
  profile: AudienceProfileDto | null;
  /** Set by the event's DevRel; not recomputed until they reset it. */
  manual: boolean;
  model: string | null;
  promptVersion: string | null;
  updatedDate: string;
}

export interface AudienceProfileUpdate {
  summary: string;
  primarySegment: AudienceSegment | null;
  segmentLabel: string;
  ageFrom: number | null;
  ageTo: number | null;
  visualExpectation: VisualExpectation | null;
  levels: Record<AudienceLevel, number>;
  roles: string[];
  domains: string[];
  expectations: string[];
  assumedKnowledge: string[];
  turnoffs: string[];
}

export type AudienceVerdict = 'fits' | 'partially' | 'not_fits';

export interface AudienceFitResultDto {
  verdict: AudienceVerdict;
  /** 0..100, computed by the backend from the criteria scores. */
  score: number;
  summary: string | null;
  criteria: { key: string; label: string; score: number; comment: string | null }[];
  /** `label` and `quote` come from the material itself: "Слайд 3" and its text. */
  issues: { fragmentId: string; label: string; quote: string | null; problem: string; fix: string | null }[];
  strengths: { fragmentId: string; label: string; quote: string; why: string }[];
  profileConfidence: AudienceConfidence;
  truncated: boolean;
  primarySegment?: AudienceSegment | null;
  segmentLabel?: string | null;
  /** Counted by the backend from the file; null when the material has no slides. */
  visual?: VisualStatsDto | null;
}

export interface VisualStatsDto {
  slides: number;
  slidesWithImages: number;
  imageOnlySlides: number;
  averageWords: number;
  /** Labels like "Слайд 3". */
  textOnlySlides: string[];
  wallOfTextSlides: string[];
}

export type AudienceFitStatus = 'pending' | 'ready' | 'insufficient_data' | 'failed';

export interface AudienceFitCheckDto {
  id: string;
  eventId: string;
  eventName: string | null;
  speakerId: number;
  talkId: string | null;
  talkName: string | null;
  mediaId: string | null;
  fileName: string | null;
  trigger: 'manual' | 'upload' | 'application';
  status: AudienceFitStatus;
  message: string | null;
  result: AudienceFitResultDto | null;
  createdDate: string;
  updatedDate: string;
}

export interface AudienceFitRequest {
  eventId: string;
  talkId?: string;
  mediaId?: string;
}
