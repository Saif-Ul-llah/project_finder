// Tiny sessionStorage-backed cache for stale-while-revalidate reads.
// Survives page refresh (same tab); auto-clears when the tab closes.

export function readCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / serialization issues are non-fatal */
  }
}
