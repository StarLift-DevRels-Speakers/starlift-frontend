import { createContext } from 'react';
import type { PurchaseType } from '@/features/billing/pricing';
import type {
  AiOutcome,
  ApplicationStatus,
  InvitationStatus,
  MediaFile,
  Speech,
  Talk,
  TechEvent,
  UserProfile,
} from '@/types/domain';
import type { Role } from '@/types/role';
import type { AppState } from './appState';

/**
 * `paywall` — the operation needs a one-time purchase or a subscription;
 * `not_ready` — not enough data for the AI producer.
 */
export type ActionResult = { ok: true } | { ok: false; error: string; reason?: 'paywall' | 'not_ready' };

/** Editable fields of a speaker's talk draft. */
export type TalkInput = Omit<Talk, 'id'>;

/** A speech: the talk draft, where and when, plus the event type and format the backend stores. */
export type SpeechInput = Omit<Speech, 'id'> & { conferenceType: string; format: string };

/** A media file picked by the speaker and the talk it belongs to. */
export type MediaInput = { file: File; talkId: MediaFile['talkId'] };

/** Editable fields of the own profile; the id is fixed. */
export type ProfileInput = Omit<UserProfile, 'id'>;

/** Editable fields of a DevRel's event. */
export type EventInput = Omit<TechEvent, 'id' | 'owner' | 'ownerName' | 'state'>;

export interface AppActions {
  /** Speaker applies to a published event's CFP with one of their talks. */
  submitApplication: (eventId: string, talkId: string) => Promise<ActionResult>;
  /** Speaker asks to switch the talk of a pending or accepted application; the DevRel approves it. */
  requestTalkChange: (applicationId: string, talkId: string) => Promise<ActionResult>;
  /** DevRel approves or rejects the speaker's requested talk change. */
  answerTalkChange: (applicationId: string, approved: boolean) => Promise<ActionResult>;
  /** DevRel decides on a pending or reserved application to one of their events. */
  decideApplication: (applicationId: string, status: Exclude<ApplicationStatus, 'sent'>) => Promise<ActionResult>;
  /** DevRel invites a speaker to one of their published events. */
  sendInvitation: (eventId: string, speakerId: string, topic: string) => Promise<ActionResult>;
  /** Speaker accepts or declines a pending invitation. */
  answerInvitation: (invitationId: string, answer: Exclude<InvitationStatus, 'sent'>) => Promise<ActionResult>;
  /** DevRel creates a draft (without `eventId`) or updates their own event. Free. */
  saveEvent: (input: EventInput, eventId?: string) => Promise<ActionResult>;
  /** DevRel publishes a draft: needs a subscription or a one-time publication right (demo billing). */
  publishEvent: (eventId: string) => Promise<ActionResult>;
  /** Test purchase of a one-time right or a monthly subscription; no money is charged. */
  purchase: (role: Role, type: PurchaseType) => ActionResult;
  /**
   * AI matching (demo). Access order: subscription → free trial → purchased attempt; without any
   * the result is a paywall. Only completed runs (results or an empty match) are charged.
   */
  runAiMatch: (role: Role, topics: string, outcome: AiOutcome) => ActionResult;
  /** Speaker creates a talk draft (without `talkId`) or edits one. */
  saveTalk: (input: TalkInput, talkId?: string) => Promise<ActionResult>;
  /** Speaker records a speech given with one of their talks. */
  addSpeech: (input: SpeechInput) => Promise<ActionResult>;
  /** AI producer: the backend builds a new plan version from the speaker's data. Needs the speaker subscription. */
  buildProducerPlan: () => Promise<ActionResult>;
  /** Speaker uploads a media file. */
  addMedia: (input: MediaInput) => Promise<ActionResult>;
  deleteMedia: (fileId: string) => Promise<ActionResult>;
  /** Saves the own profile; the name is required. */
  saveProfile: (input: ProfileInput) => Promise<ActionResult>;
  /** Marks one notification (or all, without `notificationId`) as read. */
  markNotificationsRead: (notificationId?: string) => Promise<ActionResult>;
  /** Discards the test purchases and AI results of the demo billing. */
  resetDemoBilling: () => ActionResult;
}

export const AppStateContext = createContext<AppState | null>(null);
export const AppActionsContext = createContext<AppActions | null>(null);
