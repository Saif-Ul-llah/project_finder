'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SortOption {
  label: string;
  value: string;
}

interface SortingSelectProps {
  onSortChange: (value: string) => void;
  value?: string;
  /** Override the option list. A page whose rows carry deadlines passes
   *  DEADLINE_SORT_OPTIONS; offering those everywhere would list sorts that
   *  do nothing on a feed where every deadline is null. */
  options?: SortOption[];
}

export const SORT_OPTIONS: SortOption[] = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Budget: High to Low', value: 'budget_high' },
  { label: 'Budget: Low to High', value: 'budget_low' },
  { label: 'Most Proposals', value: 'proposals' },
  { label: 'Highest Rating', value: 'rating' },
];

/** Sorts for listings whose rows have a submission deadline. */
export const DEADLINE_SORT_OPTIONS: SortOption[] = [
  { label: 'Closing Soonest', value: 'deadline_soon' },
  { label: 'Closing Latest', value: 'deadline_late' },
  ...SORT_OPTIONS,
];

export function SortingSelect({
  onSortChange,
  value = 'newest',
  options = SORT_OPTIONS,
}: SortingSelectProps) {
  return (
    <Select value={value} onValueChange={onSortChange}>
      <SelectTrigger className="w-full sm:w-56">
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
