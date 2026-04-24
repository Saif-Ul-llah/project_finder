# Real API Implementation Example

This document shows how to modify the pages to use real API calls instead of mock data.

## Current State (Mock Data)

The pages currently use mock data for demonstration:

```typescript
// app/projects/page.tsx
const [projects, setProjects] = useState<Project[]>(mockProjects);
```

## How to Switch to Real APIs

### Option 1: Modify the Page with useEffect Hook

Add a `useEffect` hook to fetch real data when filters change:

#### For Projects Page (`app/projects/page.tsx`)

Replace the initial state and add this useEffect:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { fetchProjects } from '@/lib/api'; // Import the API function
import { Project } from '@/lib/types';

export default function ProjectsPage() {
  const { updateQueryParams, getParam, getNumericParam } = useQueryParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(getNumericParam('page', 1));

  // Get current filters from URL
  const searchQuery = getParam('search', '');
  const budgetMin = getNumericParam('budgetMin', 0);
  const budgetMax = getNumericParam('budgetMax', 100000);
  const status = getParam('status', '');

  // ✨ NEW: Fetch data from real API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchProjects({
          search: searchQuery || undefined,
          budgetMin: budgetMin > 0 ? budgetMin : undefined,
          budgetMax: budgetMax < 100000 ? budgetMax : undefined,
          status: status || undefined,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });
        setProjects(response.data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, budgetMin, budgetMax, status, currentPage]);

  // Rest of the component remains the same...
```

#### For Jobs Page (`app/jobs/page.tsx`)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { fetchJobs } from '@/lib/api'; // Import the API function
import { Job } from '@/lib/types';

export default function JobsPage() {
  const { updateQueryParams, getParam, getNumericParam } = useQueryParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(getNumericParam('page', 1));

  // Get current filters from URL
  const searchQuery = getParam('search', '');
  const budgetMin = getNumericParam('budgetMin', 0);
  const budgetMax = getNumericParam('budgetMax', 100000);
  const status = getParam('status', '');

  // ✨ NEW: Fetch data from real API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchJobs({
          search: searchQuery || undefined,
          budgetMin: budgetMin > 0 ? budgetMin : undefined,
          budgetMax: budgetMax < 100000 ? budgetMax : undefined,
          status: status || undefined,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });
        setJobs(response.data);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, budgetMin, budgetMax, status, currentPage]);

  // Rest of the component remains the same...
```

### Option 2: Create a Custom Hook

For cleaner code, create a reusable hook for data fetching:

```typescript
// hooks/use-projects.ts
'use client';

import { useState, useEffect } from 'react';
import { fetchProjects } from '@/lib/api';
import { Project } from '@/lib/types';
import { FilterOptions } from '@/components/advanced-filters';

interface UseProjectsOptions extends FilterOptions {
  page?: number;
  limit?: number;
}

export function useProjects(options: UseProjectsOptions) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchProjects(options);
        setProjects(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch');
        console.error('Error fetching projects:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    options.search,
    options.budgetMin,
    options.budgetMax,
    options.status,
    options.page,
    options.limit,
  ]);

  return { projects, isLoading, error };
}
```

Then use it in the page:

```typescript
// app/projects/page.tsx
export default function ProjectsPage() {
  const { updateQueryParams, getParam, getNumericParam } = useQueryParams();
  const [currentPage, setCurrentPage] = useState(getNumericParam('page', 1));

  const searchQuery = getParam('search', '');
  const budgetMin = getNumericParam('budgetMin', 0);
  const budgetMax = getNumericParam('budgetMax', 100000);
  const status = getParam('status', '');

  // Use the custom hook
  const { projects, isLoading, error } = useProjects({
    search: searchQuery || undefined,
    budgetMin: budgetMin > 0 ? budgetMin : undefined,
    budgetMax: budgetMax < 100000 ? budgetMax : undefined,
    status: status || undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  // Rest of the component...
```

## Handling Different API Response Formats

If your API returns a different structure, update `lib/api.ts`:

### Example: API returns different field names

