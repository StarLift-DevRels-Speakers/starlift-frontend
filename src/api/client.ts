import { getSession, setSession, syncSession, type Session } from '@/auth/session';

// Thin fetch wrapper over the backend REST API. Requests go to `/api` on the same origin:
// nginx proxies it in production, the Vite dev server in development.

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

/** Backend error with the user-facing message from the RFC 7807 `detail`. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  user: Session['user'];
}

const GENERIC_ERROR = 'Что-то пошло не так. Попробуйте еще раз.';
const NETWORK_ERROR = 'Сервер недоступен. Проверьте подключение и попробуйте еще раз.';
const UNEXPECTED_RESPONSE = 'Сервер вернул неожиданный ответ. Попробуйте еще раз позже.';

export interface RequestOptions {
  method?: string;
  body?: unknown;
  /** Public endpoints: no token and no refresh on 401. */
  anonymous?: boolean;
}

/** `rejected` — the server refused the refresh token; `offline` — no answer, the session is kept. */
type RefreshResult = 'ok' | 'rejected' | 'offline';

let refreshing: Promise<RefreshResult> | null = null;

/** One refresh at a time across tabs, where the browser supports Web Locks. */
function withRefreshLock<T>(task: () => Promise<T>): Promise<T> {
  return 'locks' in navigator ? navigator.locks.request('starlift-token-refresh', task) : task();
}

async function refreshOnce(staleAccessToken: string): Promise<RefreshResult> {
  // Another tab may have refreshed already: then its new pair is in storage.
  const session = syncSession();
  if (!session) return 'rejected';
  if (session.accessToken !== staleAccessToken) return 'ok';

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });
  } catch {
    return 'offline';
  }
  if ([400, 401, 403].includes(response.status)) {
    setSession(null);
    return 'rejected';
  }
  if (!response.ok) return 'offline';
  try {
    const tokens = (await response.json()) as AuthTokensResponse;
    setSession({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: tokens.user });
    return 'ok';
  } catch {
    return 'offline';
  }
}

/** Exchanges the refresh token for a new pair; concurrent 401s wait for the same refresh. */
function refreshTokens(staleAccessToken: string): Promise<RefreshResult> {
  refreshing ??= withRefreshLock(() => refreshOnce(staleAccessToken)).finally(() => {
    refreshing = null;
  });
  return refreshing;
}

async function errorOf(response: Response): Promise<ApiError> {
  let message = GENERIC_ERROR;
  try {
    const problem = (await response.json()) as { detail?: string; title?: string };
    message = problem.detail || problem.title || message;
  } catch {
    // Not a JSON problem: keep the generic message.
  }
  return new ApiError(response.status, message);
}

async function send(path: string, options: RequestOptions, retry: boolean): Promise<Response> {
  const headers: Record<string, string> = {};
  const isForm = options.body instanceof FormData;
  if (options.body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
  const session = getSession();
  if (session && !options.anonymous) headers.Authorization = `Bearer ${session.accessToken}`;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : isForm ? (options.body as FormData) : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, NETWORK_ERROR);
  }

  if (response.status === 401 && session && !options.anonymous) {
    if (!retry) {
      // Rejected even with a fresh token: the session is no longer valid.
      setSession(null);
    } else {
      const refreshed = await refreshTokens(session.accessToken);
      if (refreshed === 'ok') return send(path, options, false);
      if (refreshed === 'offline') throw new ApiError(0, NETWORK_ERROR);
    }
  }
  if (!response.ok) throw await errorOf(response);
  return response;
}

/** JSON request; resolves to `undefined` for empty responses (201/204 without a body). */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options, true);
  const text = await response.text();
  if (!text) return undefined as T;
  // A page instead of JSON means /api did not reach the backend (e.g. the SPA fallback answered).
  const type = response.headers.get('Content-Type') ?? '';
  if (!type.includes('json')) throw new ApiError(response.status, UNEXPECTED_RESPONSE);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(response.status, UNEXPECTED_RESPONSE);
  }
}

/** User-facing message of any error thrown by the API layer. */
export function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : GENERIC_ERROR;
}
