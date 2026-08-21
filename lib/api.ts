// API client for the project_hunting_backend_python Django backend.
// All requests go through the Next.js proxy (/api/backend/* -> Django /api/*)
// so the browser stays same-origin (no CORS).

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

import { authHeaders, refreshAccess } from './auth-client';

const BASE = '/api/backend';

// Legacy: the ingestion api-key. Still accepted by the backend for admin
// endpoints, but the UI now authenticates admins with JWT instead.
export function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('ingestion_api_key') || '';
}

export function setApiKey(key: string): void {
  if (typeof window !== 'undefined') localStorage.setItem('ingestion_api_key', key);
}

// Shared request wrapper: attaches the JWT (Authorization: Bearer) and retries
// once after refreshing the access token on a 401.
export async function request<T>(path: string, options: RequestInit = {}, _retried = false): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
  });
  if (res.status === 401 && !_retried) {
    if (await refreshAccess()) return request<T>(path, options, true);
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const message = data?.error || data?.detail || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

function toQuery(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === false) return;
    qs.append(key, String(value));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

// ---- Reads -----------------------------------------------------------------

// NOTE: paths are intentionally slash-less; the Next proxy appends the
// trailing slash Django expects (see next.config.mjs).

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

export function triggerPull(body: Record<string, unknown>): Promise<PullResult> {
  return request<PullResult>('/ingest', {
    method: 'POST',
    headers: { 'api-key': getApiKey() },
    body: JSON.stringify(body),
  });
}

export function pushJob(job: Record<string, unknown>): Promise<PushResult> {
  return request<PushResult>('/ingest/push', {
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
  return request<Poller>('/scheduler', {
    method: 'POST',
    headers: { 'api-key': getApiKey() },
    body: JSON.stringify(body),
  });
}
