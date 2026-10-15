// Which Django backend the browser talks to.
//
// The backend isn't deployed yet: each of us runs it locally and exposes it
// through a tunnel (ngrok, VS Code port forwarding), so the URL changes per
// person and per session. Baking it into BACKEND_API_URL meant a redeploy for
// every change. Instead the choice is made in the UI (components/backend-switcher)
// and kept per-browser in localStorage.
//
// Two modes:
//   - nothing chosen -> the same-origin Next.js proxy (/api/backend/*), which
//     forwards to BACKEND_API_URL (see next.config.mjs). No CORS involved.
//   - a URL chosen   -> the browser calls that backend directly. The proxy runs
//     on Vercel's servers, which can't reach anyone's localhost, so a direct
//     call is the only way one setting covers both tunnels and localhost:8000.
//     This needs CORS on the backend, which DEBUG backends allow.

export interface BackendPreset {
  label: string;
  url: string;
}

// Shared team tunnels. Add yours here so it shows up for everyone.
export const BACKEND_PRESETS: BackendPreset[] = [
  { label: 'ngrok (busboy-clay-replay)', url: 'https://busboy-clay-replay.ngrok-free.dev' },
  { label: 'Localhost :8000', url: 'http://localhost:8000' },
];

const STORAGE_KEY = 'pf_backend_url';
const PROXY_BASE = '/api/backend';

/** The chosen backend origin, or '' for the default proxy. */
export function getBackendUrl(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setBackendUrl(url: string): void {
  try {
    if (url) localStorage.setItem(STORAGE_KEY, url);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked (private mode etc.): the default proxy stays in use.
  }
}

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/**
 * Turn what someone typed into a backend origin, or explain why it can't be one.
 * Accepts a bare host ("localhost:8000"), and drops a trailing "/" or "/api" so
 * pasting the API root works too.
 */
export function normalizeBackendUrl(input: string): { url: string } | { error: string } {
  let raw = input.trim();
  if (!raw) return { error: 'Enter a URL.' };
  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(raw)) {
    raw = (/^(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(raw) ? 'http://' : 'https://') + raw;
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { error: 'Not a valid URL.' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { error: 'Use an http:// or https:// URL.' };
  }
  // Browsers block plain-http requests from an https page (mixed content).
  // Loopback is the one exception they allow.
  if (
    parsed.protocol === 'http:' &&
    !LOOPBACK_HOSTS.has(parsed.hostname) &&
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:'
  ) {
    return { error: 'Browsers block http:// from this https site. Use the https tunnel URL.' };
  }

  const path = parsed.pathname.replace(/\/+$/, '').replace(/\/api$/, '');
  return { url: `${parsed.origin}${path}` };
}

/**
 * Full URL for an API path. `path` is slash-less with an optional query
 * ("/opportunities?page=2"); the proxy appends the trailing slash Django needs,
 * so a direct call has to add it itself.
 */
export function backendUrl(path: string, base: string = getBackendUrl()): string {
  if (!base) return `${PROXY_BASE}${path}`;
  const q = path.indexOf('?');
  const pathname = q === -1 ? path : path.slice(0, q);
  const query = q === -1 ? '' : path.slice(q);
  return `${base}/api${pathname.replace(/\/?$/, '/')}${query}`;
}

/**
 * Headers that get a tunnel to pass the request through instead of answering
 * with its "you are visiting a tunnel" HTML page. Only sent to the matching
 * host, because each one has to be on the backend's CORS allow-list.
 */
function tunnelHeaders(base: string): Record<string, string> {
  if (!base) return {};
  const host = new URL(base).hostname;
  if (/\.ngrok(-free)?\.(app|dev|io)$/.test(host)) return { 'ngrok-skip-browser-warning': '1' };
  if (host.endsWith('.devtunnels.ms')) return { 'X-Tunnel-Skip-AntiPhishing-Page': 'true' };
  return {};
}

/** fetch() against the selected backend. */
export function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const base = getBackendUrl();
  return fetch(backendUrl(path, base), {
    ...init,
    headers: { ...tunnelHeaders(base), ...(init.headers as Record<string, string> | undefined) },
  });
}

export interface ConnectionResult {
  ok: boolean;
  message: string;
}

/** Hit the backend's public health check. `base` '' tests the default proxy. */
export async function testBackend(base: string): Promise<ConnectionResult> {
  const started = performance.now();
  let res: Response;
  try {
    res = await fetch(backendUrl('/health', base), {
      headers: tunnelHeaders(base),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      return { ok: false, message: 'Timed out after 10s.' };
    }
    return {
      ok: false,
      message: base
        ? 'Unreachable. The backend or tunnel is down, CORS rejected this site, or the browser blocked local network access.'
        : 'Unreachable.',
    };
  }

  const ms = Math.round(performance.now() - started);
  if (!(res.headers.get('content-type') || '').includes('application/json')) {
    // Typically a tunnel's own HTML page: offline, or a private VS Code port.
    return { ok: false, message: `Got a web page instead of the API (HTTP ${res.status}). Is the tunnel online and public?` };
  }
  const data = await res.json().catch(() => ({}));
  if (res.ok && data?.status === 'ok') return { ok: true, message: `Connected in ${ms} ms.` };
  return { ok: false, message: `Backend answered HTTP ${res.status}.` };
}
