// Project/Freelancer types (first API)
export interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  budget_min?: number;
  budget_max?: number;
  duration?: string;
  type?: 'fixed' | 'hourly';
  hourly_rate?: number;
  skills?: string[];
  bids?: number;
  status?: 'open' | 'closed' | 'draft';
  posted_date?: string;
  postedTime?: number;
  rating?: number;
  bidCount?: number;
  avgBid?: number;
}

// Job/Contest types (second API)
export interface Job {
  id: string;
  title: string;
  description: string;
  budget?: number;
  submitDate?: string;
  submitdate?: number;
  status?: string;
  type?: string;
  skills?: string[];
  bids?: number;
  entries?: number;
  rating?: number;
  bidCount?: number;
  avgBid?: number;
  featured?: boolean;
  owner?: {
    id?: string;
    name?: string;
    rating?: number;
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

export interface ApiResponse<T> {
  data: T[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
  success: boolean;
  message?: string;
}
