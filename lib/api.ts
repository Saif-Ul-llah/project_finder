import { 
  Project, 
  ContestProject,
  ProjectsResponse,
  ContestProjectsResponse,
  FilterOptions,
  JobCategory 
} from './types';

// Configure your API endpoints here
const API_CONFIG = {
  contests: process.env.NEXT_PUBLIC_CONTESTS_API_URL || 
    '/api/freelancer/ajax/table/project_contest_datatable.php',
  projects: process.env.NEXT_PUBLIC_PROJECTS_API_URL || 
    '/api/freelancer/api/projects/0.1/projects/active',
};

interface FetchOptions extends RequestInit {
  params?: Record<string, any>;
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = endpoint;
  if (params) {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== false) {
        if (Array.isArray(value)) {
          value.forEach(v => queryString.append(key, String(v)));
        } else {
          queryString.append(key, String(value));
        }
      }
    });
    const qs = queryString.toString();
    if (qs) url += `?${qs}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('[API Error]', error);
    throw error;
  }
}

// Fetch Contests/Projects (Merged modern APIs for posting time)
export async function fetchContests(
  filters: FilterOptions & { page?: number; limit?: number }
): Promise<{ data: Project[]; total: number }> {
  try {
    const limit = filters.limit || 20;
    const offset = (filters.page || 0) * limit;

    // Fetch both Projects and Contests from modern APIs
    const [projectsRes, contestsRes] = await Promise.all([
      fetchProjects({ ...filters, limit }),
      fetchApi<any>('/api/freelancer/api/contests/0.1/contests/active', {
        params: {
          limit,
          offset,
          compact: true,
          webapp: 1,
          query: filters.search || undefined,
        }
      })
    ]);

    const projects = projectsRes.data;
    const contests = (contestsRes.result?.contests || []).map((c: any) => ({
      ...c,
      title: c.title,
      description: c.description,
      jobs: [],
      budget: {
        minimum: c.prize,
        maximum: c.prize,
        project_type: 'contest'
      },
      bid_stats: {
        bid_count: 0,
        bid_avg: 0
      }
    }));

    // Merge and sort by time_submitted
    let merged = [...projects, ...contests];
    
    if (filters.sortBy === 'newest') {
      merged.sort((a, b) => (b.time_submitted || 0) - (a.time_submitted || 0));
    }

    return {
      data: merged.slice(0, limit),
      total: (projectsRes.total || 0) + (contestsRes.result?.total_count || 0)
    };
  } catch (error) {
    console.error('Error merging projects and contests:', error);
    return fetchProjects(filters);
  }
}

// Fetch Projects/Jobs
export async function fetchProjects(
  filters: FilterOptions & { page?: number; limit?: number }
): Promise<{ data: Project[]; total: number }> {
  const jobIds = [9, 31, 68, 116, 305, 500, 564, 607, 613, 709, 759, 1031, 1084, 1087, 1092, 1093, 2164, 2165, 2703, 2839];

  const params: Record<string, any> = {
    limit: filters.limit || 20,
    offset: (filters.page || 0) * (filters.limit || 20),
    full_description: true,
    job_details: true,
    local_details: true,
    location_details: true,
    upgrade_details: true,
    owner_info: true,
    webapp: 1,
    compact: true,
    new_errors: true,
    new_pools: true,
  };

  // Add job IDs
  jobIds.forEach(id => {
    params[`jobs[${jobIds.indexOf(id)}]`] = id;
  });

  // Add language
  params['languages[0]'] = 'en';

  // Add sorting
  if (filters.sortBy) {
    params['sort_field'] = filters.sortBy;
  } else {
    params['sort_field'] = 'time_submitted';
  }

  try {
    const response = await fetchApi<ProjectsResponse>(
      API_CONFIG.projects,
      { params }
    );
    return {
      data: response.result?.projects || [],
      total: response.result?.total_count || response.result?.projects?.length || 0,
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { data: [], total: 0 };
  }
}

// Filter projects by search term
export function filterBySearch(
  items: ContestProject[] | Project[], 
  search: string
): ContestProject[] | Project[] {
  if (!search.trim()) return items;
  
  const query = search.toLowerCase();
  return items.filter(item => {
    return (
      (item.title || '').toLowerCase().includes(query) ||
      (item.description || '').toLowerCase().includes(query)
    );
  });
}

// Filter by budget
export function filterByBudget(
  items: ContestProject[] | Project[],
  minBudget?: number,
  maxBudget?: number
): ContestProject[] | Project[] {
  if (!minBudget && !maxBudget) return items;

  return items.filter(item => {
    const itemBudget = item.budget?.minimum || 0;

    if (minBudget && itemBudget < minBudget) return false;
    if (maxBudget && itemBudget > maxBudget) return false;
    return true;
  });
}

// Sort items
export function sortItems(
  items: ContestProject[] | Project[],
  sortBy: string,
  sortOrder: 'asc' | 'desc' = 'desc'
): ContestProject[] | Project[] {
  const sorted = [...items].sort((a, b) => {
    let aVal: any = '';
    let bVal: any = '';

    // Unified sorting for Project structure
    switch (sortBy) {
      case 'bids':
        aVal = a.bid_stats?.bid_count || 0;
        bVal = b.bid_stats?.bid_count || 0;
        break;
      case 'lowest_bids':
        aVal = a.bid_stats?.bid_count || 0;
        bVal = b.bid_stats?.bid_count || 0;
        return aVal - bVal; // Ascending order
      case 'budget':
        aVal = a.budget?.minimum || 0;
        bVal = b.budget?.minimum || 0;
        break;
      case 'newest':
        aVal = a.time_submitted || 0;
        bVal = b.time_submitted || 0;
        break;
      default:
        return 0;
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    }

    return 0;
  });

  return sorted;
}

// Mock data for demo purposes
export const mockProjects: Project[] = [];

export const mockJobs: Job[] =[];
