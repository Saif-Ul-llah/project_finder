# Frequently Asked Questions

## Getting Started

### Q: How do I run the project?
**A:** 
```bash
pnpm install
pnpm dev
```
Then open http://localhost:3000

### Q: Do I need to connect APIs immediately?
**A:** No! The app works perfectly with mock data. You can test all features first, then integrate your APIs later.

### Q: Can I test the filtering without APIs?
**A:** Yes! All filtering, searching, sorting, and pagination work with the mock data included.

## API Integration

### Q: How do I connect my APIs?
**A:** 
1. Set environment variables in `.env.local`
2. Update the page components to fetch from your APIs
3. See `IMPLEMENTATION_EXAMPLE.md` for code examples

### Q: What format should my API return?
**A:** See `API_INTEGRATION.md` for the exact response format with field names and types.

### Q: Can I have different field names in my API?
**A:** Yes! The `fetchProjects()` and `fetchJobs()` functions in `lib/api.ts` can map your fields to the expected format. See examples in `IMPLEMENTATION_EXAMPLE.md`.

### Q: Do I need to implement pagination on the backend?
**A:** Not required initially. The app can paginate client-side. For large datasets, implement backend pagination and update the page to use it.

### Q: How do I handle CORS errors?
**A:** 
- Ensure your API allows requests from your domain
- Check CORS headers are configured properly
- Use a CORS proxy if needed during development

### Q: Can I filter by multiple skills?
**A:** Yes! The advanced filters support multi-select for skills.

## Customization

### Q: How do I change the colors?
**A:** Edit design tokens in `app/globals.css`. The whole color scheme uses CSS variables, so changing a few variables updates everything.

### Q: How do I add more filter options?
**A:** Edit the arrays in `components/advanced-filters.tsx`:
- `SKILL_OPTIONS` - Add skills
- `STATUS_OPTIONS` - Add statuses
- `DATE_RANGE_OPTIONS` - Add date ranges

### Q: Can I change how many items show per page?
**A:** Yes! In `app/projects/page.tsx` and `app/jobs/page.tsx`, change:
```typescript
const ITEMS_PER_PAGE = 12;
```

### Q: How do I add a new sort option?
**A:** Edit `DEFAULT_SORT_OPTIONS` in `components/sorting-select.tsx`.

### Q: Can I customize the cards (ProjectCard, JobCard)?
**A:** Yes! Edit `components/project-card.tsx` and `components/job-card.tsx`. You can add/remove fields, change layout, etc.

## Features

### Q: How does the search work?
**A:** Full-text search across title and description fields. The search query is stored in the URL so results are bookmarkable.

### Q: Are filters cumulative?
**A:** Yes! You can combine multiple filters. For example, search for "React" AND budget $1000-$5000 AND status "open".

### Q: Can I bookmark a filtered result?
**A:** Yes! All filter states are in the URL. You can bookmark or share filtered URLs.

### Q: How does pagination work?
**A:** Shows smart page numbers. For example: `1 2 3 ... 10`. Click a page or use Previous/Next buttons.

### Q: Is there a loading state?
**A:** Yes! Shows a spinner while loading data. You'll see it when you connect real APIs.

### Q: What happens if no results match my filters?
**A:** Shows a friendly "No results found" message with a suggestion to adjust filters.

## Troubleshooting

### Q: The app won't start
**A:** 
- Make sure Node.js is installed (v18+)
- Run `pnpm install` first
- Try clearing `.next` folder: `rm -rf .next`
- Try `pnpm dev` again

### Q: Filters aren't working
**A:** 
- Make sure you're using mock data or the API is returning data
- Check browser console for errors
- Verify the filter state in the URL

### Q: API calls are failing
**A:** 
- Check environment variables are set in `.env.local`
- Verify API endpoints are correct
- Check browser Network tab for response status
- Ensure CORS is enabled on your API

### Q: Cards look broken
**A:** 
- Clear browser cache
- Rebuild: `pnpm build`
- Check that all shadcn/ui components are installed

### Q: Dark mode isn't working
**A:** 
- This depends on system/browser preference
- To force dark mode, add `dark` class to `<html>` in `app/layout.tsx`

## Development

### Q: How do I add a new page?
**A:** Create a folder in `app/` with a `page.tsx` file. Next.js handles routing automatically.