```typescript
export async function fetchProjects(
  filters: FilterOptions & { page?: number; limit?: number }
): Promise<ApiResponse<Project>> {
  const params = {
    // Your API params...
  };

  try {
    const response = await fetchApi<any>(API_CONFIG.projects, { params });

    // Transform the response to match our format
    const mappedData = response.projects.map((item: any) => ({
      id: item.pid,                           // Map pid → id
      title: item.projectName,                // Map projectName → title
      description: item.fullDescription,      // Map fullDescription → description
      budget: item.projectBudget,             // Map projectBudget → budget
      type: item.projectType === 'fixed' ? 'fixed' : 'hourly',
      hourly_rate: item.hourlyRate,
      skills: item.requiredSkills?.split(',') || [],
      bids: item.bidsReceived,
      bidCount: item.bidsReceived,
      status: item.projectStatus,
      posted_date: item.createdDate,
      avgBid: item.averageBidAmount,
      rating: item.avgRating,
    }));

    return {
      data: mappedData,
      pagination: {
        total: response.totalProjects,
        page: filters.page || 1,
        limit: filters.limit || 20,
      },
      success: true,
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { data: [], success: false };
  }
}
```

## Error Handling

Add better error handling to the page:

```typescript
import { useToast } from '@/hooks/use-toast';

export default function ProjectsPage() {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchProjects({ /* options */ });
        if (!response.success) {
          throw new Error('Failed to fetch projects');
        }
        setProjects(response.data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [/* dependencies */]);

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50">
        <p className="text-lg font-semibold text-red-900">Error loading projects</p>
        <p className="text-sm text-red-700 mt-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  // Rest of component...
}
```

## Pagination with Real APIs

When using real APIs with backend pagination:

```typescript
// app/projects/page.tsx
export default function ProjectsPage() {
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const response = await fetchProjects({
        search: searchQuery,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });

      setProjects(response.data);

      // Update pagination info from API
      if (response.pagination) {
        setPagination({
          totalItems: response.pagination.total,
          totalPages: Math.ceil(
            response.pagination.total / (response.pagination.limit || ITEMS_PER_PAGE)
          ),
        });
      }
      setIsLoading(false);
    };

    fetchData();
  }, [searchQuery, currentPage]);

  // Use pagination.totalPages instead of calculating locally
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      onPageChange={handlePageChange}
    />
  );
}
```

## Caching & Performance

To avoid excessive API calls, implement request caching:

```typescript
// hooks/use-projects-cached.ts
'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchProjects } from '@/lib/api';
import { Project } from '@/lib/types';

const cache = new Map<string, Project[]>();

export function useProjectsCached(options: any) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const cacheKeyRef = useRef('');

  useEffect(() => {
    const cacheKey = JSON.stringify(options);
    cacheKeyRef.current = cacheKey;

    // Check cache first
    if (cache.has(cacheKey)) {
      setProjects(cache.get(cacheKey)!);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchProjects(options);
        const data = response.data;
        
        // Update cache
        if (cacheKeyRef.current === cacheKey) {
          cache.set(cacheKey, data);
          setProjects(data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [JSON.stringify(options)]);

  return { projects, isLoading };
}
```

## Testing Your Implementation

1. **With Mock Data** (Current)
   ```bash
   pnpm dev
   # Visit http://localhost:3000/projects
   # Test all filters, search, and pagination
   ```

2. **With Real API**
   - Set `NEXT_PUBLIC_PROJECTS_API_URL` in `.env.local`
   - Uncomment the `useEffect` hook
   - Test with browser DevTools Network tab open
   - Check that API requests are being made with correct parameters

3. **Error Cases**
   - Test with invalid API endpoint
   - Test with API returning empty data
   - Test with malformed response

## Summary

The key changes to switch from mock to real APIs:

1. ✅ Set environment variables with your API endpoints
2. ✅ Add `useEffect` hooks to fetch data
3. ✅ Map API response fields if needed
4. ✅ Handle errors and loading states
5. ✅ Implement proper pagination with API data
6. ✅ Test thoroughly with real data

The application is designed to work seamlessly with either mock or real data!
