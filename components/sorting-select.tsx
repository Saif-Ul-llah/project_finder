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
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Budget: High to Low', value: 'budget_high' },
  { label: 'Budget: Low to High', value: 'budget_low' },
  { label: 'Most Proposals', value: 'proposals' },
  { label: 'Highest Rating', value: 'rating' },
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
