// ============================================================================
// Backend (project_hunting_backend_python) — unified Opportunity model
// Served by GET /api/opportunities/ via the Next.js proxy at /api/backend/*
// ============================================================================

export interface Opportunity {
  id: number;
  external_id: string;
  platform: string;
  title: string;
  description: string;
  url: string;
  budget_raw: string | null;
  budget_min: number | null;
  budget_max: number | null;
  job_type: 'hourly' | 'fixed' | null;
  difficulty: string | null;
  time_duration: string | null;
  proposals_raw: string | null;
  proposals_min: number | null;
  proposals_max: number | null;
  tech_stack: string[];
  rating: number | null;
  payment_status: string | null;
  is_payment_verified: boolean;
  client_country: string | null;
  client_spent_numeric: number | null;
  source_strategy: string | null;
  content_hash: string;
  posted_raw: string | null;
  created_at: string;
}

export interface OpportunitiesResponse {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: Opportunity[];
}

export interface Stats {
  total: number;
  by_platform: Record<string, number>;
  verified: number;
  hourly: number;
  fixed: number;
  latest_created_at: string | null;
}

export interface PullResult {
  message: string;
  fetched?: number;
  created: number;
  updated: number;
  skipped_duplicates: number;
}

export interface PushResult {
  message: string;
  job_id: number;
  duplicate: boolean;
}

// Filters used by the listing UI / query params sent to the backend.
export interface OpportunityFilters {
  search?: string;
  platform?: string;
  job_type?: 'hourly' | 'fixed';
  verified?: boolean;
  min_budget?: number;
  max_budget?: number;
  sort?: string;
  page?: number;
  page_size?: number;
}

// Filter catalog shape is platform-specific; kept loose.
export type FilterCatalog = Record<string, unknown>;

export interface Poller {
  platform: string;
  enabled: boolean;
  interval_seconds: number;
  limit: number;
  last_run: string | null;
  last_status: 'idle' | 'ok' | 'error';
  last_message: string;
  last_created: number;
  last_updated: number;
  last_skipped: number;
}

export interface SchedulerResponse {
  pollers: Poller[];
}

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'budget_high'
  | 'budget_low'
  | 'proposals'
  | 'rating';
