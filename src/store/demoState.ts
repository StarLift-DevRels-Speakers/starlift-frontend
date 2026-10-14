import * as seed from '@/mocks/demo';
import { profiles } from '@/mocks/users';
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

/** Whole demo world shared by both roles, as in the mockup's `state`. */
export interface DemoState {
  talks: Talk[];
  speeches: Speech[];
  /** Speaker's media files (metadata only). */
  media: MediaFile[];
  events: TechEvent[];
  applications: Application[];
  invitations: Invitation[];
  feedback: Feedback[];
  /** Own profiles of the demo speaker and DevRel, edited on "Мой профиль". */
  profiles: Record<Role, UserProfile>;
  notifications: Record<Role, AppNotification[]>;
  billing: Record<Role, Billing>;
  /** Saved versions of the speaker's AI producer plan, oldest first. */
  plans: DevelopmentPlan[];
  /** Last AI matching result per role. */
  aiResults: Record<Role, AiResult | null>;
  /** Secret part of the public feedback link; the form opens only with the matching token. */
  feedbackToken: string;
}

function createToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function createInitialState(): DemoState {
  return {
    talks: seed.talks,
    speeches: seed.speeches,
    media: seed.media,
    events: seed.events,
    applications: seed.applications,
    invitations: seed.invitations,
    feedback: seed.feedback,
    profiles,
    notifications: seed.notifications,
    billing: seed.billing,
    plans: [],
    aiResults: { speaker: null, devrel: null },
    feedbackToken: createToken(),
  };
}

// ---------- Persistence ----------
// Like the mockup, the demo survives reloads and is shared between tabs (e.g. the public
// feedback form opened in a new tab). Bump the version when the state shape changes.
export const STORAGE_KEY = 'starlift-demo-v4';

export function loadState(): DemoState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? parseState(saved) : null;
    if (parsed) return parsed;
  } catch {
    // Storage may be unavailable (private mode, blocked site data): fall back to fresh demo data.
  }
  // Saved right away so other tabs start from the same data (e.g. the same feedback link token).
  const fresh = createInitialState();
  saveState(fresh);
  return fresh;
}

export function saveState(state: DemoState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Not critical: the demo keeps working in memory.
  }
}

/** Parses saved state; returns null for data from an incompatible version. */
export function parseState(raw: string): DemoState | null {
  try {
    const parsed = JSON.parse(raw) as Partial<DemoState>;
    return typeof parsed.feedbackToken === 'string' && Array.isArray(parsed.events) && Boolean(parsed.profiles) ? (parsed as DemoState) : null;
  } catch {
    return null;
  }
}
