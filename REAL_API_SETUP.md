# Real Freelancer API Integration Guide

This application is now integrated with the **real Freelancer.com APIs**. Here's everything you need to know.

## API Endpoints

### 1. Projects/Contests API (Datatable)
**URL:** `https://www.freelancer.com/ajax/table/project_contest_datatable.php`

This API returns contest and project listings.

**Key Parameters:**
- `tag` - Filter by tag (default: "users")
- `budget_min` / `budget_max` - Budget range filter
- `skills_chosen` - Comma-separated skill IDs
- `status` - Filter by status (all, open, featured, urgent, etc.)
- `iDisplayStart` - Pagination start (number of items to skip)
- `iDisplayLength` - Items per page
- `sSortDir_0` - Sort direction (asc/desc)

**Response Structure:**
```json
{
  "iTotalRecords": 2000,
  "iTotalDisplayRecords": 2000,
  "aaData": [
    {
      "project_name": "Project Title",
      "project_desc": "Description...",
      "bid_count": 50,
      "bid_avg": "$100",
      "project_id": 123456,
      "budget_range": "$100 - $200",
      "is_contest": true,
      "featured": true,
      "urgent": false,
      "guaranteed": true,
      "skills_info": [
        { "id": 1, "name": "PHP", "seo_url": "php" }
      ]
    }
  ]
}
```

### 2. Active Projects API
**URL:** `https://www.freelancer.com/api/projects/0.1/projects/active`

This API returns active job/project listings with detailed information.

**Key Parameters:**
- `limit` - Number of results (default: 20)
- `jobs[]` - Array of job category IDs to filter by
- `languages[]` - Array of language codes (e.g., "en")
- `sort_field` - Sort field (submitdate, budget, etc.)
- `full_description` - Include full description (true/false)
- `job_details` - Include job details (true/false)
- `owner_info` - Include owner information (true/false)

**Response Structure:**
```json
{
  "status": "success",
  "result": {
    "projects": [
      {
        "id": 40439721,
        "title": "Job Title",
        "status": "active",
        "description": "Full description...",
        "currency": {
          "code": "USD",
          "sign": "$"
        },
        "jobs": [
          {
            "id": 3,
            "name": "PHP",
            "seo_url": "php"
          }
        ],
        "upgrade_details": {
          "featured": true,
          "urgent": false,
          "guaranteed": true
        },
        "owner_info": {
          "username": "client_name",
          "display_name": "Client Name"
        }
      }
    ]
  }
}
```

## How It Works

### Current Setup
The app fetches from real Freelancer APIs with the following behavior:

1. **Pages/Projects Page** (`/projects`)
   - Fetches from Datatable API
   - Displays contest and project listings
   - Shows 12 items per page (configurable)

2. **Jobs Page** (`/jobs`)
   - Fetches from Active Projects API
   - Displays active job opportunities
   - Shows 12 items per page (configurable)

### Client-Side vs Server-Side Filtering

**Server-Side (API Parameters):**
- `budgetMin` / `budgetMax` - Sent to API
- `page` - Pagination handled by API
- `sortBy` - Sort field sent to API

**Client-Side (Filtered locally):**
- `search` - Full-text search in titles and descriptions
- Additional budget filtering for fine-tuning

## Search & Filter Implementation

### Search
```typescript
// Full-text search across project name and description
const results = filterBySearch(projects, searchQuery);
```

### Budget Filter
```typescript
// Filter by budget range
const results = filterByBudget(projects, minBudget, maxBudget);
```

### Sorting
```typescript
// Sort by different criteria
const results = sortItems(projects, sortBy, sortOrder);
```

Available sort options:
- `newest` - Most recent first
- `bids` - Most bids first
- `budget` - Highest budget first
- `featured` - Featured projects first
- `guaranteed` - Guaranteed projects first
- `urgent` - Urgent projects first

## URL-Based State Management

All filters and pagination state are synced to URL query parameters, allowing users to:
- Bookmark filtered searches
- Share links with specific filters
- Use browser back/forward buttons
- Refresh page and maintain current state

**Example URLs:**
```
/projects?search=react&budgetMin=1000&budgetMax=5000&page=2
/jobs?search=php&sortBy=newest&page=1
```

## Real-Time Features

### Loading States
- Shows spinner while fetching from API
- Disables interactions during load

### Error Handling
- Catches API errors and displays user-friendly message
- Allows retry by reloading filters

