import { createContext } from 'react';
import type { PurchaseType } from '@/features/billing/pricing';
import type {
  AiOutcome,
  ApplicationStatus,
  FeedbackQuestionKey,
  InvitationStatus,
  MediaFile,
  Speech,
  Talk,
  TechEvent,
  UserProfile,
} from '@/types/domain';
import type { Role } from '@/types/role';
import type { DemoState } from './demoState';

/** `paywall` — the operation needs a one-time purchase or a subscription. */
export type ActionResult = { ok: true } | { ok: false; error: string; reason?: 'paywall' };

/** Editable fields of a speaker's talk and of a past/planned speech. */
export type TalkInput = Omit<Talk, 'id'>;
export type SpeechInput = Omit<Speech, 'id'>;

/** Metadata of a media file picked by the speaker. */
export type MediaInput = Omit<MediaFile, 'id'>;

/** Editable fields of the own profile; the id is fixed. */
export type ProfileInput = Omit<UserProfile, 'id'>;

/** Editable fields of a DevRel's event. */
export type EventInput = Omit<TechEvent, 'id' | 'owner' | 'state'>;

export interface DemoActions {
  /** Speaker applies to a published event's CFP with one of their talks. */
  submitApplication: (eventId: string, talkId: string) => ActionResult;
  /** Speaker asks to switch the talk of a pending or accepted application; the DevRel approves it. */
  requestTalkChange: (applicationId: string, talkId: string) => ActionResult;
  /** DevRel approves or rejects the speaker's requested talk change. */
  answerTalkChange: (applicationId: string, approved: boolean) => ActionResult;
  /** DevRel decides on a pending or reserved application to one of their events. */
  decideApplication: (applicationId: string, status: Exclude<ApplicationStatus, 'sent'>) => ActionResult;
  /** DevRel invites the speaker to one of their published events. */
  sendInvitation: (eventId: string, topic: string) => ActionResult;
  /** Speaker accepts or declines a pending invitation. */
  answerInvitation: (invitationId: string, answer: Exclude<InvitationStatus, 'sent'>) => ActionResult;
  /** DevRel creates a draft (without `eventId`) or updates their own event. Free. */
  saveEvent: (input: EventInput, eventId?: string) => ActionResult;
  /** DevRel publishes a draft: needs a subscription or a one-time publication right. */
  publishEvent: (eventId: string) => ActionResult;
  /** Test purchase of a one-time right or a monthly subscription; no money is charged. */
  purchase: (role: Role, type: PurchaseType) => ActionResult;
  /**
   * AI matching. Access order: subscription → free trial → purchased attempt; without any
   * the result is a paywall. Only completed runs (results or an empty match) are charged.
   */
  runAiMatch: (role: Role, topics: string, outcome: AiOutcome) => ActionResult;
  /** Anonymous listener feedback via the public link; `token` must match the speaker's current link. */
  submitFeedback: (token: string, answers: Partial<Record<FeedbackQuestionKey, number>>, comment: string) => ActionResult;
  /** Speaker creates a talk (without `talkId`) or edits one. */
  saveTalk: (input: TalkInput, talkId?: string) => ActionResult;
  /** Speaker records a speech given with one of their talks. */
  addSpeech: (input: SpeechInput) => ActionResult;
  /**
   * AI producer: saves a new plan version built from the current facts. Needs the speaker
   * subscription (`reason: 'paywall'`) and enough data (3 reviews, a talk and a speech).
   */
  buildProducerPlan: () => ActionResult;
  /** Speaker adds a file to the media list; the content itself is not uploaded. */
  addMedia: (input: MediaInput) => ActionResult;
  /** Speaker removes a file from the media list. */
  deleteMedia: (fileId: string) => ActionResult;
  /** Saves the role's own profile; the name is required. */
  saveProfile: (role: Role, input: ProfileInput) => ActionResult;
  /** Marks one notification (or all, without `notificationId`) of the role as read. */
  markNotificationsRead: (role: Role, notificationId?: string) => ActionResult;
  /** Restores the initial demo data (and issues a new feedback link). */
  resetDemo: () => ActionResult;
}

export const DemoStateContext = createContext<DemoState | null>(null);
export const DemoActionsContext = createContext<DemoActions | null>(null);
