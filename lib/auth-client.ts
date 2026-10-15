// Client-side JWT auth against the selected Django backend (lib/backend.ts).
//
// Tokens live in cookies (not httpOnly) so BOTH the browser fetch (to set the
// Authorization header) and the edge proxy (to gate routes) can read them.
// Real security is enforced by the backend permission classes; the cookies only
// drive UX gating.
//
// The session is the REFRESH token, not the access token. Access tokens are
// deliberately short-lived and are replaced from the refresh token on demand —
// an expired access token means "fetch a new one", never "log the user out".
// `pf_refresh` is therefore what proxy.ts gates on.
//
// Cookie lifetimes are read from each token's own `exp` claim rather than
// hardcoded, so a cookie can neither outlive the token it holds (401s on a
// session the UI believes is live) nor die before it (logging out a user whose
// token is still perfectly valid).

import { backendFetch } from './backend';

export const ACCESS_COOKIE = 'pf_access';
export const REFRESH_COOKIE = 'pf_refresh';
export const ROLE_COOKIE = 'pf_role';
export const USER_COOKIE = 'pf_user';

// Renew this far ahead of expiry. Covers clock skew between browser and
// backend plus the round trip, so a request is never sent with a token that
// expires in flight.
const REFRESH_SKEW_SEC = 120;

const WEEK_SEC = 60 * 60 * 24 * 7;
const HOUR_SEC = 60 * 60;

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'member';
}

// ---- cookie helpers ---------------------------------------------------------

function setCookie(name: string, value: string, maxAgeSec: number) {
  if (typeof document === 'undefined') return;
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  const maxAge = Math.max(0, Math.floor(maxAgeSec));
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function delCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

// ---- token inspection -------------------------------------------------------

/** Seconds of life left in a JWT, or null when there is no readable expiry. */
export function secondsUntilExpiry(token: string | null): number | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const exp = JSON.parse(json)?.exp;
    if (typeof exp !== 'number') return null;
    return exp - Math.floor(Date.now() / 1000);
  } catch {
    // Not a JWT we can read. Callers treat null as "assume it needs renewing"
    // rather than guessing a lifetime.
    return null;
  }
}

/** Store a token under a cookie that dies with it. */
function setTokenCookie(name: string, token: string, fallbackSec: number) {
  const ttl = secondsUntilExpiry(token);
  setCookie(name, token, ttl === null ? fallbackSec : ttl);
}

// ---- token accessors --------------------------------------------------------

export function getAccessToken(): string | null {
  return getCookie(ACCESS_COOKIE);
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_COOKIE);
}

export function getRole(): 'admin' | 'member' | null {
  return (getCookie(ROLE_COOKIE) as 'admin' | 'member' | null) || null;
}