### Empty States
- Shows helpful message when no results found
- Suggests adjusting filters

## Performance Notes

1. **API Rate Limiting**
   - Freelancer API may have rate limits
   - Consider implementing caching if making frequent requests

2. **Response Size**
   - Datatable API can return up to 2000 records
   - Active Projects API returns ~20 records per request

3. **Pagination**
   - Uses limit/offset model for Datatable API
   - Adjust `ITEMS_PER_PAGE` constant if needed (currently 12)

## Customization

### Change Items Per Page
Edit `/app/projects/page.tsx` or `/app/jobs/page.tsx`:
```typescript
const ITEMS_PER_PAGE = 12; // Change this number
```

### Change API Endpoints
Edit `/lib/api.ts`:
```typescript
const API_CONFIG = {
  contests: 'YOUR_CUSTOM_URL',
  projects: 'YOUR_CUSTOM_URL',
};
```

### Add More Filters
Edit `/components/advanced-filters.tsx`:
1. Add filter options to `SKILL_OPTIONS` or create new arrays
2. Update `FilterState` interface in `types.ts`
3. Add filter logic in page components

### Modify Sort Options
Edit `/components/sorting-select.tsx`:
```typescript
const SORT_OPTIONS = [
  { label: 'Your Sort', value: 'your_sort_key' },
  // ... add more
];
```

## Testing

### Test API Directly
You can test the APIs directly in your browser:

**Datatable API:**
```
https://www.freelancer.com/ajax/table/project_contest_datatable.php?tag=users&iDisplayStart=0&iDisplayLength=10&format_version=3
```

**Active Projects API:**
```
https://www.freelancer.com/api/projects/0.1/projects/active?limit=5&jobs[]=3&languages[]=en
```

### Check Console
- Open browser DevTools (F12)
- Go to Console tab
- Look for `[v0]` prefixed logs for debugging info

## Common Issues & Solutions

### "Failed to load projects" Error
**Cause:** API request failed or network issue  
**Solution:** 
1. Check browser console for network errors
2. Verify API URLs are correct
3. Check if Freelancer API is accessible
4. Try refreshing the page

### No Results Shown
**Cause:** API returned empty data  
**Solution:**
1. Try removing filters
2. Check if API parameters are correct
3. Adjust budget range or skill filters
4. Try different search terms

### Search Not Working
**Cause:** Client-side search implementation issue  
**Solution:**
1. Check browser console for JavaScript errors
2. Verify search input has correct value
3. Try clearing URL query parameters

## API Rate Limits & Best Practices

1. **Cache Results**
   - Consider caching API responses to reduce requests
   - Implement request debouncing for search

2. **Error Handling**
   - Always handle API failures gracefully
   - Show user-friendly error messages

3. **Pagination**
   - Use server-side pagination when possible
   - Don't load all results at once

## Next Steps

1. **Test** - Browse projects and jobs on `/projects` and `/jobs`
2. **Customize** - Adjust filters, sort options, and styling
3. **Monitor** - Watch browser console for any issues
4. **Deploy** - Deploy to Vercel or your hosting provider

## Support

For issues with:
- **Freelancer API**: Check [Freelancer API Documentation](https://developers.freelancer.com)
- **This App**: Check browser console logs (look for `[v0]` messages)
- **Next.js**: Check [Next.js Documentation](https://nextjs.org/docs)

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│           Frontend (Next.js 16)              │
├─────────────────────────────────────────────┤
│  /projects         │         /jobs           │
│  (Contests API)    │     (Projects API)      │
├─────────────────────────────────────────────┤
│  Search → Filters → Sorting → Pagination    │
├─────────────────────────────────────────────┤
│          URL Query Parameters                │
│      (State Management & Syncing)            │
├─────────────────────────────────────────────┤
│     Freelancer.com REST APIs                │
└─────────────────────────────────────────────┘
```

## File Structure

```
lib/
├── api.ts                    # API calls & filtering logic
├── types.ts                  # TypeScript types

components/
├── contest-card.tsx          # Contest/Project card display
├── freelancer-project-card.tsx # Job card display
├── search-bar.tsx           # Search input
├── advanced-filters.tsx      # Filter panel
├── sorting-select.tsx        # Sort dropdown
└── pagination.tsx            # Pagination control

app/
├── projects/page.tsx         # Contests listing page
└── jobs/page.tsx            # Jobs listing page
```

Happy browsing!
