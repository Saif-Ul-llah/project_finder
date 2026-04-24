'use client';

import { Project } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const postedDate = project.posted_date
    ? new Date(project.posted_date)
    : new Date();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-base line-clamp-2 text-card-foreground">
              {project.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(postedDate, { addSuffix: true })}
            </p>
          </div>
          {project.status && (
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2">
          {project.description}
        </p>

        {/* Budget or Hourly Rate */}
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <DollarSign className="h-4 w-4" />
          {project.type === 'hourly' ? (
            <span>${project.hourly_rate}/hr</span>
          ) : (
            <span>${project.budget?.toLocaleString()}</span>
          )}
        </div>

        {/* Skills */}
        {project.skills && project.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {project.skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{project.skills.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{project.bidCount || 0} bids</span>
          </div>
          {project.avgBid && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>Avg ${project.avgBid}</span>
            </div>
          )}
          {project.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{project.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
