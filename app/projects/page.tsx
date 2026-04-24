'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import { SearchBar } from '@/components/search-bar';
import { AdvancedFilters, FilterState } from '@/components/advanced-filters';
import { SortingSelect } from '@/components/sorting-select';
import { ProjectCard } from '@/components/project-card';
import { Pagination } from '@/components/pagination';
import { mockProjects } from '@/lib/api';
import { Project } from '@/lib/types';
import { useQueryParams } from '@/hooks/use-query-params';
import { Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export default function ProjectsPage() {
  const { updateQueryParams, getParam, getNumericParam } = useQueryParams();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(mockProjects);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(getNumericParam('page', 1));

  // Get current filters from URL
  const searchQuery = getParam('search', '');
  const budgetMin = getNumericParam('budgetMin', 0);
  const budgetMax = getNumericParam('budgetMax', 100000);
  const status = getParam('status', '');
  const sortBy = getParam('sortBy', 'posted_date');
  const sortOrder = (getParam('sortOrder', 'desc') as 'asc' | 'desc');

  // Apply filters and sorting
  useEffect(() => {
    let result = [...projects];

    // Search
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Budget filter
    if (budgetMin > 0 || budgetMax < 100000) {
      result = result.filter((p) => {
        const projectBudget = p.budget || 0;
        return projectBudget >= budgetMin && projectBudget <= budgetMax;
      });
    }

    // Status filter
    if (status) {
      result = result.filter((p) => p.status === status);
    }

    // Sorting
    result.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'budget':
          aValue = a.budget || 0;
          bValue = b.budget || 0;
          break;
        case 'bidCount':
          aValue = a.bidCount || 0;
          bValue = b.bidCount || 0;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'posted_date':
        default:
          aValue = a.posted_date ? new Date(a.posted_date).getTime() : 0;
          bValue = b.posted_date ? new Date(b.posted_date).getTime() : 0;
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    setFilteredProjects(result);
    setCurrentPage(1);
  }, [projects, searchQuery, budgetMin, budgetMax, status, sortBy, sortOrder]);

  // Handle search
  const handleSearch = (query: string) => {
    updateQueryParams({ search: query, page: undefined });
  };

  // Handle filters
  const handleFiltersChange = (filters: FilterState) => {
    updateQueryParams({
      budgetMin: filters.budgetMin || undefined,
      budgetMax: filters.budgetMax || undefined,
      status: filters.status || undefined,
      page: undefined,
    });
  };

  // Handle sort
  const handleSort = (field: string, order: 'asc' | 'desc') => {
    updateQueryParams({
      sortBy: field,
      sortOrder: order,
      page: undefined,
    });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateQueryParams({ page: page > 1 ? page : undefined });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-40 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Projects</h1>
              <p className="text-muted-foreground mt-1">
                Browse and find your next project
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters Section */}
        <div className="mb-8 space-y-4">
          <SearchBar
            onSearch={handleSearch}
            defaultValue={searchQuery || ''}
            placeholder="Search projects by title or skills..."
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <AdvancedFilters onFiltersChange={handleFiltersChange} />
            </div>
            <SortingSelect onSortChange={handleSort} />
          </div>

          {/* Active filters display */}
          {(searchQuery || budgetMin > 0 || budgetMax < 100000 || status) && (
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1">
                  Search: {searchQuery}
                </span>
              )}
              {(budgetMin > 0 || budgetMax < 100000) && (
                <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1">
                  Budget: ${budgetMin} - ${budgetMax}
                </span>
              )}
              {status && (
                <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1">
                  Status: {status}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Found <span className="font-semibold">{filteredProjects.length}</span> project
            {filteredProjects.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Cards Grid */}
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : paginatedProjects.length > 0 ? (
          <>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {paginatedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={filteredProjects.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </div>
          </>
        ) : (
          <div className="flex h-96 flex-col items-center justify-center rounded-lg border border-dashed border-border">
            <p className="text-lg font-semibold text-foreground">
              No projects found
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
