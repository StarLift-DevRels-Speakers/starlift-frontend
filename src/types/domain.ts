// Domain entities of the StarLift MVP, mirrored from the mockup's demo state.
// Dates are ISO strings: `YYYY-MM-DD` for calendar days, full ISO for timestamps.

export interface Talk {
  id: string;
  name: string;
  topic: string;
  description: string;
}

/** A talk the speaker has given (or will give) at a specific event. */
export interface Speech {
  id: string;
  talkId: string;
  event: string;
  date: string;
}

export type EventFormat = 'Офлайн' | 'Онлайн' | 'Гибрид';
export type EventState = 'draft' | 'published';

/** Named TechEvent to avoid clashing with the DOM `Event`. */
export interface TechEvent {
  id: string;
  /** `devrel` — created by the current DevRel account. */
  owner: 'devrel' | 'other';
  name: string;
  date: string;
  /** CFP deadline. */
  cfp?: string;
  city: string;
  format: EventFormat;
  topic: string;
  audience: string;
  description: string;
  state: EventState;
}

/** `sent` — awaiting the DevRel's decision. */
export type ApplicationStatus = 'sent' | 'accepted' | 'reserve' | 'rejected';

/** Speaker's application to an event's CFP. */
export interface Application {
  id: string;
  eventId: string;
  talkId: string;
  topic: string;
  at: string;
  status: ApplicationStatus;
  /** Talk the speaker asked to switch to; applied only after the DevRel approves. */
  talkChange?: { talkId: string; topic: string };
}

export type InvitationStatus = 'sent' | 'accepted' | 'declined';

/** DevRel's invitation of a speaker to an event. */
export interface Invitation {
  id: string;
  eventId: string;
  status: InvitationStatus;
  date: string;
  topic: string;
}

export type FeedbackQuestionKey = 'utility' | 'clarity' | 'examples' | 'pace' | 'engagement';

/** Anonymous listener feedback; answers are indexes of the predefined options. */
export interface Feedback {
  id: string;
  at: string;
  answers: Record<FeedbackQuestionKey, number>;
  comment: string;
}

/** Named AppNotification to avoid clashing with the DOM `Notification`. */
export interface AppNotification {
  id: string;
  at: string;
  text: string;
  read: boolean;
}

/** One-time paid operations; each purchase grants a single use. */
export type RightType = 'publication' | 'match_devrel' | 'match_speaker';

export interface Purchase {
  id: string;
  title: string;
  price: number;
  at: string;
  /** Test purchase in the MVP: no money is charged. */
  demo: true;
}

export interface Billing {
  /** Subscription end date; null when there is no subscription. */
  expires: string | null;
  trialUsed: boolean;
  /** Remaining one-time rights by operation. */
  rights: Record<RightType, number>;
  history: Purchase[];
}

/** Outcome of an AI matching request; the demo lets the user pick it to show every UI state. */
export type AiOutcome = 'success' | 'empty' | 'insufficient' | 'error';

export interface AiResult {
  kind: AiOutcome;
  at: string;
  topics: string;
}

/** Own profile of a speaker or a DevRel (mockup `state.speaker` / `state.devrel`). */
export interface UserProfile {
  /** Public profile id, used in catalog links. */
  id: string;
  name: string;
  position: string;
  company: string;
  city: string;
  /** Comma-separated competencies and topics: used by search and AI matching. Speaker only. */
  skills: string;
  /** Preferred formats, regions and audience. Speaker only. */
  preferences: string;
  about: string;
}

/** Speaker's media file. The demo keeps only metadata: the file content is never uploaded. */
export interface MediaFile {
  id: string;
  name: string;
  /** Related talk; empty when the file is not tied to a talk. */
  talkId: string;
  sizeBytes: number;
}

/** One action of an AI producer plan; `feedbackIds` are the listener reviews it is based on. */
export interface PlanStep {
  phase: string;
  title: string;
  description: string;
  /** Day key of the deadline. */
  due: string;
  feedbackIds: string[];
}

/** Saved version of the speaker's development plan. Each rebuild adds a new version. */
export interface DevelopmentPlan {
  id: string;
  version: number;
  /** Day key of creation. */
  at: string;
  strong: string;
  improve: string;
  /** Snapshot of the data the plan was built from. */
  source: string;
  action: string;
  steps: PlanStep[];
}
