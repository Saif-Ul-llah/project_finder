// Contest/Project types (Freelancer Datatable API)
export interface ContestProject {
  project_name: string;
  seo_url: string;
  project_desc: string;
  bid_avg: string;
  bid_count: number;
  project_id: number;
  is_contest: boolean;
  time_left: string;
  highlight: boolean;
  featured: boolean;
  urgent: boolean;
  sealed: boolean;
  guaranteed: boolean;
  fulltime: boolean;
  top: boolean;
  payment_verified: boolean | null;
  NDA: boolean;
  local: boolean;
  has_upgrades: boolean;
  minbudget: string;
  maxbudget: string;
  budget_range: string;
  skills_info: SkillInfo[];
}

export interface SkillInfo {
  id: number;
  name: string;
  seo_url: string;
}

export interface ContestProjectsResponse {
  iTotalRecords: number;
  iTotalDisplayRecords: number;
  aaData: ContestProject[];
}

// Job types (Freelancer Projects API)
export interface Project {
  id: number;
  title: string;
  status: string;
  seo_url: string;
  currency: Currency;
  description: string;
  jobs: JobCategory[];
  owner_info?: OwnerInfo;
  location_details?: LocationDetails;
  local_details?: LocalDetails;
  upgrade_details?: UpgradeDetails;
  budget?: {
    minimum: number;
    maximum: number;
    project_type: string;
  };
  bid_stats?: {
    bid_count: number;
    bid_avg: number;
  };
  submitdate?: number;
}

export interface Currency {
  id: number;
  code: string;
  sign: string;
  name: string;
  exchange_rate: number;
  country: string;
  is_external: boolean;
  is_escrowcom_supported: boolean;
}

export interface JobCategory {
  id: number;
  name: string;
  category: {
    id: number;
    name: string;
  };
  seo_url: string;
  local: boolean;
}

export interface OwnerInfo {
  id: number;
  username: string;
  display_name: string;
  location?: {
    country: {
      id: number;
      name: string;
      flag_url: string;
    };
  };
}

export interface LocationDetails {
  country?: {
    id: number;
    name: string;
    flag_url: string;
  };
  latitude?: number;
  longitude?: number;
}

export interface LocalDetails {
  local: boolean;
  latitude?: number;
  longitude?: number;
}

export interface UpgradeDetails {
  featured: boolean;
  urgent: boolean;
  sealed: boolean;
  guaranteed: boolean;
  top: boolean;
}

export interface ProjectsResponse {
  status: string;
  result: {
    projects: Project[];
  };
}

export interface FilterOptions {
  search?: string;
  budgetMin?: number;
  budgetMax?: number;
  skills?: string[];
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

// Legacy types for backwards compatibility
export interface Job {
  id: string;
  title: string;
  description: string;
  budget?: number;
  status?: string;
  skills?: string[];
}
