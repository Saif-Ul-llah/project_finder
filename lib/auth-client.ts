// Client-side JWT auth against the Django backend (via the /api/backend proxy).
//
// Tokens live in cookies (not httpOnly) so BOTH the browser fetch (to set the
// Authorization header) and the edge middleware (to gate routes) can read them.
// Real security is enforced by the backend permission classes; the cookies only
// drive UX gating. Access tokens are short-lived and refreshed on demand.

export const ACCESS_COOKIE = 'pf_access';
export const REFRESH_COOKIE = 'pf_refresh';
export const ROLE_COOKIE = 'pf_role';
export const USER_COOKIE = 'pf_user';

const BASE = '/api/backend';

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
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSec}; SameSite=Lax${secure}`;
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

// ---- token accessors --------------------------------------------------------

export function getAccessToken(): string | null {
  return getCookie(ACCESS_COOKIE);
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

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function isAdmin(): boolean {
  return getRole() === 'admin';
}

export function authHeaders(): Record<string, string> {
  const t = getAccessToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function persistSession(access: string, refresh: string, user: AuthUser) {
  // Access ~ short; refresh ~ 7d. Cookie lifetimes are UX hints only.
  setCookie(ACCESS_COOKIE, access, 60 * 60);
  setCookie(REFRESH_COOKIE, refresh, 60 * 60 * 24 * 7);
  setCookie(ROLE_COOKIE, user.role, 60 * 60 * 24 * 7);
  setCookie(USER_COOKIE, JSON.stringify(user), 60 * 60 * 24 * 7);
}

// ---- flows ------------------------------------------------------------------

export async function login(username: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${BASE}/auth/login`, {
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
  const res = await fetch(`${BASE}/auth/register`, {
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

export async function refreshAccess(): Promise<boolean> {
  const refresh = getCookie(REFRESH_COOKIE);
  if (!refresh) return false;
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return false;
  const data = await res.json().catch(() => ({}));
  if (data.access) {
    setCookie(ACCESS_COOKIE, data.access, 60 * 60);
    if (data.refresh) setCookie(REFRESH_COOKIE, data.refresh, 60 * 60 * 24 * 7);
    return true;
  }
  return false;
}

export function logout() {
  [ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE, USER_COOKIE].forEach(delCookie);
}
