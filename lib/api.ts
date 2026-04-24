import { Project, Job, ApiResponse, FilterOptions } from './types';

// Configure your API endpoints here
const API_CONFIG = {
  projects: process.env.NEXT_PUBLIC_PROJECTS_API_URL || '/api/projects',
  jobs: process.env.NEXT_PUBLIC_JOBS_API_URL || '/api/jobs',
};

interface FetchOptions extends RequestInit {
  params?: Record<string, any>;
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build query string
  let url = endpoint;
  if (params) {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== false) {
        if (Array.isArray(value)) {
          value.forEach(v => queryString.append(key, v));
        } else {
          queryString.append(key, String(value));
        }
      }
    });
    const qs = queryString.toString();
    if (qs) url += `?${qs}`;
  }

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
}

// Project/Freelancer API methods
export async function fetchProjects(
  filters: FilterOptions & { page?: number; limit?: number }
): Promise<ApiResponse<Project>> {
  const params = {
    tag: 'users',
    type: filters.status === 'hourly' ? true : false,
    budget_min: filters.budgetMin || false,
    budget_max: filters.budgetMax || false,
    contest_budget_min: false,
    contest_budget_max: false,
    hourlyrate_min: false,
    hourlyrate_max: false,
    hourlyProjectDuration: false,
    skills_chosen: filters.skills?.length ? filters.skills.join(',') : false,
    languages: false,
    status: filters.status || 'all',
    vicinity: false,
    countries: false,
    lat: false,
    lon: false,
    iDisplayStart: ((filters.page || 0) * (filters.limit || 20)),
    iDisplayLength: filters.limit || 20,
    iSortingCols: 1,
    iSortCol_0: 6,
    sSortDir_0: filters.sortOrder || 'desc',
    format_version: 3,
    disableHighlights: true,
    search: filters.search || undefined,
  };

  try {
    const response = await fetchApi<ApiResponse<Project>>(
      API_CONFIG.projects,
      { params }
    );
    return response;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { data: [], success: false };
  }
}

// Job/Contest API methods
export async function fetchJobs(
  filters: FilterOptions & { page?: number; limit?: number }
): Promise<ApiResponse<Job>> {
  const jobIds = [9, 31, 68, 116, 305, 500, 564, 607, 613, 709, 759, 1031, 1084, 1087, 1092, 1093, 2164, 2165, 2703, 2839];

  const params = {
    limit: filters.limit || 20,
    full_description: true,
    job_details: true,
    local_details: true,
    location_details: true,
    upgrade_details: true,
    owner_info: true,
    'jobs[]': jobIds,
    'languages[]': ['en'],
    sort_field: filters.sortBy || 'submitdate',
    webapp: 1,
    compact: true,
    new_errors: true,
    new_pools: true,
    search: filters.search || undefined,
  };

  try {
    const response = await fetchApi<ApiResponse<Job>>(
      API_CONFIG.jobs,
      { params }
    );
    return response;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return { data: [], success: false };
  }
}

// Mock data for demo purposes
export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Build E-commerce Platform',
    description: 'Need a full-stack e-commerce solution with payment integration',
    budget: 5000,
    type: 'fixed',
    skills: ['React', 'Node.js', 'MongoDB'],
    bids: 12,
    status: 'open',
    posted_date: '2024-04-20',
    bidCount: 12,
    avgBid: 4800,
  },
  {
    id: '2',
    title: 'Mobile App Development',
    description: 'React Native mobile app for iOS and Android',
    budget: 3000,
    type: 'fixed',
    skills: ['React Native', 'JavaScript'],
    bids: 8,
    status: 'open',
    posted_date: '2024-04-19',
    bidCount: 8,
    avgBid: 2900,
  },
  {
    id: '3',
    title: 'UI/UX Design Services',
    description: 'Design website mockups and prototypes',
    hourly_rate: 75,
    type: 'hourly',
    skills: ['Figma', 'UI Design', 'UX Design'],
    status: 'open',
    posted_date: '2024-04-18',
  },
  {
    id: '4',
    title: 'Content Writing Project',
    description: 'Write 50 blog posts about technology',
    budget: 1500,
    type: 'fixed',
    skills: ['Writing', 'SEO'],
    bids: 24,
    status: 'open',
    posted_date: '2024-04-17',
    bidCount: 24,
    avgBid: 1400,
  },
  {
    id: '5',
    title: 'WordPress Theme Customization',
    description: 'Customize existing WordPress theme for business website',
    budget: 800,
    type: 'fixed',
    skills: ['WordPress', 'PHP', 'CSS'],
    bids: 15,
    status: 'open',
    posted_date: '2024-04-16',
    bidCount: 15,
    avgBid: 750,
  },
];

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Design Landing Page',
    description: 'Create a modern landing page design for SaaS product',
    budget: 2000,
    submitDate: '2024-04-20',
    skills: ['UI Design', 'Figma'],
    entries: 5,
    status: 'open',
    featured: true,
  },
  {
    id: '2',
    title: 'Logo Design Contest',
    description: 'Design a unique logo for a tech startup',
    budget: 1500,
    submitDate: '2024-04-19',
    skills: ['Logo Design', 'Branding'],
    entries: 12,
    status: 'open',
    featured: false,
  },
  {
    id: '3',
    title: 'Website Banner Design',
    description: '5 different banner designs for website',
    budget: 800,
    submitDate: '2024-04-18',
    skills: ['Graphic Design', 'Photoshop'],
    entries: 8,
    status: 'open',
    featured: false,
  },
  {
    id: '4',
    title: 'Illustration Design',
    description: 'Create custom illustrations for e-learning platform',
    budget: 3000,
    submitDate: '2024-04-17',
    skills: ['Illustration', 'Digital Art'],
    entries: 3,
    status: 'open',
    featured: true,
  },
  {
    id: '5',
    title: 'UI Kit Design',
    description: 'Design a complete UI kit for mobile app',
    budget: 2500,
    submitDate: '2024-04-16',
    skills: ['UI Design', 'Design Systems'],
    entries: 6,
    status: 'open',
    featured: false,
  },
];
