// Admin user-management client. Uses the shared JWT-aware request() from
// lib/api.ts — all of these are admin-only on the backend.

import { request } from './api';
import { AdminUser, AdminUserInput } from './types';

export function fetchUsers(): Promise<AdminUser[]> {
  return request<AdminUser[]>('/admin/users');
}

export function createUser(body: AdminUserInput): Promise<AdminUser> {
  return request<AdminUser>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateUser(id: number, body: Partial<AdminUserInput>): Promise<AdminUser> {
  return request<AdminUser>(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteUser(id: number): Promise<void> {
  return request<void>(`/admin/users/${id}`, { method: 'DELETE' });
}

// ---- Storage cleanup: export/delete old jobs (admin only) -------------------

export function previewOldJobs(days: number): Promise<{ eligible_count: number; age_cutoff_days: number }> {
  return request(`/admin/export-old-jobs?days=${days}`);
}

// Returns the deleted count. The backend streams the deleted rows as the body;
// we just need how many were removed.
export async function deleteOldJobs(days: number): Promise<number> {
  const dump = await request<unknown[]>(`/admin/export-old-jobs?days=${days}&confirm=true`, {
    method: 'POST',
  });
  return Array.isArray(dump) ? dump.length : 0;
}
