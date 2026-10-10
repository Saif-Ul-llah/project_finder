'use client';

// Large-organisation opportunities: public tenders today, pinned by
// platform rather than by anything tender-specific, so other
// enterprise-grade sources can join by extending ENTERPRISE_PLATFORMS.
//
// Mirrors /projects (same stale-while-revalidate core, same shared filter
// components) and differs in three ways: the platform is pinned and its
// control hidden, the default sort is by closing date, and the empty state
// distinguishes "nothing ingested yet" from "nothing matches your filters".

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { SearchBar } from '@/components/search-bar';
import { DEADLINE_SORT_OPTIONS, SortingSelect } from '@/components/sorting-select';
import { Pagination } from '@/components/pagination';
import { OpportunityCard } from '@/components/opportunity-card';
import { AlertCircle, Building2, Loader2, RefreshCw } from 'lucide-react';
import { Opportunity, OpportunitiesResponse, OpportunityFilters } from '@/lib/types';
import { fetchOpportunities, fetchStats } from '@/lib/api';
import { filterCacheKey, readCache, writeCache } from '@/lib/cache';
import { useLiveUpdates } from '@/hooks/use-live-updates';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ActiveFilterChips } from '@/components/filters/active-filter-chips';
import { FilterDrawer } from '@/components/filters/filter-drawer';
import {
  ENTERPRISE_PLATFORMS,
  ENTERPRISE_PLATFORM_PARAM,
  platformLabel,
} from '@/lib/filter-options';
import { ENTERPRISE_FILTERS, type FilterValues } from '@/lib/filter-schema';

const ITEMS_PER_PAGE = 12;

// Hidden in the drawer: offering a platform control on a page that pins the
// platform would let the two contradict each other.
const HIDDEN_FIELDS = ['platform'] as const;

function EnterpriseContent() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [values, setValues] = useState<FilterValues>({});
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('deadline_soon');
  const [page, setPage] = useState(1);

  const updateFilters = useCallback((patch: Partial<FilterValues>) => {
    setValues((current) => ({ ...current, ...patch }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setValues({});
    setPage(1);
  }, []);

  const [sourceOptions, setSourceOptions] = useState<string[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  // How many enterprise rows exist at all, regardless of filters. Platforms
  // with no rows are omitted from by_platform entirely, hence the default.
  const [ingestedCount, setIngestedCount] = useState<number | null>(null);

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
        setIngestedCount(
          ENTERPRISE_PLATFORMS.reduce(
            (sum, slug) => sum + (s.by_platform?.[slug] ?? 0),
            0,
          ),
        );
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
      // Merged last so no filter change can override the pin. The backend
      // accepts a comma-separated list, so this grows without a page edit.
      platform: ENTERPRISE_PLATFORM_PARAM,
    }),
    [values, search, sort, page],
  );

  const cacheKey = useMemo(() => filterCacheKey('ent', filters), [filters]);

  useEffect(() => {
    let cancelled = false;

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
          return same ? prev : res.results;
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

  const { revision } = useLiveUpdates(30000);
  useEffect(() => {
    if (revision > 0) setRefreshKey((k) => k + 1);
  }, [revision]);

  const resetToFirstPage = () => setPage(1);
  const handleSearch = useCallback((q: string) => { setSearch(q); setPage(1); }, []);

  const sources = ENTERPRISE_PLATFORMS.map(platformLabel).join(' & ');
  // Nothing ingested is a different situation from nothing matching, and
  // "try adjusting your filters" is actively misleading in the first case.
  const nothingIngested = ingestedCount === 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-gradient-to-br from-amber-500/10 via-background to-background border-b border-border/50">
        <div className="container mx-auto px-4 py-10 sm:py-14">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-muted-foreground">Enterprise</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-3">
            Enterprise{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-500/60">
              Opportunities
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            Tenders and large-organisation contracts from {sources}, normalized
            and deduplicated alongside the rest of your feed.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-6">
          <SearchBar placeholder="Search tenders..." onSearch={handleSearch} defaultValue={search} />
        </div>

        <ActiveFilterChips
          values={values}
          onChange={updateFilters}
          onReset={resetFilters}
          fields={ENTERPRISE_FILTERS}
          hiddenFields={[...HIDDEN_FIELDS]}
          dynamicOptions={dynamicOptions}
        />

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <FilterDrawer
            values={values}
            onChange={updateFilters}
            onReset={resetFilters}
            resultCount={total}
            fields={ENTERPRISE_FILTERS}
            hiddenFields={[...HIDDEN_FIELDS]}
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
            <SortingSelect
              value={sort}
              options={DEADLINE_SORT_OPTIONS}
              onSortChange={(v) => { setSort(v); resetToFirstPage(); }}
            />
          </div>
        </div>

        <div className="mb-6 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{total}</span>{' '}
          {total === 1 ? 'opportunity' : 'opportunities'} found
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <div className="flex flex-col gap-5 mb-8">
              {items.map((o) => (
                <OpportunityCard key={o.id} opportunity={o} />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              />
            )}
          </>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-card border border-border/50 rounded-xl text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
            {nothingIngested ? (
              <>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No enterprise opportunities yet
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Tenders appear here as soon as they are ingested. Nothing has
                  been pushed for{' '}
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    {ENTERPRISE_PLATFORM_PARAM}
                  </code>{' '}
                  yet — point your scraper at{' '}
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    /api/ingest/push/
                  </code>
                  .
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No results match your filters
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  There{' '}
                  {ingestedCount === 1
                    ? 'is 1 enterprise opportunity'
                    : `are ${ingestedCount ?? 0} enterprise opportunities`}{' '}
                  ingested, but none match what you have selected.
                </p>
                <Button variant="outline" onClick={resetFilters}>
                  Clear all filters
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EnterprisePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <EnterpriseContent />
    </Suspense>
  );
}
