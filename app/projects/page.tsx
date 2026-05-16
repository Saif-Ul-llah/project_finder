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
    let results = contests;

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Freelance Projects & Contests
          </h1>
          <p className="text-muted-foreground">
            Browse thousands of projects from clients around the world
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col gap-4 mb-8">
          <SearchBar 
            placeholder="Search projects..." 
            onSearch={handleSearch}
            defaultValue={search}
          />
          
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex gap-3 flex-wrap">
              <AdvancedFilters 
                onFiltersChange={handleFiltersChange}
                initialFilters={{ budgetMin, budgetMax }}
              />
            </div>
            
            <SortingSelect 
              value={sortBy}
              onSortChange={handleSortChange}
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{paginatedContests.length}</span> of <span className="font-semibold text-foreground">{filteredContests.length}</span> projects
          </p>
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

        {/* Projects Grid */}
        {!loading && paginatedContests.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
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
