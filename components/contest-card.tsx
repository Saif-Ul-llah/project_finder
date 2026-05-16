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
    <div className="group border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg hover:border-primary transition-all duration-200 bg-card">
      {/* Title and Badges Row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-base sm:text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {contest.project_name}
          </h3>
          <a 
            href={`https://freelancer.com${contest.seo_url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            View on Freelancer →
          </a>
        </div>
        
        {/* Status Badges */}
        <div className="flex flex-wrap gap-1.5">
          {contest.featured && (
            <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
              Featured
            </Badge>
          )}
          {contest.urgent && (
            <Badge variant="destructive" className="text-xs">
              Urgent
            </Badge>
          )}
          {contest.guaranteed && (
            <Badge variant="secondary" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Guaranteed
            </Badge>
          )}
          {contest.sealed && (
            <Badge variant="outline" className="text-xs">
              Sealed
            </Badge>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {contest.project_desc}
      </p>

      {/* Budget and Bids Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 pb-4 border-b border-border">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">Budget</span>
          <span className="text-sm sm:text-base font-semibold text-foreground">
            {contest.budget_range}
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">Bids</span>
          <span className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {contest.bid_count}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">Avg Bid</span>
          <span className="text-sm sm:text-base font-semibold text-foreground">
            {contest.bid_avg}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">Time Left</span>
          <span className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {contest.time_left}
          </span>
        </div>
      </div>

      {/* Skills Tags */}
      <div className="flex flex-wrap gap-2">
        {contest.skills_info.slice(0, 5).map((skill) => (
          <Badge 
            key={skill.id}
            variant="outline"
            className="text-xs bg-secondary text-secondary-foreground border-0 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
          >
            {skill.name}
          </Badge>
        ))}
        {contest.skills_info.length > 5 && (
          <Badge variant="outline" className="text-xs">
            +{contest.skills_info.length - 5} more
          </Badge>
        )}
      </div>

      {/* Footer info */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {contest.is_contest && (
            <span className="inline-flex items-center gap-1">
              <Award className="w-3 h-3" />
              Contest
            </span>
          )}
          {contest.payment_verified && (
            <span className="inline-flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>
        {contest.has_upgrades && (
          <span className="text-primary font-medium">Premium</span>
        )}
      </div>
    </div>
  );
}
