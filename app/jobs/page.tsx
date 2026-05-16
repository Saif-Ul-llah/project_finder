'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/search-bar';
import { AdvancedFilters, FilterState } from '@/components/advanced-filters';
import { SortingSelect } from '@/components/sorting-select';
import { Pagination } from '@/components/pagination';
import { FreelancerProjectCard } from '@/components/freelancer-project-card';
import { Loader2, AlertCircle } from 'lucide-react';
import { Project } from '@/lib/types';
import { fetchProjects, filterBySearch } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ITEMS_PER_PAGE = 12;

function JobsPageContent() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [totalProjectsCount, setTotalProjectsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Get filters from URL
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'submitdate';
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;

  // Load projects from API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await fetchProjects({
          page: Math.max(0, page - 1),
          limit: ITEMS_PER_PAGE,
          sortBy,
        });

        setProjects(result.data);
        setTotalProjectsCount(result.total);
        setCurrentPage(page);
      } catch (err) {
        console.error('[v0] Error loading projects:', err);
        setError('Failed to load jobs. Please try again.');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [page, sortBy]);

  // Apply client-side filtering
  useEffect(() => {
    let results = projects;

    // Search filter
    if (search) {
      results = filterBySearch(results, search);
    }

    setFilteredProjects(results);
  }, [projects, search]);

  const handleSearch = useCallback((query: string) => {
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    window.history.replaceState(null, '', `?${params.toString()}`);
  }, [searchParams]);

  const handleFiltersChange = useCallback((filters: FilterState) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    window.history.replaceState(null, '', `?${params.toString()}`);
  }, [searchParams]);

  const handleSortChange = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', value);
    params.set('page', '1');
    window.history.replaceState(null, '', `?${params.toString()}`);
  }, [searchParams]);

  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    window.history.replaceState(null, '', `?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams]);

  // Since the API paginates for us, we use the total count directly from the API.
  const totalPages = Math.ceil(totalProjectsCount / ITEMS_PER_PAGE);
  const paginatedProjects = filteredProjects; // API already paginated it

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Active Jobs & Opportunities
          </h1>
          <p className="text-muted-foreground">
            Find exciting freelance opportunities from clients worldwide
          </p>
        </div>

        {/* Search Bar (Full Width) */}
        <div className="mb-8">
          <SearchBar 
            placeholder="Search jobs..." 
            onSearch={handleSearch}
            defaultValue={search}
          />
          <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
            <span className="text-muted-foreground font-medium">Trending:</span>
            {['React', 'Node.js', 'Python', 'UI/UX', 'SEO', 'Content Writing'].map((tag) => (
              <button
                key={tag}
                onClick={() => handleSearch(tag)}
                className="text-primary hover:underline transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden lg:block lg:col-span-1 relative">
            <AdvancedFilters 
              onFiltersChange={handleFiltersChange}
              inline={true}
            />
          </div>

          {/* Main Listings Area */}
          <div className="lg:col-span-3 flex flex-col">
            {/* Mobile Filters & Sorting Row */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">
              <div className="lg:hidden flex gap-3 flex-wrap">
                <AdvancedFilters 
                  onFiltersChange={handleFiltersChange}
                />
              </div>

              <div className="flex items-center justify-between w-full lg:w-auto">
                <p className="text-sm text-muted-foreground mr-4">
                  <span className="font-semibold text-foreground">{totalProjectsCount}</span> jobs found
                </p>
                <SortingSelect 
                  value={sortBy}
                  onSortChange={handleSortChange}
                />
              </div>
            </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        )}

        {/* Jobs List View */}
        {!loading && paginatedProjects.length > 0 && (
          <>
            <div className="flex flex-col gap-5 mb-8">
              {paginatedProjects.map((project) => (
                <FreelancerProjectCard key={project.id} project={project} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && paginatedProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-card border border-border/50 rounded-xl text-center">
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              We couldn't find any jobs matching your criteria. Try adjusting your filters or search terms.
            </p>
            <button onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.delete('search');
              window.history.replaceState(null, '', `?${params.toString()}`);
            }} className="text-primary hover:underline font-medium">
              Clear all filters
            </button>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>}>
      <JobsPageContent />
    </Suspense>
  );
}
