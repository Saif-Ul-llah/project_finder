// API client for the Ranking Agent endpoints on the same Django backend.
// Mirrors lib/api.ts conventions: same proxy base, same fetch wrapper.

import {
  GeneratedProposal,
  LLMApiKeyAdmin,
  LLMApiKeyAdminInput,
  RankingConfigAdmin,
  RankingConfigAdminInput,
  RankingFilters,
  RankingGroup,
  RankingSuggestion,
  RankingSuggestionsResponse,
  TechGroupAdmin,
  TechGroupAdminInput,
} from './types';
import { getApiKey } from './api';

const BASE = '/api/backend';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
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

function toQuery(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === false) return;
    qs.append(key, String(value));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export function fetchRankedJobs(filters: RankingFilters = {}): Promise<RankingSuggestionsResponse> {
  return request<RankingSuggestionsResponse>(`/ranked-jobs${toQuery({ ...filters })}`);
}

export function fetchRankedJob(jobId: number): Promise<RankingSuggestion> {
  return request<RankingSuggestion>(`/ranked-jobs/${jobId}`);
}

export function fetchRankingGroups(): Promise<{ results: RankingGroup[] }> {
  return request<{ results: RankingGroup[] }>('/ranking/groups');
}

// Only eligible for jobs the Ranking Agent already recommends bidding on —
// the backend rejects anything else with a 400. Requires the same api-key
// used for admin actions (set on /admin), since this costs LLM tokens.
export function generateProposal(
  jobId: number,
): Promise<Omit<GeneratedProposal, 'generated_at'>> {
  return request<Omit<GeneratedProposal, 'generated_at'>>(`/ranked-jobs/${jobId}/proposal`, {
    method: 'POST',
    headers: { 'api-key': getApiKey() },
  });
}

// ---- Admin: TechGroups (require api-key) ------------------------------------

export function fetchAdminGroups(): Promise<TechGroupAdmin[]> {
  return request<TechGroupAdmin[]>('/admin/groups', {
    headers: { 'api-key': getApiKey() },
  });
}

export function createAdminGroup(body: TechGroupAdminInput): Promise<TechGroupAdmin> {
  return request<TechGroupAdmin>('/admin/groups', {
    method: 'POST',
    headers: { 'api-key': getApiKey() },
    body: JSON.stringify(body),
  });
}

export function updateAdminGroup(id: number, body: TechGroupAdminInput): Promise<TechGroupAdmin> {
  return request<TechGroupAdmin>(`/admin/groups/${id}`, {
    method: 'PUT',
    headers: { 'api-key': getApiKey() },
    body: JSON.stringify(body),
  });
}

export function deleteAdminGroup(id: number): Promise<void> {
  return request<void>(`/admin/groups/${id}`, {
    method: 'DELETE',
    headers: { 'api-key': getApiKey() },
  });
}

// ---- Admin: RankingConfig singleton (require api-key) -----------------------

export function fetchAdminRankingConfig(): Promise<RankingConfigAdmin> {
  return request<RankingConfigAdmin>('/admin/ranking-config', {
    headers: { 'api-key': getApiKey() },
  });
}

export function updateAdminRankingConfig(
  body: Partial<RankingConfigAdminInput>,
): Promise<RankingConfigAdmin> {
  return request<RankingConfigAdmin>('/admin/ranking-config', {
    method: 'PUT',
    headers: { 'api-key': getApiKey() },
    body: JSON.stringify(body),
  });
}

// ---- Admin: Ranking queue backlog (require api-key) --------------------------

export function fetchRankingQueueStatus(): Promise<{ pending_count: number }> {
  return request<{ pending_count: number }>('/admin/ranking-queue', {
    headers: { 'api-key': getApiKey() },
  });
}

// Marks every job currently pending in the ranking queue as skipped —
// never sent to the AI, zero LLM tokens spent. Does not touch jobs that
// already have a score.
export function clearRankingQueue(): Promise<{ cleared: number }> {
  return request<{ cleared: number }>('/admin/ranking-queue', {
    method: 'POST',
    headers: { 'api-key': getApiKey() },
  });
}

// ---- Admin: LLM API keys (require api-key) -----------------------------------

export function fetchAdminApiKeys(): Promise<LLMApiKeyAdmin[]> {
  return request<LLMApiKeyAdmin[]>('/admin/api-keys', {
    headers: { 'api-key': getApiKey() },
  });
}

export function createAdminApiKey(body: LLMApiKeyAdminInput): Promise<LLMApiKeyAdmin> {
  return request<LLMApiKeyAdmin>('/admin/api-keys', {
    method: 'POST',
    headers: { 'api-key': getApiKey() },
    body: JSON.stringify(body),
  });
}

export function setAdminApiKeyActive(id: number, active: boolean): Promise<LLMApiKeyAdmin> {
  return request<LLMApiKeyAdmin>(`/admin/api-keys/${id}`, {
    method: 'PATCH',
    headers: { 'api-key': getApiKey() },
    body: JSON.stringify({ active }),
  });
}

export function deleteAdminApiKey(id: number): Promise<void> {
  return request<void>(`/admin/api-keys/${id}`, {
    method: 'DELETE',
    headers: { 'api-key': getApiKey() },
  });
}
