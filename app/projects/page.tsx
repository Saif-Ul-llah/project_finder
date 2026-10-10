'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { SearchBar } from '@/components/search-bar';
import { SortingSelect } from '@/components/sorting-select';
import { Pagination } from '@/components/pagination';
import { OpportunityCard } from '@/components/opportunity-card';
import { Loader2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { Opportunity, OpportunitiesResponse, OpportunityFilters } from '@/lib/types';
import { fetchOpportunities, fetchStats } from '@/lib/api';
import { filterCacheKey, readCache, writeCache } from '@/lib/cache';
import { useLiveUpdates } from '@/hooks/use-live-updates';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActiveFilterChips } from '@/components/filters/active-filter-chips';
import { FilterDrawer } from '@/components/filters/filter-drawer';
import { PLATFORMS } from '@/lib/filter-options';
import type { FilterValues } from '@/lib/filter-schema';

const ITEMS_PER_PAGE = 12;

function OpportunitiesContent() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  // One object rather than a useState per filter: the drawer takes a single
  // patch callback, which also centralises the page reset that used to be
  // repeated on all thirteen handlers.
  const [values, setValues] = useState<FilterValues>({});
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const updateFilters = useCallback((patch: Partial<FilterValues>) => {
    setValues((current) => ({ ...current, ...patch }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setValues({});
    setPage(1);
  }, []);

  // Source and region options come from the live data (stats.by_source /
  // stats.by_region) rather than a fixed list, so they always match what has
  // actually been ingested.
  const [sourceOptions, setSourceOptions] = useState<string[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const dynamicOptions = useMemo(
    () => ({
      source: sourceOptions.map((v) => ({ label: v, value: v })),
      region: regionOptions.map((v) => ({ label: v, value: v })),
    }),
    [sourceOptions, regionOptions],
  );
  useEffect(() => {
    fetchStats()
      .then((s) => {
        setSourceOptions(Object.keys(s.by_source || {}));
        setRegionOptions(Object.keys(s.by_region || {}).sort());
      })
      .catch(() => {});
  }, [refreshKey]);

  const filters: OpportunityFilters = useMemo(
    () => ({
      ...values,
      search: search || undefined,
      sort,
      page,
      page_size: ITEMS_PER_PAGE,
    }),
    [values, search, sort, page],
  );

  // filterCacheKey sorts the keys. `values` is spread-patched, so its key
  // order follows the order the controls were touched, and a plain
  // JSON.stringify would produce different keys for identical filters.
  const cacheKey = useMemo(() => filterCacheKey('opps', filters), [filters]);

  useEffect(() => {
    let cancelled = false;

    // Stale-while-revalidate: show cached results instantly on refresh, then
    // revalidate in the background and only re-render if the data changed.
    const cached = readCache<OpportunitiesResponse>(cacheKey);
    if (cached) {
      setItems(cached.results);
      setTotal(cached.count);
      setTotalPages(cached.total_pages || 1);
      setLoading(false);
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    fetchOpportunities(filters)
      .then((res) => {
        if (cancelled) return;
        writeCache(cacheKey, res);
        setItems((prev) => {
          const same =
            prev.length === res.results.length &&
            prev.every((p, i) => p.id === res.results[i]?.id);
          return same ? prev : res.results; // avoid re-render when unchanged
        });
        setTotal(res.count);
        setTotalPages(res.total_pages || 1);
      })
      .catch((err: any) => {
        if (cancelled) return;
        if (!cached) {
          setItems([]);
          setTotal(0);
        }
        setError(err?.message || 'Failed to load opportunities. Is the backend running?');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        setRefreshing(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, refreshKey]);

  // Smart polling: when the backend signals new/changed data, re-run the
  // current query. The SWR cache keeps this flash-free.
  const { revision } = useLiveUpdates(30000);
  useEffect(() => {
    if (revision > 0) setRefreshKey((k) => k + 1);
  }, [revision]);

  const resetToFirstPage = () => setPage(1);
  const handleSearch = useCallback((q: string) => { setSearch(q); setPage(1); }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b border-border/50">
        <div className="container mx-auto px-4 py-10 sm:py-14">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-3">
            Discover{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              Freelance
            </span>{' '}
            Opportunities
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            Aggregated from {PLATFORMS.filter((p) => p.value).map((p) => p.label).join(', ')} — normalized and deduplicated by your backend.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Search */}
        <div className="mb-6">
          <SearchBar placeholder="Search opportunities..." onSearch={handleSearch} defaultValue={search} />
        </div>

        {/* Active filters, then the controls behind a trigger. Thirteen
            controls inline left no room for labels and wrapped into ragged
            rows; chips keep what is applied visible without the bulk. */}
        <ActiveFilterChips
          values={values}
          onChange={updateFilters}
          onReset={resetFilters}
          dynamicOptions={dynamicOptions}
        />

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <FilterDrawer
            values={values}
            onChange={updateFilters}
            onReset={resetFilters}
            resultCount={total}
            dynamicOptions={dynamicOptions}
          />

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-card hover:bg-accent px-3 h-10 text-sm font-medium text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading || refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <SortingSelect value={sort} onSortChange={(v) => { setSort(v); resetToFirstPage(); }} />
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
          <span>
            <span className="font-semibold text-foreground">{total}</span> opportunities found
          </span>
          {refreshing ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/70">
              <Loader2 className="w-3 h-3 animate-spin" /> updating…
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"
              title="Auto-updating: the list refreshes when new jobs are ingested"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
          )}
        </p>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading opportunities...</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <>
            <div className="flex flex-col gap-5 mb-8">
              {items.map((o) => (
                <OpportunityCard key={o.id} opportunity={o} />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            )}
          </>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-card border border-border/50 rounded-xl text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No opportunities found</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Try adjusting filters, or run a pull from the{' '}
              <a href="/admin" className="text-primary hover:underline">Admin</a> page to ingest data.
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
      <OpportunitiesContent />
    </Suspense>
  );
}
