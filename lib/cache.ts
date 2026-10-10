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

/**
 * A cache key that does not depend on key insertion order.
 *
 * Filter state lives in one object updated by spreading patches, so the order
 * of its keys follows the order the user touched the controls.
 * JSON.stringify would therefore produce two different keys for the same set
 * of filters, silently halving the cache hit rate. Sorting fixes that.
 *
 * Empty values are dropped so "not set" and "cleared" share a key.
 */
export function filterCacheKey(
  prefix: string,
  filters: object,
): string {
  const parts = Object.entries(filters)
    .filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== false)
    .map(([k, v]) => k + '=' + String(v))
    .sort();
  return prefix + ':' + parts.join('&');
}

