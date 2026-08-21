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
  by_source: Record<string, number>;
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
  source?: string;
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

// ============================================================================
// Admin: user management (admin-only) — /api/admin/users/
// ============================================================================

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'member';
  is_active: boolean;
  date_joined: string;
}

export interface AdminUserInput {
  username: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'member';
  is_active?: boolean;
}

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'budget_high'
  | 'budget_low'
  | 'proposals'
  | 'rating';

// ============================================================================
// Ranking Agent — GET /api/ranked-jobs/ (list) and /api/ranked-jobs/:id/
// ============================================================================

export type RankingRecommendation =
  | 'BID_IMMEDIATELY'
  | 'BID'
  | 'REVIEW_FIRST'
  | 'LOW_PRIORITY'
  | 'DO_NOT_BID'
  | '';

// ============================================================================
// Proposal generation — POST /api/ranked-jobs/:id/proposal/
// Cached client-side (localStorage) by job_id — see lib/proposal-cache.ts.
// ============================================================================

export interface GeneratedProposal {
  job_id: number;
  cover_letter: string;
  bid: number;
  duration: string;
  generated_at: string;
}

export interface RankingSuggestion {
  job_id: number;
  title: string;
  platform: string;
  url: string;
  job_type: 'hourly' | 'fixed' | null;
  budget_raw: string | null;
  budget_min: number | null;
  budget_max: number | null;
  tech_stack: string[];
  client_country: string | null;
  rating: number | null;
  is_payment_verified: boolean;
  proposals_raw: string | null;
  created_at: string;
  live_priority: number;
  business_score: number | null;
  recommendation: RankingRecommendation;
  skill_match_score: number | null;
  client_quality_score: number | null;
  competition_score: number | null;
  urgency_score: number | null;
  risk_score: number | null;
  risk_flags: string[];
  tags: string[];
  ai_reasoning: string;
  dominant_group: string | null;
  scored_at: string | null;
}

export interface RankingSuggestionsResponse {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: RankingSuggestion[];
}

export interface RankingGroup {
  id: number;
  name: string;
  specialization: string;
  domain: string;
  priority_tier: string;
}

export interface RankingFilters {
  search?: string;
  group?: string;
  tech_stack?: string;
  min_priority?: number;
  recommendation?: string;
  sort?: string;
  page?: number;
  page_size?: number;
}

// ============================================================================
// Ranking Admin config — /api/admin/groups/, /api/admin/ranking-config/,
// /api/admin/api-keys/ (api-key protected, same header as the rest of admin)
// ============================================================================

export interface TechGroupAdmin {
  id: number;
  name: string;
  keywords: string[];
  instruction: string;
  specialization: string;
  domain: string;
  priority_tier: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'IGNORE';
  priority_weight: number;
  base_decay_rate: number;
  min_budget: number | null;
  max_budget: number | null;
  hourly_min_rate: number | null;
  hourly_max_rate: number | null;
  active: boolean;
}

export type TechGroupAdminInput = Omit<TechGroupAdmin, 'id'>;

export interface RankingConfigAdmin {
  global_instruction: string;
  dead_job_ttl_hours: number;
  skill_weight: number;
  client_quality_weight: number;
  competition_weight: number;
  urgency_weight: number;
  risk_penalty_weight: number;
  use_gemini: boolean;
  gemini_model: string;
  groq_model: string;
  proposal_instruction: string;
  updated_at: string;
}

export type RankingConfigAdminInput = Omit<RankingConfigAdmin, 'updated_at'>;

export interface LLMApiKeyAdmin {
  id: number;
  provider: 'gemini' | 'groq';
  label: string;
  model_name: string;
  masked_key: string;
  active: boolean;
  failure_count: number;
  cooldown_until: string | null;
  last_used_at: string | null;
  created_at: string;
}

export interface LLMApiKeyAdminInput {
  provider: 'gemini' | 'groq';
  label: string;
  model_name: string;
  key: string;
  active: boolean;
}
