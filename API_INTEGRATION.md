# API Integration Guide

This document explains how to integrate your actual APIs with the Marketplace application.

## Overview

The application currently uses **mock data** for demonstration purposes. You can easily swap in your real APIs by updating the configuration and API service files.

## Project Structure

- **`lib/api.ts`** - API service layer with all fetch functions
- **`lib/types.ts`** - TypeScript types for Projects and Jobs
- **`hooks/use-query-params.ts`** - Hook for URL-based state management
- **`app/projects/page.tsx`** - Projects listing page
- **`app/jobs/page.tsx`** - Jobs/Contests listing page

## Setting Up Your APIs

### Step 1: Update API Endpoints

Edit the `API_CONFIG` in `lib/api.ts`:

```typescript
const API_CONFIG = {
  projects: process.env.NEXT_PUBLIC_PROJECTS_API_URL || '/api/projects',
  jobs: process.env.NEXT_PUBLIC_JOBS_API_URL || '/api/jobs',
};
```

### Step 2: Add Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_PROJECTS_API_URL=https://your-api.com/api/projects
NEXT_PUBLIC_JOBS_API_URL=https://your-api.com/api/jobs
```

## API Requirements

### Projects API

Your Projects API should accept these query parameters:

```
GET /api/projects?tag=users&type=false&budget_min=1000&budget_max=5000&status=open&iDisplayStart=0&iDisplayLength=20&iSortingCols=1&iSortCol_0=6&sSortDir_0=desc&format_version=3&disableHighlights=true&search=keyword
```

**Expected Response Format:**

```json
{
  "data": [
    {
      "id": "1",
      "title": "Build E-commerce Platform",
      "description": "Full-stack e-commerce solution",
      "budget": 5000,
      "type": "fixed",
      "skills": ["React", "Node.js", "MongoDB"],
      "bids": 12,
      "status": "open",
      "posted_date": "2024-04-20",
      "bidCount": 12,
      "avgBid": 4800,
      "rating": 4.8
    }
  ],
  "pagination": {
    "total": 250,
    "page": 1,
    "limit": 20
  },
  "success": true
}
```

**Project Object Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | string | ✓ | Unique identifier |
| title | string | ✓ | Project title |
| description | string | ✓ | Project description |
| budget | number | ✓ | Project budget (fixed price) |
| type | 'fixed' \| 'hourly' | - | Project type |
| hourly_rate | number | - | Hourly rate if type is hourly |
| skills | string[] | - | Required skills |
| bids | number | - | Number of bids |
| bidCount | number | - | Alternative bid count field |
| status | 'open' \| 'closed' \| 'draft' | - | Project status |
| posted_date | string | - | Posted date (ISO format) |
| avgBid | number | - | Average bid amount |
| rating | number | - | Project rating (0-5) |

### Jobs API

Your Jobs API should accept these query parameters:

```
GET /api/jobs?limit=20&full_description=true&job_details=true&local_details=true&location_details=true&upgrade_details=true&owner_info=true&jobs[]=9&jobs[]=31&sort_field=submitdate&webapp=1&compact=true&new_errors=true&new_pools=true&search=keyword
```

**Expected Response Format:**

```json
{
  "data": [
    {
      "id": "1",
      "title": "Design Landing Page",
      "description": "Create a modern landing page design",
      "budget": 2000,
      "submitDate": "2024-04-20",
      "skills": ["UI Design", "Figma"],
      "entries": 5,
      "status": "open",
      "featured": true,
      "owner": {
        "id": "owner_1",
        "name": "Client Name",
        "rating": 4.5
      }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20
  },
  "success": true
}
```

**Job Object Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | string | ✓ | Unique identifier |
| title | string | ✓ | Job/Contest title |
| description | string | ✓ | Job description |
| budget | number | - | Job budget |
| submitDate | string | - | Submission date (ISO format) |
| submitdate | number | - | Alternative date field (timestamp) |
| skills | string[] | - | Required skills |
| entries | number | - | Number of entries/submissions |
| bidCount | number | - | Number of bids |
| status | string | - | Job status |
| featured | boolean | - | Is the job featured? |
| rating | number | - | Job rating (0-5) |
| owner | object | - | Job owner info |
| owner.id | string | - | Owner identifier |
| owner.name | string | - | Owner name |
| owner.rating | number | - | Owner rating (0-5) |

## Updating the Fetch Functions

If your API response format differs, update the fetch functions in `lib/api.ts`:

### Example: Custom API Response Mapping

```typescript
export async function fetchProjects(
  filters: FilterOptions & { page?: number; limit?: number }
): Promise<ApiResponse<Project>> {
  const params = {
    // Your custom parameters...
  };

  try {
    const response = await fetchApi<any>(
      API_CONFIG.projects,
      { params }
    );

    // Map your API response to the expected format
    const mappedData = response.items.map((item: any) => ({
      id: item.projectId,
      title: item.projectTitle,
      description: item.projectDesc,
      budget: item.projectBudget,
      // ... map other fields
    }));

    return {
      data: mappedData,
      pagination: {
        total: response.totalCount,
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

## Features

### Search
- Full-text search across titles and descriptions
- Real-time filtering as you type

### Advanced Filters
- **Budget Range**: Filter by min and max budget
- **Status**: Filter by project/job status (open, closed, featured, etc.)
- **Date Range**: Filter by when posted (last 24h, 7d, 30d, all time)
- **Bid Count**: Filter by number of bids/entries
- **Skills**: Multi-select skills filter
- **Rating**: Filter by minimum rating

### Sorting
- Newest First / Oldest First
- Budget: High to Low / Low to High
- Most Bids / Least Bids
- Highest Rating / Lowest Rating

### Pagination
- Configurable items per page (default: 12)
- Page-based navigation
- Results counter

## URL State Management

All filters, search, sort, and pagination are stored in URL query parameters for:
- Bookmarkable searches
- Shareable filtered results
- Browser back/forward button support

Example URL:
```
/projects?search=react&budgetMin=1000&budgetMax=5000&sortBy=posted_date&sortOrder=desc&page=2
```

## Switching from Mock Data

To switch from mock data to real APIs:

1. **Option A: Keep mock data for development**
   - Mock data is still available via `mockProjects` and `mockJobs` exports
   - Useful for testing UI without API

2. **Option B: Use real APIs**
   - Update `API_CONFIG` with your endpoints
   - Remove mock data calls from pages (optional)
   - The `fetchApi` function will now call your real APIs

## Error Handling

The API functions already include error handling:

```typescript
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
```

Add your own error notifications/logging as needed.

## Testing Your Integration

1. Add your API endpoint to environment variables
2. Update the page to use the real API instead of mock data:

```typescript
// In app/projects/page.tsx or app/jobs/page.tsx
useEffect(() => {
  const loadData = async () => {
    setIsLoading(true);
    const response = await fetchProjects({
      search: searchQuery,
      budgetMin: budgetMin,
      budgetMax: budgetMax,
      status: status,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    });
    setProjects(response.data);
    setIsLoading(false);
  };
  
  loadData();
}, [searchQuery, budgetMin, budgetMax, status, currentPage]);
```

3. Test filtering, searching, sorting, and pagination

## Additional Notes

- All filters support URL query parameters for bookmarking
- Loading states are built-in with skeleton/spinner support
- Empty states are displayed when no results match filters
- The UI is fully responsive and mobile-friendly
- Dark mode is supported via Tailwind CSS

For questions or issues with integration, check the component implementations in:
- `components/advanced-filters.tsx` - Filter UI and logic
- `components/search-bar.tsx` - Search functionality
- `components/sorting-select.tsx` - Sorting options
- `components/pagination.tsx` - Pagination UI
