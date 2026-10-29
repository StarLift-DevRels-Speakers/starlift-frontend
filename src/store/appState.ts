import type {
  AiResult,
  AppNotification,
  Application,
  Billing,
  DevelopmentPlan,
  Feedback,
  Invitation,
  MediaFile,
  Speech,
  Talk,
  TechEvent,
  UserProfile,
} from '@/types/domain';
import type { Role } from '@/types/role';

/** Data of the signed-in user loaded from the backend, plus the demo billing kept in the browser. */
export interface AppState {
  role: Role;
  profile: UserProfile;
  /** Speaker's talk drafts. */
  talks: Talk[];
  speeches: Speech[];
  /** Speaker's media files. */
  media: MediaFile[];
  /** Speaker: published events; DevRel: own events and published events of others. */
  events: TechEvent[];
  /** Speaker: own applications; DevRel: applications to own events. */
  applications: Application[];
  /** Speaker: received invitations; DevRel: invitations to own events. */
  invitations: Invitation[];
  /** Speaker's listener feedback. */
  feedback: Feedback[];
  notifications: AppNotification[];
  /** Saved versions of the speaker's AI producer plan, oldest first. */
  plans: DevelopmentPlan[];
  /** Test purchases: there is no payment backend yet, so billing stays a browser-side demo. */
  billing: Record<Role, Billing>;
  /** Last AI matching result per role (demo). */
  aiResults: Record<Role, AiResult | null>;
}

export type RemoteSlice =
  | 'profile'
  | 'talks'
  | 'speeches'
  | 'media'
  | 'events'
  | 'applications'
  | 'invitations'
  | 'feedback'
  | 'notifications'
  | 'plans';

// ---------- Demo billing, per user ----------

export type LocalDemo = Pick<AppState, 'billing' | 'aiResults'>;

const noRights = { publication: 0, match_devrel: 0, match_speaker: 0 };

export function initialLocalDemo(): LocalDemo {
  return {
    billing: {
      speaker: { expires: null, trialUsed: false, rights: { ...noRights }, history: [] },
      devrel: { expires: null, trialUsed: false, rights: { ...noRights }, history: [] },
    },
    aiResults: { speaker: null, devrel: null },
  };
}

const storageKey = (userId: number) => `starlift-demo-billing:${userId}`;

export function loadLocalDemo(userId: number): LocalDemo {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const parsed = raw ? (JSON.parse(raw) as Partial<LocalDemo>) : null;
    if (parsed?.billing?.speaker && parsed.billing.devrel && parsed.aiResults) return parsed as LocalDemo;
  } catch {
    // Storage may be unavailable or hold data of an older version: start from a clean demo.
  }
  return initialLocalDemo();
}

export function saveLocalDemo(userId: number, demo: LocalDemo): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(demo));
  } catch {
    // Not critical: test purchases then live only until a reload.
  }
}
