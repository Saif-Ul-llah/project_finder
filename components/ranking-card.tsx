'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GeneratedProposal, RankingSuggestion } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';
import { readProposal } from '@/lib/proposal-cache';

const PROPOSAL_ELIGIBLE = new Set(['BID_IMMEDIATELY', 'BID']);

const RECOMMENDATION_STYLES: Record<string, string> = {
  BID_IMMEDIATELY: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  BID: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  REVIEW_FIRST: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  LOW_PRIORITY: 'bg-secondary text-secondary-foreground',
  DO_NOT_BID: 'bg-destructive text-white',
};

const RECOMMENDATION_LABELS: Record<string, string> = {
  BID_IMMEDIATELY: 'Bid Immediately',
  BID: 'Bid',
  REVIEW_FIRST: 'Review First',
  LOW_PRIORITY: 'Low Priority',
  DO_NOT_BID: 'Do Not Bid',
};

function budgetText(s: RankingSuggestion): string {
  if (s.budget_raw) return s.budget_raw;
  if (s.budget_min != null && s.budget_max != null) return `$${s.budget_min} - $${s.budget_max}`;
  return 'TBD';
}

function formatKarachiTime(dateString: string | Date | null | undefined): string | null {
  if (!dateString) return null;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function ScoreBar({ label, value }: { label: string; value: number | null }) {
  const v = value ?? 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value != null ? Math.round(value) : '-'}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

export function RankingCard({ suggestion: s }: { suggestion: RankingSuggestion }) {
  const [open, setOpen] = useState(false);
  const [proposal, setProposal] = useState<GeneratedProposal | null>(null);

  useEffect(() => {
    setProposal(readProposal(s.job_id));
  }, [s.job_id]);

  const canGenerateProposal = PROPOSAL_ELIGIBLE.has(s.recommendation);

  return (
    <div className="border border-border/50 rounded-xl p-5 sm:p-6 bg-card hover:shadow-lg transition-all duration-300">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="text-xs rounded-full capitalize">
            {s.platform}
          </Badge>
          {s.dominant_group && (
            <Badge variant="secondary" className="text-xs rounded-full">
              {s.dominant_group}
            </Badge>
          )}
          {s.recommendation && (
            <Badge
              className={`text-xs rounded-full ${RECOMMENDATION_STYLES[s.recommendation] || ''}`}
            >
              {RECOMMENDATION_LABELS[s.recommendation] || s.recommendation}
            </Badge>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Priority</div>
          <div className="text-xl font-bold text-foreground">{Math.round(s.live_priority)}</div>
        </div>
      </div>

      <h3 className="font-semibold text-lg text-foreground line-clamp-2">
        <a href={s.url || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {s.title}
        </a>
      </h3>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span>Budget: {budgetText(s)}</span>
        {s.rating != null && <span>Rating: {s.rating.toFixed(1)}</span>}
        {s.client_country && <span>{s.client_country}</span>}
        {s.created_at && <span>Posted: {formatKarachiTime(s.created_at)}</span>}
      </div>

      {s.tech_stack?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {s.tech_stack.slice(0, 8).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs bg-secondary/50 border-0 rounded-full">
              {skill}
            </Badge>
          ))}
        </div>
      )}

      <Collapsible open={open} onOpenChange={setOpen} className="mt-4 pt-4 border-t border-border/40">
        <CollapsibleTrigger className="flex items-center gap-1.5 text-sm font-medium text-primary">
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          {open ? 'Hide' : 'Show'} score breakdown
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <ScoreBar label="Skill" value={s.skill_match_score} />
            <ScoreBar label="Client" value={s.client_quality_score} />
            <ScoreBar label="Competition" value={s.competition_score} />
            <ScoreBar label="Urgency" value={s.urgency_score} />
            <ScoreBar label="Risk" value={s.risk_score} />
          </div>

          {s.risk_flags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {s.risk_flags.map((flag) => (
                <Badge key={flag} variant="destructive" className="text-xs rounded-full">
                  {flag}
                </Badge>
              ))}
            </div>
          )}

          {s.ai_reasoning && (
            <p className="text-sm text-muted-foreground leading-relaxed">{s.ai_reasoning}</p>
          )}

          {s.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {s.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs rounded-full">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <a
            href={s.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline w-fit"
          >
            View on {s.platform}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </CollapsibleContent>
      </Collapsible>

      {canGenerateProposal && (
        <div className="mt-4 pt-4 border-t border-border/40">
          <Button size="sm" variant="outline" className="gap-2" asChild>
            <Link href={`/ranking/${s.job_id}/proposal`}>
              {proposal ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <FileText className="w-4 h-4" />}
              {proposal ? 'View Proposal' : 'Generate Proposal'}
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}