'use client';

import { Project } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Shield, Award, MapPin, Zap } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export function FreelancerProjectCard({ project }: ProjectCardProps) {
  const upgrades = project.upgrade_details;
  const location = project.location_details?.country;
  const owner = project.owner_info;

  return (
    <div className="group border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg hover:border-primary transition-all duration-200 bg-card">
      {/* Title and Badges Row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-base sm:text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <a 
            href={`https://freelancer.com/${project.seo_url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            View on Freelancer →
          </a>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-1.5">
          {upgrades?.featured && (
            <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
              Featured
            </Badge>
          )}
          {upgrades?.urgent && (
            <Badge variant="destructive" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Urgent
            </Badge>
          )}
          {upgrades?.guaranteed && (
            <Badge variant="secondary" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Guaranteed
            </Badge>
          )}
          {upgrades?.sealed && (
            <Badge variant="outline" className="text-xs">
              Sealed
            </Badge>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {project.description}
      </p>

      {/* Meta Info Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 pb-4 border-b border-border">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">Status</span>
          <span className="text-sm sm:text-base font-semibold text-foreground capitalize">
            {project.status}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">Currency</span>
          <span className="text-sm sm:text-base font-semibold text-foreground">
            {project.currency.sign}
          </span>
        </div>

        {location && (
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium">Location</span>
            <span className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {location.name}
            </span>
          </div>
        )}
      </div>

      {/* Skills/Categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        {project.jobs.slice(0, 5).map((job) => (
          <Badge 
            key={job.id}
            variant="outline"
            className="text-xs bg-secondary text-secondary-foreground border-0 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
          >
            {job.name}
          </Badge>
        ))}
        {project.jobs.length > 5 && (
          <Badge variant="outline" className="text-xs">
            +{project.jobs.length - 5} more
          </Badge>
        )}
      </div>

      {/* Owner Info */}
      {owner && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="font-medium">{owner.display_name || owner.username}</span>
            {owner.location?.country && (
              <span className="text-muted-foreground">
                {owner.location.country.name}
              </span>
            )}
          </div>
          <span className="text-primary font-medium">{project.status}</span>
        </div>
      )}
    </div>
  );
}
