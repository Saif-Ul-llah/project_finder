'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { RankingGroup } from '@/lib/types';
import { fetchRankingGroups } from '@/lib/ranking-api';

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
  techStack: string;
  minPriority: string;
  recommendation: string;
  onGroupChange: (v: string) => void;
  onTechStackChange: (v: string) => void;
  onMinPriorityChange: (v: string) => void;
  onRecommendationChange: (v: string) => void;
}

export function RankingFilters({
  group,
  techStack,
  minPriority,
  recommendation,
  onGroupChange,
  onTechStackChange,
  onMinPriorityChange,
  onRecommendationChange,
}: RankingFiltersProps) {
  const [groups, setGroups] = useState<RankingGroup[]>([]);

  useEffect(() => {
    fetchRankingGroups()
      .then((res) => setGroups(res.results || []))
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
