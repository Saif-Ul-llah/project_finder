'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { SearchBar } from '@/components/search-bar';
import { SortingSelect } from '@/components/sorting-select';
import { Pagination } from '@/components/pagination';
import { OpportunityCard } from '@/components/opportunity-card';
import { Loader2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { Opportunity, OpportunityFilters } from '@/lib/types';
import { fetchOpportunities } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filter state
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [jobType, setJobType] = useState('');
  const [verified, setVerified] = useState(false);
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const filters: OpportunityFilters = {
          search: search || undefined,
          platform: platform || undefined,
          job_type: (jobType as 'hourly' | 'fixed') || undefined,
          verified: verified || undefined,
          min_budget: minBudget ? Number(minBudget) : undefined,
          max_budget: maxBudget ? Number(maxBudget) : undefined,
          sort,
          page,
          page_size: ITEMS_PER_PAGE,
        };
        const res = await fetchOpportunities(filters);
        setItems(res.results);
        setTotal(res.count);
        setTotalPages(res.total_pages || 1);
      } catch (err: any) {
        setError(err?.message || 'Failed to load opportunities. Is the backend running?');
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search, platform, jobType, verified, minBudget, maxBudget, sort, page, refreshKey]);

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
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-card hover:bg-accent px-3 h-10 text-sm font-medium text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <SortingSelect value={sort} onSortChange={(v) => { setSort(v); resetToFirstPage(); }} />
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          <span className="font-semibold text-foreground">{total}</span> opportunities found
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