### Q: Can I use Redux or other state management?
**A:** Yes, but not needed! The app uses URL-based state management which is simpler and more shareable.

### Q: How do I add unit tests?
**A:** The project is set up for testing. Add test files next to components and run `pnpm test`.

### Q: Can I deploy to Vercel?
**A:** Yes! Push to GitHub and deploy via Vercel. Don't forget to set environment variables in Vercel dashboard.

### Q: How do I add TypeScript?
**A:** Already included! All components are fully typed.

## Performance

### Q: Will the app be slow with lots of data?
**A:** 
- Currently pages with 1000+ items might be slow
- For large datasets, implement backend pagination
- The app handles pagination well up to a few thousand items

### Q: Should I implement caching?
**A:** Optional. For frequently accessed data, you can cache API responses. See `IMPLEMENTATION_EXAMPLE.md` for caching patterns.

### Q: How do I optimize images?
**A:** Use Next.js `<Image>` component instead of `<img>` tags.

## Styling

### Q: Can I use a different CSS framework?
**A:** Yes, but you'd need to replace Tailwind CSS. Tailwind is recommended for this project.

### Q: How do I customize the theme?
**A:** Edit CSS variables in `app/globals.css`. All colors use CSS variables for easy theming.

### Q: Can I use custom fonts?
**A:** Yes! Add fonts to `app/layout.tsx` and reference in Tailwind config.

## Mobile & Responsiveness

### Q: Is the app mobile-friendly?
**A:** Yes! Built mobile-first. All components are responsive.

### Q: How do I test on mobile?
**A:** Use browser DevTools device emulation or access via your network IP on a real device.

### Q: Are touch interactions supported?
**A:** Yes! All buttons and interactive elements work on touch devices.

## Deployment

### Q: What's the recommended hosting?
**A:** Vercel (made by Next.js creators), Netlify, or any Node.js hosting.

### Q: Do I need to build before deploying?
**A:** Platforms handle this automatically when you push code.

### Q: How do I set environment variables in production?
**A:** 
- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Build & Deploy → Environment
- **Other**: Configure in your host's dashboard

### Q: Will the app work without my API?
**A:** Yes! Mock data works locally. But in production, you need the API.

## Advanced Questions

### Q: Can I have multiple filter panels?
**A:** Yes! The advanced filters component is modular. You could create multiple filter components.

### Q: Can I add real-time updates?
**A:** Yes! Use WebSockets or Server-Sent Events. The app structure supports this.

### Q: How do I add user accounts?
**A:** Add authentication via Supabase, Auth0, or another provider. Store user preferences and filter states.

### Q: Can I add favorites/saved items?
**A:** Yes! Add a database table and endpoints to save/load favorites.

### Q: How do I export filtered results?
**A:** Add a button that generates CSV/PDF from the filtered data.

## Getting Help

### Q: Where do I find more information?
**A:** 
- `SETUP.md` - Setup and quick start
- `API_INTEGRATION.md` - API requirements and examples
- `IMPLEMENTATION_EXAMPLE.md` - Code examples
- `PROJECT_SUMMARY.md` - Project overview
- Component source files have comments explaining logic

### Q: What if I find a bug?
**A:** 
1. Check the browser console for errors
2. Check the Network tab for API issues
3. Review component code for the issue
4. Test with mock data first

### Q: Can I use this project commercially?
**A:** Yes! This is a template you own and can use for any project.

## Tips & Tricks

### Tip 1: URL State is Your Friend
All filters are in the URL. Use this for debugging:
- Check the URL to see current state
- Copy URL to share filtered results
- Use browser back button to go back to previous filters

### Tip 2: Test with Mock Data First
Before connecting your API:
- Test all filters work
- Test search works
- Test pagination works
- Verify UI looks good

### Tip 3: Start Simple
When integrating APIs:
1. Get basic list working first
2. Add one filter at a time
3. Test after each change
4. Then move to production

### Tip 4: Read the Code
The components are well-organized:
- `search-bar.tsx` - Simple search
- `advanced-filters.tsx` - Complex filtering
- `pagination.tsx` - Smart page navigation
- `*-card.tsx` - Data display components

### Tip 5: Use Browser DevTools
- Console: See any errors
- Network: Monitor API calls
- Elements: Inspect component structure
- Performance: Profile app speed

---

**Can't find your answer?** Check the documentation files or review the component source code. Everything is well-commented! 🚀
