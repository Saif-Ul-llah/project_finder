'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/search-bar';
import { AdvancedFilters, FilterState } from '@/components/advanced-filters';
import { SortingSelect } from '@/components/sorting-select';
import { Pagination } from '@/components/pagination';
import { ContestCard } from '@/components/contest-card';
import { Loader2, AlertCircle } from 'lucide-react';
import { ContestProject } from '@/lib/types';
import { fetchContests, filterBySearch, filterByBudget, sortItems } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ITEMS_PER_PAGE = 12;

function ProjectsPageContent() {
  const searchParams = useSearchParams();
  const [contests, setContests] = useState<ContestProject[]>([]);
  const [filteredContests, setFilteredContests] = useState<ContestProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Get filters from URL
  const search = searchParams.get('search') || '';
  const budgetMin = searchParams.get('budgetMin') ? parseInt(searchParams.get('budgetMin')!) : undefined;
  const budgetMax = searchParams.get('budgetMax') ? parseInt(searchParams.get('budgetMax')!) : undefined;
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;

  // Load contests from API
  useEffect(() => {
    const loadContests = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchContests({
          page: Math.max(0, page - 1),
          limit: ITEMS_PER_PAGE,
          budgetMin,
          budgetMax,
          sortBy,
        });

        setContests(result.data);
        setTotalResults(result.totalDisplay);
        setCurrentPage(page);
      } catch (err) {
        console.error('[v0] Error loading contests:', err);
        setError('Failed to load projects. Please try again.');
        setContests([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };

    loadContests();
  }, [page, budgetMin, budgetMax, sortBy]);

  // Apply client-side filtering
  useEffect(() => {
    let results: any = contests;

    // Search filter
    if (search) {
      results = filterBySearch(results, search);
    }

    // Budget filter
    if (budgetMin || budgetMax) {
      results = filterByBudget(results, budgetMin, budgetMax);
    }

    // Sort
    if (sortBy) {
      results = sortItems(results, sortBy, 'desc');
    }

    setFilteredContests(results);
  }, [contests, search, budgetMin, budgetMax, sortBy]);

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

    if (filters.budgetMin) {
      params.set('budgetMin', filters.budgetMin.toString());
    } else {
      params.delete('budgetMin');
    }

    if (filters.budgetMax) {
      params.set('budgetMax', filters.budgetMax.toString());
    } else {
      params.delete('budgetMax');
    }

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

  const totalPages = Math.ceil(filteredContests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedContests = filteredContests.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b border-border/50">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Freelance</span> Projects
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Browse thousands of projects and contests from clients around the world. Find your next big opportunity and start building today.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">

        {/* Search Bar (Full Width) */}
        <div className="mb-8">
          <SearchBar
            placeholder="Search projects..."
            onSearch={handleSearch}
            defaultValue={search}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden lg:block lg:col-span-1 relative">
            <AdvancedFilters
              onFiltersChange={handleFiltersChange}
              initialFilters={{ budgetMin, budgetMax }}
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
                  initialFilters={{ budgetMin, budgetMax }}
                />
              </div>

              <div className="flex items-center justify-between w-full lg:w-auto">
                <p className="text-sm text-muted-foreground mr-4">
                  <span className="font-semibold text-foreground">{filteredContests.length}</span> projects found
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
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        )}

        {/* Projects List View */}
        {!loading && paginatedContests.length > 0 && (
          <>
            <div className="flex flex-col gap-5 mb-8">
              {paginatedContests.map((contest) => (
                <ContestCard key={contest.project_id} contest={contest} />
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
        {!loading && paginatedContests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-card border border-border/50 rounded-xl text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              We couldn't find any projects matching your criteria. Try adjusting your filters or search terms.
            </p>
            <button onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.delete('search');
              params.delete('budgetMin');
              params.delete('budgetMax');
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

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>}>
      <ProjectsPageContent />
    </Suspense>
  );
}
