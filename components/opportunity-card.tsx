'use client';

import { Opportunity } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import {
  CalendarClock,
  Clock,
  ExternalLink,
  MapPin,
  Shield,
  Star,
  TrendingUp,
} from 'lucide-react';

// Amber for tender so institutional sources read differently from the
// gig-platform greens and blues at a glance.
const PLATFORM_STYLES: Record<string, string> = {
  upwork: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  freelancer: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  fiverr: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  workana: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  freelancermap: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  tender: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
};

/** Days until `iso`, negative when past. */
function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

/** Closing-date badge copy and urgency colour for a tender. */
function deadlineBadge(iso: string): { text: string; className: string } {
  const days = daysUntil(iso);
  if (days < 0) {
    return { text: 'Closed', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' };
  }
  if (days === 0) {
    return { text: 'Closes today', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' };
  }
  const text = days === 1 ? 'Closes tomorrow' : `Closes in ${days} days`;
  return {
    text,
    className:
      days <= 7
        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
        : 'bg-secondary/50 text-muted-foreground border-border/60',
  };
}

function budgetText(o: Opportunity): string {
  if (o.budget_raw) return o.budget_raw;
  if (o.budget_min != null && o.budget_max != null) return `$${o.budget_min} - $${o.budget_max}`;
  if (o.budget_min != null) return `$${o.budget_min}`;
  return 'TBD';
}

function proposalsText(o: Opportunity): string {
  if (o.proposals_raw) return o.proposals_raw;
  if (o.proposals_min != null && o.proposals_max != null) return `${o.proposals_min}-${o.proposals_max}`;
  if (o.proposals_min != null) return `${o.proposals_min}+`;
  return '-';
}

// Resolve the real platform posting time from posted_raw, falling back to the
// backend ingestion time (created_at) when the source has no post time.
function resolvePosted(o: Opportunity): { date: Date | null; raw?: string } {
  const raw = o.posted_raw?.trim();
  if (raw) {
    // Pure epoch seconds (Freelancer time_submitted).
    if (/^\d{9,13}$/.test(raw)) {
      const ms = raw.length > 10 ? Number(raw) : Number(raw) * 1000;
      return { date: new Date(ms) };
    }
    // ISO / parseable date string (Upwork publishedOn).
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) return { date: new Date(parsed) };
    // Human string like "2 hours ago" — show as-is.
    return { date: null, raw };
  }
  return { date: new Date(o.created_at) };
}

function relative(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function postedText(o: Opportunity): string {
  const { date, raw } = resolvePosted(o);
  if (raw) return raw;
  return date ? relative(date) : 'unknown';
}

export function OpportunityCard({ opportunity: o }: { opportunity: Opportunity }) {
  const postedDate = resolvePosted(o).date;
  const isNew = postedDate != null && Date.now() - postedDate.getTime() < 3600_000;

  return (
    <div className="group relative overflow-hidden border border-border/50 rounded-xl p-5 sm:p-6 bg-card hover:shadow-xl hover:-translate-y-0.5 hover:border-primary/50 transition-all duration-300">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: main info */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <Badge
              variant="outline"
              className={`text-xs rounded-full capitalize ${PLATFORM_STYLES[o.platform] || ''}`}
            >
              {o.platform}
            </Badge>
            {o.job_type && (
              <Badge variant="secondary" className="text-xs rounded-full capitalize">
                {o.job_type === 'hourly' ? 'Hourly' : 'Fixed-price'}
              </Badge>
            )}
            {o.source_strategy && (
              <Badge
                variant="outline"
                className="text-xs rounded-full capitalize text-muted-foreground"
                title="Ingestion source"
              >
                {o.source_strategy}
              </Badge>
            )}
            {o.is_payment_verified && (
              <Badge className="text-xs rounded-full bg-emerald-500 hover:bg-emerald-600 text-white">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            {isNew && (
              <Badge className="text-xs rounded-full bg-amber-500 hover:bg-amber-600 text-white animate-pulse">
                New
              </Badge>
            )}
            {o.deadline && (
              <Badge
                variant="outline"
                className={`text-xs rounded-full ${deadlineBadge(o.deadline).className}`}
                title={`Submission deadline: ${new Date(o.deadline).toLocaleString()}`}
              >
                <CalendarClock className="w-3 h-3 mr-1" />
                {deadlineBadge(o.deadline).text}
              </Badge>
            )}
          </div>

          <div className="text-xs text-muted-foreground mb-2 flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">Posted {postedText(o)}</span>
            <span className="text-border">•</span>
            <span>Proposals: {proposalsText(o)}</span>
            {o.difficulty && (
              <>
                <span className="text-border">•</span>
                <span>{o.difficulty}</span>
              </>
            )}
          </div>

          <h3 className="font-semibold text-lg sm:text-xl text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            <a href={o.url || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {o.title}
            </a>
          </h3>

          {o.description && (
            <p className="text-sm text-muted-foreground line-clamp-3 my-3 leading-relaxed">
              {o.description}
            </p>
          )}


          {(() => {
            const techStack: string[] = Array.isArray(o.tech_stack)
              ? o.tech_stack.filter(
                  (skill): skill is string => typeof skill === 'string'
                )
              : typeof o.tech_stack === 'string'
                ? o.tech_stack.split(',').map((skill) => skill.trim()).filter(Boolean)
                : [];

            return techStack.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-auto pt-2">
                {techStack.slice(0, 8).map((skill, index) => (
                  <Badge
                    key={`${skill}-${index}`}
                    variant="outline"
                    className="text-xs bg-secondary/50 border-0 rounded-full"
                  >
                    {skill}
                  </Badge>
                ))}

                {techStack.length > 8 && (
                  <Badge variant="outline" className="text-xs rounded-full">
                    +{techStack.length - 8}
                  </Badge>
                )}
              </div>
            ) : null;
          })()}


          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/40">
            {o.client_country && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{o.client_country}</span>
              </div>
            )}
            {o.rating != null && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span>{o.rating.toFixed(1)}</span>
              </div>
            )}
            {o.client_spent_numeric != null && o.client_spent_numeric > 0 && (
              <span>Spent ${Math.round(o.client_spent_numeric).toLocaleString()}</span>
            )}
          </div>
        </div>

        {/* Right: stats */}
        <div className="lg:w-[220px] flex-shrink-0 flex flex-col gap-4 lg:border-l lg:border-border/50 lg:pl-6 pt-4 lg:pt-0 border-t border-border/50 lg:border-t-0">
          <div className="flex items-end justify-between lg:flex-col lg:items-start gap-1">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Budget</span>
            <span className="text-lg font-bold text-foreground">{budgetText(o)}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Proposals</span>
              <span className="text-sm font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                {proposalsText(o)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Posted</span>
              <span className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {postedText(o)}
              </span>
            </div>
          </div>
          <a
            href={o.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 shadow-sm transition-colors"
          >
            View Details
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
