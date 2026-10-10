'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { RankingGroup } from '@/lib/types';
import { fetchRankingGroups } from '@/lib/ranking-api';
import { fetchStats } from '@/lib/api';
import { CURRENCIES, EXPERIENCE_LEVELS, PROJECT_LENGTHS } from '@/lib/filter-options';

const PLATFORMS = [
  { label: 'All Sources', value: '' },
  { label: 'Upwork', value: 'upwork' },
  { label: 'Freelancer', value: 'freelancer' },
];

const RECOMMENDATIONS = [
  { label: 'All Recommendations', value: '' },
  { label: 'Bid Immediately', value: 'BID_IMMEDIATELY' },
  { label: 'Bid', value: 'BID' },
  { label: 'Review First', value: 'REVIEW_FIRST' },
  { label: 'Low Priority', value: 'LOW_PRIORITY' },
  { label: 'Do Not Bid', value: 'DO_NOT_BID' },
];

interface RankingFiltersProps {
  group: string;
  platform: string;
  techStack: string;
  minPriority: string;
  recommendation: string;
  region: string;
  currency: string;
  experience: string;
  duration: string;
  onGroupChange: (v: string) => void;
  onPlatformChange: (v: string) => void;
  onTechStackChange: (v: string) => void;
  onMinPriorityChange: (v: string) => void;
  onRecommendationChange: (v: string) => void;
  onRegionChange: (v: string) => void;
  onCurrencyChange: (v: string) => void;
  onExperienceChange: (v: string) => void;
  onDurationChange: (v: string) => void;
}

export function RankingFilters({
  group,
  platform,
  techStack,
  minPriority,
  recommendation,
  region,
  currency,
  experience,
  duration,
  onGroupChange,
  onPlatformChange,
  onTechStackChange,
  onMinPriorityChange,
  onRecommendationChange,
  onRegionChange,
  onCurrencyChange,
  onExperienceChange,
  onDurationChange,
}: RankingFiltersProps) {
  const [groups, setGroups] = useState<RankingGroup[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchRankingGroups()
      .then((res) => setGroups(res.results || []))
      .catch(() => {});
    fetchStats()
      .then((s) => setRegionOptions(Object.keys(s.by_region || {}).sort()))
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-5">
      <div>
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
          Group
        </label>
        <select
          value={group}
          onChange={(e) => onGroupChange(e.target.value)}
          className="w-full h-10 rounded-lg border border-border/60 bg-background px-3 text-sm"
        >
          <option value="">All Groups</option>
          {groups.map((g) => (
            <option key={g.id} value={g.name}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
          Source
        </label>
        <select
          value={platform}
          onChange={(e) => onPlatformChange(e.target.value)}
          className="w-full h-10 rounded-lg border border-border/60 bg-background px-3 text-sm"
        >
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
          Region
        </label>
        <select
          value={region}
          onChange={(e) => onRegionChange(e.target.value)}
          className="w-full h-10 rounded-lg border border-border/60 bg-background px-3 text-sm"
        >
          <option value="">All Regions</option>
          {regionOptions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
          Currency
        </label>
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="w-full h-10 rounded-lg border border-border/60 bg-background px-3 text-sm"
        >
          {CURRENCIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
          Experience Level
        </label>
        <select
          value={experience}
          onChange={(e) => onExperienceChange(e.target.value)}
          className="w-full h-10 rounded-lg border border-border/60 bg-background px-3 text-sm"
        >
          {EXPERIENCE_LEVELS.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
          Project Length
        </label>
        <select
          value={duration}
          onChange={(e) => onDurationChange(e.target.value)}
          className="w-full h-10 rounded-lg border border-border/60 bg-background px-3 text-sm"
        >
          {PROJECT_LENGTHS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
          Tech Stack
        </label>
        <Input
          placeholder="e.g. django"
          value={techStack}
          onChange={(e) => onTechStackChange(e.target.value)}
          className="h-10"
        />
      </div>

      <div>
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
          Min Priority
        </label>
        <Input
          type="number"
          placeholder="0"
          value={minPriority}
          onChange={(e) => onMinPriorityChange(e.target.value)}
          className="h-10"
        />
      </div>

      <div>
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
          Recommendation
        </label>
        <select
          value={recommendation}
          onChange={(e) => onRecommendationChange(e.target.value)}
          className="w-full h-10 rounded-lg border border-border/60 bg-background px-3 text-sm"
        >
          {RECOMMENDATIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
