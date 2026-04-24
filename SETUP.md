# Project Setup & Quick Start Guide

Welcome to the Marketplace application! This guide will help you get started with the project and integrate your own APIs.

## 📋 What's Included

This Next.js project includes:

### Pages
- **Home Page** (`/`) - Landing page with navigation
- **Projects Page** (`/projects`) - Browse and filter projects
- **Jobs/Contests Page** (`/jobs`) - Browse and filter contests and jobs

### Features
✅ **Search** - Full-text search across titles and descriptions
✅ **Advanced Filters** - Budget, skills, status, date range, bid count, rating
✅ **Sorting** - Multiple sort options (newest, budget, bids, rating)
✅ **Pagination** - Smart pagination with page-based navigation
✅ **URL State Management** - All filters stored in URL for bookmarking
✅ **Responsive Design** - Mobile-first, fully responsive UI
✅ **Dark Mode** - Built-in dark mode support

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Explore the App

The application comes with **mock data** so you can see it working immediately:

- **Projects Page**: 5 sample projects with various budgets and skills
- **Jobs Page**: 5 sample contests with different budgets
- All filtering, searching, sorting, and pagination work with mock data

## 🔌 Integrating Your APIs

### Step 1: Prepare Your API Endpoints

You'll need two API endpoints:

1. **Projects API** - Returns a list of projects
2. **Jobs/Contests API** - Returns a list of contests/jobs

### Step 2: Update Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_PROJECTS_API_URL=https://your-api.com/api/projects
NEXT_PUBLIC_JOBS_API_URL=https://your-api.com/api/jobs
```

### Step 3: Ensure API Response Format

Your APIs should return responses in this format:

```json
{
  "data": [
    {
      "id": "1",
      "title": "Project Title",
      "description": "Description",
      "budget": 5000,
      "status": "open",
      "skills": ["React", "Node.js"],
      "posted_date": "2024-04-20",
      "bidCount": 12,
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

See **API_INTEGRATION.md** for complete API documentation and field specifications.

### Step 4: Enable Real API Calls

Update the pages to use real APIs instead of mock data. In `app/projects/page.tsx` and `app/jobs/page.tsx`, uncomment the useEffect hooks that call `fetchProjects()` and `fetchJobs()`:

```typescript
// In app/projects/page.tsx
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

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx                 # Root layout with metadata
│   ├── page.tsx                   # Home page
│   ├── projects/
│   │   └── page.tsx              # Projects listing page
│   ├── jobs/
│   │   └── page.tsx              # Jobs/Contests listing page
│   └── globals.css               # Global styles
├── components/
│   ├── search-bar.tsx            # Search input component
│   ├── advanced-filters.tsx       # Advanced filters component
│   ├── sorting-select.tsx         # Sort dropdown component
│   ├── project-card.tsx           # Project card component
│   ├── job-card.tsx               # Job card component
│   ├── pagination.tsx             # Pagination component
│   └── ui/                        # shadcn/ui components
├── hooks/
│   └── use-query-params.ts        # URL query params hook
├── lib/
│   ├── types.ts                   # TypeScript types
│   ├── api.ts                     # API service layer
│   └── utils.ts                   # Utility functions
├── public/                        # Static assets
├── API_INTEGRATION.md             # Detailed API integration guide
├── SETUP.md                       # This file
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── postcss.config.mjs
```

## 🎨 Customization

### Change Colors & Theme

Edit `app/globals.css` to customize the design tokens:

```css
:root {
  --primary: oklch(0.205 0 0);          /* Change primary color */
  --background: oklch(1 0 0);           /* Change background */
  --foreground: oklch(0.145 0 0);       /* Change text color */
  /* ... more tokens ... */
}
```

### Add More Filter Options

Edit `components/advanced-filters.tsx`:

```typescript
const SKILL_OPTIONS = [
  'React',
  'Node.js',
  // Add more skills here
];

const STATUS_OPTIONS = ['open', 'closed', 'draft', 'featured'];
// Add more statuses
```

### Modify Items Per Page

In `app/projects/page.tsx` and `app/jobs/page.tsx`:

```typescript
const ITEMS_PER_PAGE = 12; // Change this number
```

### Change Sort Options

Edit `components/sorting-select.tsx`:

```typescript
const DEFAULT_SORT_OPTIONS: SortOption[] = [
  { label: 'Custom Option', value: 'custom', field: 'custom_field', order: 'desc' },
  // Add more options
];
```

## 🔧 Available Scripts

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Format code
pnpm format
```

## 📊 API Parameters Reference

### Projects API Query Parameters
```
tag=users                           # API type
type=false                          # Project type filter
budget_min=0                        # Minimum budget
budget_max=100000                   # Maximum budget
status=open                         # Status filter
iDisplayStart=0                     # Pagination start
iDisplayLength=20                   # Items per page
iSortingCols=1                      # Sort columns count
iSortCol_0=6                        # Sort column index
sSortDir_0=desc                     # Sort direction
format_version=3                    # API version
disableHighlights=true              # Highlight setting
search=keyword                      # Search query
```

### Jobs API Query Parameters
```
limit=20                            # Items per page
full_description=true               # Include full description
job_details=true                    # Include job details
jobs[]=9&jobs[]=31                  # Job IDs
sort_field=submitdate               # Sort by field
webapp=1                            # Webapp flag
compact=true                        # Compact response
search=keyword                      # Search query
```

## 🚨 Troubleshooting

### App won't load
- Make sure `pnpm install` was run
- Check that port 3000 is available
- Try `pnpm dev` again

### Filters not working
- Check that environment variables are set correctly
- Verify API response format matches expected schema
- Check browser console for errors

### API calls failing
- Ensure `NEXT_PUBLIC_PROJECTS_API_URL` and `NEXT_PUBLIC_JOBS_API_URL` are set
- Verify CORS is enabled on your API server
- Check network tab in browser DevTools

### Components not displaying
- Make sure all shadcn/ui components are installed
- Check that Tailwind CSS is properly configured
- Clear `.next` folder and rebuild: `rm -rf .next && pnpm build`

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)

## 📝 Notes

- The app uses **React 19** and **Next.js 15**
- All state management is done via URL query parameters
- No external state management library (Redux, Zustand) needed
- Mock data is useful for development and testing without API
- All components are fully typed with TypeScript

## 🎯 Next Steps

1. **Review the API Integration Guide** (`API_INTEGRATION.md`)
2. **Set up your API endpoints**
3. **Test with mock data first**
4. **Connect your real APIs**
5. **Customize colors and branding**
6. **Deploy to Vercel** (optional)

Enjoy building! 🚀
