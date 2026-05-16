'use client';

import { Project } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Shield, Award, MapPin, Zap, TrendingUp, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectCardProps {
  project: Project;
}

export function FreelancerProjectCard({ project }: ProjectCardProps) {
  const upgrades = project.upgrade_details;
  const location = project.location_details?.country;
  const owner = project.owner_info;

  // Format budget
  let budgetDisplay = 'TBD';
  if (project.budget) {
    if (project.budget.minimum && project.budget.maximum) {
      budgetDisplay = `${project.currency.sign}${project.budget.minimum} - ${project.currency.sign}${project.budget.maximum}`;
    } else if (project.budget.minimum) {
      budgetDisplay = `${project.currency.sign}${project.budget.minimum}+`;
    }
  }

  // Format date correctly (sec, min, hour, day)
  let timeDisplay = 'Unknown time';
  if (project.time_submitted) {
    const date = new Date(project.time_submitted * 1000);
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSecs < 60) {
      timeDisplay = `${Math.max(1, diffSecs)} seconds ago`;
    } else if (diffSecs < 3600) {
      timeDisplay = `${Math.floor(diffSecs / 60)} minutes ago`;
    } else if (diffSecs < 86400) {
      timeDisplay = `${Math.floor(diffSecs / 3600)} hours ago`;
    } else {
      timeDisplay = `${Math.floor(diffSecs / 86400)} days ago`;
    }
  }

  return (
    <div className="group relative overflow-hidden border border-border/50 rounded-xl p-5 sm:p-6 bg-card hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10 flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Main Info */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.time_submitted && (new Date().getTime() - project.time_submitted * 1000) < 3600000 && (
              <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-full shadow-sm animate-pulse">
                New
              </Badge>
            )}
            {upgrades?.featured && (
              <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white text-xs rounded-full shadow-sm">
                Featured
              </Badge>
            )}
            {upgrades?.urgent && (
              <Badge variant="destructive" className="text-xs rounded-full shadow-sm">
                <Zap className="w-3 h-3 mr-1" />
                Urgent
              </Badge>
            )}
            {upgrades?.guaranteed && (
              <Badge variant="secondary" className="text-xs rounded-full">
                <Shield className="w-3 h-3 mr-1" />
                Guaranteed
              </Badge>
            )}
            {upgrades?.sealed && (
              <Badge variant="outline" className="text-xs rounded-full">
                Sealed
              </Badge>
            )}
          </div>

          {/* Top Meta Data in Left Column */}
          <div className="text-xs text-muted-foreground mb-3 flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">Posted {timeDisplay}</span>
            {project.bid_stats && project.bid_stats.bid_count > 0 && (
              <>
                <span className="text-border">•</span>
                <span>Proposals: {project.bid_stats.bid_count}</span>
              </>
            )}
            <span className="text-border">•</span>
            <span className="font-medium text-foreground capitalize">{project.budget?.project_type || 'Fixed-price'}</span>
          </div>

          <div className="flex justify-between items-start gap-4">
            <h3 className="font-semibold text-lg sm:text-xl text-foreground line-clamp-2 group-hover:text-primary transition-colors pr-4 flex-1">
              <a 
                href={`https://www.freelancer.com/${project.seo_url.startsWith('/') ? project.seo_url.substring(1) : project.seo_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {project.title}
              </a>
            </h3>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-50 hover:text-red-500 transition-colors -mt-1 flex-shrink-0">
              <Heart className="w-5 h-5" />
            </Button>
          </div>

          <div 
            className="text-sm text-muted-foreground line-clamp-3 my-3 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: project.description }}
          />

          {/* Skills Tags */}
          <div className="flex flex-wrap gap-2 mt-auto">
            {project.jobs.slice(0, 8).map((job) => (
              <Badge 
                key={job.id}
                variant="outline"
                className="text-xs bg-secondary/50 text-secondary-foreground border-0 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer rounded-full"
              >
                {job.name}
              </Badge>
            ))}
            {project.jobs.length > 8 && (
              <Badge variant="outline" className="text-xs rounded-full">
                +{project.jobs.length - 8} more
              </Badge>
            )}
          </div>

          {/* Footer info */}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/40">
            {owner && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{owner.display_name || owner.username}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{location.name}</span>
              </div>
            )}
            <span className="text-primary font-medium capitalize">{project.status}</span>
          </div>
        </div>

        {/* Right Side: Stats Panel */}
        <div className="lg:w-[260px] flex-shrink-0 flex flex-col gap-5 lg:border-l lg:border-border/50 lg:pl-6 pt-5 lg:pt-0 border-t border-border/50 lg:border-t-0">
          <div className="flex items-end justify-between lg:flex-col lg:items-start lg:justify-start gap-1">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Budget</span>
            <span className="text-xl font-bold text-foreground">{budgetDisplay}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bids</span>
              <span className="text-sm font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                {project.bid_stats?.bid_count || 0}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Avg Bid</span>
              <span className="text-sm font-semibold">
                {project.bid_stats?.bid_avg ? `${project.currency.sign}${project.bid_stats.bid_avg}` : '-'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Posted</span>
            <span className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {timeDisplay}
            </span>
          </div>

          <a 
            href={`https://www.freelancer.com/${project.seo_url.startsWith('/') ? project.seo_url.substring(1) : project.seo_url}`}
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