export function getUser(): AuthUser | null {
  const raw = getCookie(USER_COOKIE);
  try {
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

/**
 * Whether a session exists at all.
 *
 * Keyed on the refresh token, not the access token: an expired access token is
 * a routine condition that resolves itself, and treating it as signed-out is
 * exactly what logs people out mid-session.
 */
export function hasSession(): boolean {
  return !!getRefreshToken();
}

export function isAuthenticated(): boolean {
  return hasSession();
}

export function isAdmin(): boolean {
  return getRole() === 'admin';
}

export function authHeaders(): Record<string, string> {
  const t = getAccessToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function persistSession(access: string, refresh: string, user: AuthUser) {
  setTokenCookie(ACCESS_COOKIE, access, HOUR_SEC);
  setTokenCookie(REFRESH_COOKIE, refresh, WEEK_SEC);
  // Role and user ride along with the session, so they expire with it.
  const sessionTtl = secondsUntilExpiry(refresh) ?? WEEK_SEC;
  setCookie(ROLE_COOKIE, user.role, sessionTtl);
  setCookie(USER_COOKIE, JSON.stringify(user), sessionTtl);
}

// ---- flows ------------------------------------------------------------------

export async function login(username: string, password: string): Promise<AuthUser> {
  const res = await backendFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || 'Invalid username or password.');
  persistSession(data.access, data.refresh, data.user);
  return data.user as AuthUser;
}

export async function register(input: {
  username: string;
  password: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}): Promise<void> {
  const res = await backendFetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data?.username?.[0] || data?.password?.[0] || data?.email?.[0] || data?.detail || 'Registration failed.';
    throw new Error(msg);
  }
}

// One refresh at a time. A page easily has three or four requests in flight
// (listing, stats, the live-update poll) and without this they would each fire
// their own. The backend rotates refresh tokens, so those calls would race to
// write different tokens into the same cookie — and the moment
// BLACKLIST_AFTER_ROTATION is turned on, the losers become invalid and the
// user is logged out.
let inFlightRefresh: Promise<RefreshOutcome> | null = null;

/**
 * - `ok`          — a new access token is in place.
 * - `rejected`    — the backend refused the refresh token. The session is over.
 * - `unavailable` — the backend could not be reached, or there was nothing to
 *                   refresh with. Says nothing about whether the session is
 *                   still good, so callers must not log the user out on it.
 */
export type RefreshOutcome = 'ok' | 'rejected' | 'unavailable';

export function refreshAccessDetailed(): Promise<RefreshOutcome> {
  if (inFlightRefresh) return inFlightRefresh;
  inFlightRefresh = doRefresh().finally(() => {
    inFlightRefresh = null;
  });
  return inFlightRefresh;
}

export async function refreshAccess(): Promise<boolean> {
  return (await refreshAccessDetailed()) === 'ok';
}

async function doRefresh(): Promise<RefreshOutcome> {
  const refresh = getRefreshToken();
  if (!refresh) return 'unavailable';

  let res: Response;
  try {
    res = await backendFetch('/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
  } catch {
    // Offline, or the backend is down. Not a dead session — keep the cookies
    // so the next attempt can still succeed.
    return 'unavailable';
  }

  // 401/403 is the backend saying the token is expired, rotated away or
  // blacklisted. A 5xx or a proxy error is the backend having a bad day.
  if (res.status === 401 || res.status === 403) return 'rejected';
  if (!res.ok) return 'unavailable';

  const data = await res.json().catch(() => ({}));
  // A 200 with no access token should not happen; treat it as a transport
  // problem rather than evidence the session is dead.
  if (!data.access) return 'unavailable';

  setTokenCookie(ACCESS_COOKIE, data.access, HOUR_SEC);
  // ROTATE_REFRESH_TOKENS is on, so a new refresh token comes back each time
  // and the session extends for as long as it stays in use.
  if (data.refresh) {
    setTokenCookie(REFRESH_COOKIE, data.refresh, WEEK_SEC);
    const sessionTtl = secondsUntilExpiry(data.refresh);
    if (sessionTtl !== null) {
      const role = getCookie(ROLE_COOKIE);
      const user = getCookie(USER_COOKIE);
      if (role) setCookie(ROLE_COOKIE, role, sessionTtl);
      if (user) setCookie(USER_COOKIE, user, sessionTtl);
    }
  }
  return 'ok';
}

/**
 * Renew the access token before it expires rather than after.
 *
 * Called ahead of every API request and when the tab regains focus. A 401
 * retry alone is not enough: a navigation never touches the API, so it would
 * reach the edge proxy with no usable token at all.
 *
 * Ends the session when the backend rejects the refresh token. That decision
 * cannot be left to the 401 handler, because the listing endpoints are public
 * — they answer 200 without a token, so a dead session would otherwise keep
 * rendering a signed-in header indefinitely and only surface the next time
 * the user touched something gated.
 *
 * Returns false when the session is gone or the backend is unreachable; the
 * two are distinguished internally, and only the former logs anyone out.
 */
export async function ensureFreshAccess(): Promise<boolean> {
  if (!hasSession()) return false;
  const left = secondsUntilExpiry(getAccessToken());
  // null = no access cookie, or one we cannot read: renew either way.
  if (left !== null && left > REFRESH_SKEW_SEC) return true;

  const outcome = await refreshAccessDetailed();
  if (outcome === 'rejected') {
    endSession();
    return false;
  }
  return outcome === 'ok';
}

export function logout() {
  [ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE, USER_COOKIE].forEach(delCookie);
}

/**
 * The session is unrecoverable: drop it and send the user to sign in again,
 * remembering where they were.
 *
 * A full-page replace rather than a router push, because the cookies have just
 * changed and the edge proxy has to see that.
 */
export function endSession() {
  logout();
  if (typeof window === 'undefined') return;
  const { pathname, search } = window.location;
  // Already somewhere public — no bounce, and no redirect loop.
  if (pathname === '/' || pathname === '/login' || pathname === '/register') return;
  const next = encodeURIComponent(pathname + search);
  window.location.replace(`/login?next=${next}&expired=1`);
}
