// API client for the project_hunting_backend_python Django backend.
// Backend base URL is dynamic (set via /settings, stored in localStorage)
// since it changes whenever the Cloudflare tunnel restarts.

import {
  FilterCatalog,
  OpportunitiesResponse,
  OpportunityFilters,
  Poller,
  PullResult,
  PushResult,
  SchedulerResponse,
  Stats,
} from './types';
import { getApiBaseUrl } from './api-config';

// The ingestion api-key is required by the trigger/push endpoints. In the
// admin UI it is stored in localStorage; this reads it at call time.
export function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('ingestion_api_key') || '';
}

export function setApiKey(key: string): void {
  if (typeof window !== 'undefined') localStorage.setItem('ingestion_api_key', key);
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error('No backend URL configured. Go to Settings and set your API URL.');
  }

  const res = await fetch(`${base}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const message = data?.error || data?.detail || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export function toQuery(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === false) return;
    qs.append(key, String(value));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

// ---- Reads -----------------------------------------------------------------

export function fetchOpportunities(
  filters: OpportunityFilters = {},
): Promise<OpportunitiesResponse> {
  return request<OpportunitiesResponse>(`/opportunities${toQuery({ ...filters })}`);
}

export function fetchStats(): Promise<Stats> {
  return request<Stats>('/stats');
}

export function fetchFilters(platform: string): Promise<FilterCatalog> {
  return request<FilterCatalog>(`/${platform}/filters`);
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await request<{ status: string }>('/health');
    return res.status === 'ok';
  } catch {
    return false;
  }
}

// ---- Writes (require api-key) ----------------------------------------------
// NOTE: trailing slashes below are required. These requests send a custom
// api-key header, which triggers a CORS preflight (OPTIONS). If Django then
// 301-redirects (no-slash -> slash), the browser won't follow that redirect
// on a preflighted request, so the real call silently never arrives.

export function triggerPull(body: Record<string, unknown>): Promise<PullResult> {
  return request<PullResult>('/ingest/', {
    method: 'POST',
    headers: { 'api-key': getApiKey() },
    body: JSON.stringify(body),
  });
}

export function pushJob(job: Record<string, unknown>): Promise<PushResult> {
  return request<PushResult>('/ingest/push/', {
    method: 'POST',
    headers: { 'api-key': getApiKey() },
    body: JSON.stringify(job),
  });
}

// ---- Scheduler / background pollers ----------------------------------------

export function fetchScheduler(): Promise<SchedulerResponse> {
  return request<SchedulerResponse>('/scheduler');
}

export function updatePoller(body: Partial<Poller> & { platform: string }): Promise<Poller> {
  return request<Poller>('/scheduler/', {
    method: 'POST',
    headers: { 'api-key': getApiKey() },
    body: JSON.stringify(body),
  });
}