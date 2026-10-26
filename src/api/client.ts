import { getSession, setSession, type Session } from '@/auth/session';

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

export interface RequestOptions {
  method?: string;
  body?: unknown;
  /** Public endpoints: no token and no refresh on 401. */
  anonymous?: boolean;
}

let refreshing: Promise<boolean> | null = null;

/** Exchanges the refresh token for a new pair; concurrent 401s wait for the same refresh. */
function refreshTokens(): Promise<boolean> {
  refreshing ??= (async () => {
    const session = getSession();
    if (!session) return false;
    try {
      const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });
      if (!response.ok) {
        setSession(null);
        return false;
      }
      const tokens = (await response.json()) as AuthTokensResponse;
      setSession({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: tokens.user });
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();
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

  if (response.status === 401 && retry && session && !options.anonymous && (await refreshTokens())) {
    return send(path, options, false);
  }
  if (response.status === 401 && !options.anonymous) setSession(null);
  if (!response.ok) throw await errorOf(response);
  return response;
}

/** JSON request; resolves to `undefined` for empty responses (201/204 without a body). */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options, true);
  const text = await response.text();
  if (!text) return undefined as T;
  const type = response.headers.get('Content-Type') ?? '';
  return (type.includes('json') ? JSON.parse(text) : text) as T;
}

/** User-facing message of any error thrown by the API layer. */
export function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : GENERIC_ERROR;
}
