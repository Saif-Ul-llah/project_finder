'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { RankingSuggestion, RankingSuggestionsResponse, RankingFilters as RankingFiltersType } from '@/lib/types';
import { fetchRankedJobs } from '@/lib/ranking-api';
import { RankingFilters } from '@/components/ranking-filters';
import { RankingCard } from '@/components/ranking-card';
import { Pagination } from '@/components/pagination';
import { SearchBar } from '@/components/search-bar';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ITEMS_PER_PAGE = 20;

function RankingContent() {
  const [items, setItems] = useState<RankingSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('');
  const [platform, setPlatform] = useState('');
  const [techStack, setTechStack] = useState('');
  const [minPriority, setMinPriority] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [region, setRegion] = useState('');
  const [currency, setCurrency] = useState('');
  const [experience, setExperience] = useState('');
  const [duration, setDuration] = useState('');
  const [page, setPage] = useState(1);

  const filters: RankingFiltersType = useMemo(
    () => ({
      search: search || undefined,
      group: group || undefined,
      platform: platform || undefined,
      tech_stack: techStack || undefined,
      min_priority: minPriority ? Number(minPriority) : undefined,
      recommendation: recommendation || undefined,
      region: region || undefined,
      currency: currency || undefined,
      experience: experience || undefined,
      duration: duration || undefined,
      sort: 'priority',
      page,
      page_size: ITEMS_PER_PAGE,
    }),
    [
      search,
      group,
      platform,
      techStack,
      minPriority,
      recommendation,
      region,
      currency,
      experience,
      duration,
      page,
    ],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchRankedJobs(filters)
      .then((res: RankingSuggestionsResponse) => {
        if (cancelled) return;
        setItems(res.results);
        setTotal(res.count);
        setTotalPages(res.total_pages || 1);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setItems([]);
        setTotal(0);
        setError(err?.message || 'Failed to load suggestions. Is the backend running?');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, refreshKey]);

  const resetToFirstPage = () => setPage(1);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b border-border/50">
        <div className="container mx-auto px-4 py-10 sm:py-14">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-3">
            AI-Ranked{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              Suggestions
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            Jobs scored on skill match, client quality, competition, urgency and risk — ranked by live priority.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-6">
          <SearchBar
            placeholder="Search suggestions..."
            defaultValue={search}
            onSearch={(q) => {
              setSearch(q);
              resetToFirstPage();
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <RankingFilters
            group={group}
            platform={platform}
            techStack={techStack}
            minPriority={minPriority}
            recommendation={recommendation}
            region={region}
            currency={currency}
            experience={experience}
            duration={duration}
            onGroupChange={(v) => { setGroup(v); resetToFirstPage(); }}
            onPlatformChange={(v) => { setPlatform(v); resetToFirstPage(); }}
            onTechStackChange={(v) => { setTechStack(v); resetToFirstPage(); }}
            onMinPriorityChange={(v) => { setMinPriority(v); resetToFirstPage(); }}
            onRecommendationChange={(v) => { setRecommendation(v); resetToFirstPage(); }}
            onRegionChange={(v) => { setRegion(v); resetToFirstPage(); }}
            onCurrencyChange={(v) => { setCurrency(v); resetToFirstPage(); }}
            onExperienceChange={(v) => { setExperience(v); resetToFirstPage(); }}
            onDurationChange={(v) => { setDuration(v); resetToFirstPage(); }}
          />

          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{total}</span> suggestions found
              </p>
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-card hover:bg-accent px-3 h-9 text-sm font-medium text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading suggestions...</p>
              </div>
            )}

            {!loading && items.length > 0 && (
              <>
                <div className="flex flex-col gap-5 mb-8">
                  {items.map((s) => (
                    <RankingCard key={s.job_id} suggestion={s} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={total}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={(p) => {
                      setPage(p);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                )}
              </>
            )}

            {!loading && !error && items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 bg-card border border-border/50 rounded-xl text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No suggestions yet</h3>
                <p className="text-muted-foreground max-w-md">
                  Run the ranking pipeline (<code>python manage.py run_ranking</code>) against
                  ingested jobs, or adjust your filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RankingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>}>
      <RankingContent />
    </Suspense>
  );
}
