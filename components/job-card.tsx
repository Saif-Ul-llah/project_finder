'use client';

import { Job } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Zap, Users, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const postedDate = job.submitDate ? new Date(job.submitDate) : new Date();

  return (
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base line-clamp-2 text-card-foreground">
                {job.title}
              </h3>
              {job.featured && (
                <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(postedDate, { addSuffix: true })}
            </p>
          </div>
          {job.status && (
            <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
              {job.status}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2">
          {job.description}
        </p>

        {/* Budget */}
        {job.budget && (
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <DollarSign className="h-4 w-4" />
            <span>${job.budget?.toLocaleString()}</span>
          </div>
        )}

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{job.skills.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{job.entries || 0} entries</span>
          </div>
          {job.owner && (
            <div className="flex items-center gap-1">
              {job.owner.rating && (
                <>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{job.owner.rating.toFixed(1)}</span>
                </>
              )}
            </div>
          )}
          {job.rating && (
            <div className="text-right">
              <span className="text-xs font-medium">Rating: {job.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
