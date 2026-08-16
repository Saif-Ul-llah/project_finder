const STORAGE_KEY = 'backend_base_url';

// Fixed, permanent URL — this is on PythonAnywhere, doesn't change.
// It always returns the current Cloudflare tunnel domain.
const RESOLVER_URL = 'https://syedhamza12.pythonanywhere.com/shop/api/backend-url/';

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY) || '';
}

export function setApiBaseUrl(url: string): void {
  if (typeof window === 'undefined') return;
  const cleaned = url.trim().replace(/\/+$/, ''); // remove trailing slash
  localStorage.setItem(STORAGE_KEY, cleaned);
}

export function clearApiBaseUrl(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
}

// Called on every page load. Fetches the current tunnel domain from the
// resolver and overwrites localStorage with it. If the resolver is
// unreachable or returns an error, silently keeps whatever URL was already
// saved (so a resolver outage doesn't break an already-working session).
export async function syncApiBaseUrl(): Promise<string> {
  if (typeof window === 'undefined') return '';

  try {
    const res = await fetch(RESOLVER_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Resolver responded ${res.status}`);
    const data = await res.json();
    if (data?.domain) {
      setApiBaseUrl(data.domain);
      return data.domain;
    }
    throw new Error('Resolver response missing "domain"');
  } catch (err) {
    console.warn('Backend URL resolver failed, keeping existing saved URL:', err);
    return getApiBaseUrl();
  }
}