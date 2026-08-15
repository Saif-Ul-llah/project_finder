const STORAGE_KEY = 'backend_base_url';

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