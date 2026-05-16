'use client';

import { ContestProject } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, Award, Shield, TrendingUp } from 'lucide-react';

interface ContestCardProps {
  contest: ContestProject;
}

export function ContestCard({ contest }: ContestCardProps) {
  const budgetMin = parseFloat(contest.minbudget?.replace(/[^0-9.]/g, '') || '0');
  
  return (
    <div className="group relative overflow-hidden border border-border/50 rounded-xl p-5 sm:p-6 bg-card hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10 flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Main Info */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {contest.featured && (
              <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white text-xs rounded-full shadow-sm">
                Featured
              </Badge>
            )}
            {contest.urgent && (
              <Badge variant="destructive" className="text-xs rounded-full shadow-sm">
                Urgent
              </Badge>
            )}
            {contest.guaranteed && (
              <Badge variant="secondary" className="text-xs rounded-full">
                <Shield className="w-3 h-3 mr-1" />
                Guaranteed
              </Badge>
            )}
            {contest.sealed && (
              <Badge variant="outline" className="text-xs rounded-full">
                Sealed
              </Badge>
            )}
            {contest.NDA && (
              <Badge variant="outline" className="text-xs rounded-full bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                NDA
              </Badge>
            )}
            {contest.fulltime && (
              <Badge variant="outline" className="text-xs rounded-full bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">
                Full Time
              </Badge>
            )}
            {contest.local && (
              <Badge variant="outline" className="text-xs rounded-full bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                Local
              </Badge>
            )}
            {contest.top && (
              <Badge variant="outline" className="text-xs rounded-full bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800">
                Top Project
              </Badge>
            )}
            {contest.highlight && (
              <Badge variant="outline" className="text-xs rounded-full bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
                Highlighted
              </Badge>
            )}
          </div>

          <h3 
            className="font-semibold text-lg sm:text-xl text-foreground line-clamp-2 group-hover:text-primary transition-colors pr-4"
            dangerouslySetInnerHTML={{ __html: contest.project_name }}
          />

          <div 
            className="text-sm text-muted-foreground line-clamp-3 my-3 [&>b]:font-semibold [&>br]:hidden leading-relaxed"
            dangerouslySetInnerHTML={{ __html: contest.project_desc }}
          />

          {/* Skills Tags */}
          <div className="flex flex-wrap gap-2 mt-auto">
            {contest.skills_info.slice(0, 8).map((skill) => (
              <Badge 
                key={skill.id}
                variant="outline"
                className="text-xs bg-secondary/50 text-secondary-foreground border-0 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer rounded-full"
              >
                {skill.name}
              </Badge>
            ))}
            {contest.skills_info.length > 8 && (
              <Badge variant="outline" className="text-xs rounded-full">
                +{contest.skills_info.length - 8} more
              </Badge>
            )}
          </div>

          {/* Footer info */}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {contest.is_contest && (
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <Award className="w-4 h-4 text-primary" />
                Contest
              </span>
            )}
            {(contest.payment_verified === true || contest.payment_verified === "1") && (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <Shield className="w-4 h-4" />
                Payment Verified
              </span>
            )}
            {contest.has_upgrades && (
              <span className="text-primary font-medium">Premium</span>
            )}
          </div>
        </div>

        {/* Right Side: Stats Panel */}
        <div className="lg:w-[260px] flex-shrink-0 flex flex-col gap-5 lg:border-l lg:border-border/50 lg:pl-6 pt-5 lg:pt-0 border-t border-border/50 lg:border-t-0">
          <div className="flex items-end justify-between lg:flex-col lg:items-start lg:justify-start gap-1">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Budget</span>
            <span className="text-xl font-bold text-foreground">{contest.budget_range}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bids</span>
              <span className="text-sm font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                {contest.bid_count}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Avg Bid</span>
              <span className="text-sm font-semibold">{contest.bid_avg}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Time Left</span>
            <span className="text-sm font-medium flex items-center gap-1.5 text-primary">
              <Clock className="w-4 h-4" />
              {contest.time_left}
            </span>
          </div>

          <a 
            href={`https://freelancer.com${contest.seo_url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto w-full inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow-sm"
          >
            View Details
          </a>
        </div>
        
      </div>
    </div>
  );
}
