'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SortingSelectProps {
  onSortChange: (value: string) => void;
  value?: string;
}

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Most Bids', value: 'bids' },
  { label: 'Highest Budget', value: 'budget' },
  { label: 'Featured', value: 'featured' },
  { label: 'Guaranteed', value: 'guaranteed' },
  { label: 'Urgent', value: 'urgent' },
];

export function SortingSelect({
  onSortChange,
  value = 'newest',
}: SortingSelectProps) {
  return (
    <Select value={value} onValueChange={onSortChange}>
      <SelectTrigger className="w-full sm:w-56">
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
