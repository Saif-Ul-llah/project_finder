'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { SearchBar } from '@/components/search-bar';
import { SortingSelect } from '@/components/sorting-select';
import { Pagination } from '@/components/pagination';
import { OpportunityCard } from '@/components/opportunity-card';
import { Loader2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { Opportunity, OpportunitiesResponse, OpportunityFilters } from '@/lib/types';
import { fetchOpportunities, fetchStats } from '@/lib/api';
import { readCache, writeCache } from '@/lib/cache';
import { useLiveUpdates } from '@/hooks/use-live-updates';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CURRENCIES, EXPERIENCE_LEVELS, PROJECT_LENGTHS } from '@/lib/filter-options';

const ITEMS_PER_PAGE = 12;

const PLATFORMS = [
  { label: 'All Platforms', value: '' },
  { label: 'Upwork', value: 'upwork' },
  { label: 'Freelancer', value: 'freelancer' },
];

const JOB_TYPES = [
  { label: 'All Types', value: '' },
  { label: 'Hourly', value: 'hourly' },
  { label: 'Fixed', value: 'fixed' },
];

function OpportunitiesContent() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filter state
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [jobType, setJobType] = useState('');
  const [source, setSource] = useState('');
  const [verified, setVerified] = useState(false);
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [region, setRegion] = useState('');
  const [currency, setCurrency] = useState('');
  const [experience, setExperience] = useState('');
  const [duration, setDuration] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  // Available source/region values (populated from stats) for the filters.
  const [sourceOptions, setSourceOptions] = useState<string[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
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
      search: search || undefined,
      platform: platform || undefined,
      job_type: (jobType as 'hourly' | 'fixed') || undefined,
      source: source || undefined,
      verified: verified || undefined,
      min_budget: minBudget ? Number(minBudget) : undefined,
      max_budget: maxBudget ? Number(maxBudget) : undefined,
      region: region || undefined,
      currency: currency || undefined,
      experience: experience || undefined,
      duration: duration || undefined,
      sort,
      page,
      page_size: ITEMS_PER_PAGE,
    }),
    [
      search,
      platform,
      jobType,
      source,
      verified,
      minBudget,
      maxBudget,
      region,
      currency,
      experience,
      duration,
      sort,
      page,
    ],
  );

  const cacheKey = useMemo(() => `opps:${JSON.stringify(filters)}`, [filters]);

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
            Aggregated from Upwork &amp; Freelancer, normalized and deduplicated by your backend.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Search */}
        <div className="mb-6">
          <SearchBar placeholder="Search opportunities..." onSearch={handleSearch} defaultValue={search} />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Platform tabs */}
          <div className="flex rounded-lg border border-border/60 bg-card p-1">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => { setPlatform(p.value); resetToFirstPage(); }}
                className={`px-3 h-8 rounded-md text-sm font-medium transition-colors ${
                  platform === p.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Job type */}
          <div className="flex rounded-lg border border-border/60 bg-card p-1">
            {JOB_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => { setJobType(t.value); resetToFirstPage(); }}
                className={`px-3 h-8 rounded-md text-sm font-medium transition-colors ${
                  jobType === t.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Source filter (scraper / notification / api / push ...) */}
          {sourceOptions.length > 0 && (
            <select
              value={source}
              onChange={(e) => { setSource(e.target.value); resetToFirstPage(); }}
              className="h-10 rounded-lg border border-border/60 bg-card px-3 text-sm font-medium text-foreground capitalize"
              title="Filter by ingestion source"
            >
              <option value="">All Sources</option>
              {sourceOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}

          {/* Region filter */}
          {regionOptions.length > 0 && (
            <select
              value={region}
              onChange={(e) => { setRegion(e.target.value); resetToFirstPage(); }}
              className="h-10 rounded-lg border border-border/60 bg-card px-3 text-sm font-medium text-foreground"
              title="Filter by client region"
            >
              <option value="">All Regions</option>
              {regionOptions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          )}

          {/* Currency filter */}
          <select
            value={currency}
            onChange={(e) => { setCurrency(e.target.value); resetToFirstPage(); }}
            className="h-10 rounded-lg border border-border/60 bg-card px-3 text-sm font-medium text-foreground"
            title="Filter by budget currency"
          >
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          {/* Experience level filter */}
          <select
            value={experience}
            onChange={(e) => { setExperience(e.target.value); resetToFirstPage(); }}
            className="h-10 rounded-lg border border-border/60 bg-card px-3 text-sm font-medium text-foreground"
            title="Filter by experience level"
          >
            {EXPERIENCE_LEVELS.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>

          {/* Project length filter */}
          <select
            value={duration}
            onChange={(e) => { setDuration(e.target.value); resetToFirstPage(); }}
            className="h-10 rounded-lg border border-border/60 bg-card px-3 text-sm font-medium text-foreground"
            title="Filter by project length"
          >
            {PROJECT_LENGTHS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>

          {/* Verified toggle */}
          <Button
            variant={verified ? 'default' : 'outline'}
            size="sm"
            className="gap-2 h-10"
            onClick={() => { setVerified((v) => !v); resetToFirstPage(); }}
          >
            <ShieldCheck className="w-4 h-4" />
            Verified only
          </Button>

          {/* Budget range */}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min $"
              value={minBudget}
              onChange={(e) => { setMinBudget(e.target.value); resetToFirstPage(); }}
              className="w-24 h-10"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              placeholder="Max $"
              value={maxBudget}
              onChange={(e) => { setMaxBudget(e.target.value); resetToFirstPage(); }}
              className="w-24 h-10"
            />
          </div>

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
