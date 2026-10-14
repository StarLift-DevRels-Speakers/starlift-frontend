import type { AiPayment } from '@/features/ai/aiMatch';
import type {
  AiResult,
  Application,
  ApplicationStatus,
  AppNotification,
  DevelopmentPlan,
  Feedback,
  Invitation,
  InvitationStatus,
  MediaFile,
  Purchase,
  RightType,
  Speech,
  Talk,
  TechEvent,
  UserProfile,
} from '@/types/domain';
import type { Role } from '@/types/role';
import { todayKey } from '@/utils/date';
import type { DemoState } from './demoState';

export type DemoAction =
  | { type: 'application/submitted'; application: Application }
  | { type: 'application/decided'; applicationId: string; status: ApplicationStatus }
  | { type: 'invitation/sent'; invitation: Invitation }
  | { type: 'invitation/answered'; invitationId: string; status: InvitationStatus }
  | { type: 'notification/added'; role: Role; notification: AppNotification }
  | { type: 'event/saved'; event: TechEvent }
  | { type: 'event/published'; eventId: string; spentRight: boolean }
  | { type: 'billing/rightPurchased'; role: Role; right: RightType; purchase: Purchase }
  | { type: 'billing/subscribed'; role: Role; expires: string; purchase: Purchase }
  /** `charge` — what to spend: the trial, a purchased right, or nothing (subscription or a failed run). */
  | { type: 'feedback/submitted'; feedback: Feedback }
  | { type: 'talk/saved'; talk: Talk }
  | { type: 'speech/added'; speech: Speech }
  | { type: 'profile/saved'; role: Role; profile: UserProfile }
  | { type: 'media/added'; file: MediaFile }
  | { type: 'media/deleted'; fileId: string }
  | { type: 'plan/built'; plan: DevelopmentPlan }
  /** Without `notificationId` — marks all of the role's notifications as read. */
  | { type: 'notifications/read'; role: Role; notificationId?: string }
  | { type: 'ai/completed'; role: Role; result: AiResult; right: RightType; charge: Exclude<AiPayment, 'subscription'> | null };

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'application/submitted':
      return { ...state, applications: [action.application, ...state.applications] };
    case 'application/decided':
      return {
        ...state,
        applications: state.applications.map((application) =>
          application.id === action.applicationId ? { ...application, status: action.status } : application,
        ),
      };
    case 'invitation/sent':
      return { ...state, invitations: [action.invitation, ...state.invitations] };
    case 'invitation/answered':
      return {
        ...state,
        invitations: state.invitations.map((invitation) =>
          invitation.id === action.invitationId ? { ...invitation, status: action.status } : invitation,
        ),
      };
    case 'notification/added':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          [action.role]: [action.notification, ...state.notifications[action.role]],
        },
      };
    case 'event/saved': {
      const exists = state.events.some((event) => event.id === action.event.id);
      return {
        ...state,
        events: exists
          ? state.events.map((event) => (event.id === action.event.id ? action.event : event))
          : [action.event, ...state.events],
      };
    }
    case 'event/published': {
      const devrel = state.billing.devrel;
      return {
        ...state,
        events: state.events.map((event) => (event.id === action.eventId ? { ...event, state: 'published' } : event)),
        billing: action.spentRight
          ? { ...state.billing, devrel: { ...devrel, rights: { ...devrel.rights, publication: devrel.rights.publication - 1 } } }
          : state.billing,
      };
    }
    case 'billing/rightPurchased': {
      const current = state.billing[action.role];
      return {
        ...state,
        billing: {
          ...state.billing,
          [action.role]: {
            ...current,
            rights: { ...current.rights, [action.right]: current.rights[action.right] + 1 },
            history: [action.purchase, ...current.history],
          },
        },
      };
    }
    case 'billing/subscribed': {
      const current = state.billing[action.role];
      return {
        ...state,
        billing: {
          ...state.billing,
          [action.role]: { ...current, expires: action.expires, history: [action.purchase, ...current.history] },
        },
      };
    }
    case 'notifications/read':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          [action.role]: state.notifications[action.role].map((notification) =>
            !action.notificationId || notification.id === action.notificationId ? { ...notification, read: true } : notification,
          ),
        },
      };
    case 'talk/saved': {
      const exists = state.talks.some((talk) => talk.id === action.talk.id);
      return {
        ...state,
        talks: exists
          ? state.talks.map((talk) => (talk.id === action.talk.id ? action.talk : talk))
          : [action.talk, ...state.talks],
      };
    }
    case 'plan/built':
      return { ...state, plans: [...state.plans, action.plan] };
    case 'media/added':
      return { ...state, media: [action.file, ...state.media] };
    case 'media/deleted':
      return { ...state, media: state.media.filter((file) => file.id !== action.fileId) };
    case 'profile/saved':
      return { ...state, profiles: { ...state.profiles, [action.role]: action.profile } };
    case 'speech/added':
      return { ...state, speeches: [action.speech, ...state.speeches] };
    case 'feedback/submitted':
      return { ...state, feedback: [...state.feedback, action.feedback] };
    case 'ai/completed': {
      const current = state.billing[action.role];
      const billing = {
        ...current,
        trialUsed: current.trialUsed || action.charge === 'trial',
        rights: action.charge === 'right'
          ? { ...current.rights, [action.right]: current.rights[action.right] - 1 }
          : current.rights,
      };
      return {
        ...state,
        billing: { ...state.billing, [action.role]: billing },
        aiResults: { ...state.aiResults, [action.role]: action.result },
      };
    }
  }
}

export function createId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10);
}

export function notificationOf(text: string): AppNotification {
  return { id: createId(), at: todayKey(), text, read: false };
}
