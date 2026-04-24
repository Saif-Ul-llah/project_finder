'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SortingSelectProps {
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  defaultValue?: string;
  options?: SortOption[];
}

export interface SortOption {
  label: string;
  value: string;
  field: string;
  order: 'asc' | 'desc';
}

const DEFAULT_SORT_OPTIONS: SortOption[] = [
  { label: 'Newest First', value: 'newest', field: 'posted_date', order: 'desc' },
  { label: 'Oldest First', value: 'oldest', field: 'posted_date', order: 'asc' },
  { label: 'Budget: High to Low', value: 'budget-high', field: 'budget', order: 'desc' },
  { label: 'Budget: Low to High', value: 'budget-low', field: 'budget', order: 'asc' },
  { label: 'Most Bids', value: 'most-bids', field: 'bidCount', order: 'desc' },
  { label: 'Least Bids', value: 'least-bids', field: 'bidCount', order: 'asc' },
  { label: 'Highest Rating', value: 'rating-high', field: 'rating', order: 'desc' },
  { label: 'Lowest Rating', value: 'rating-low', field: 'rating', order: 'asc' },
];

export function SortingSelect({
  onSortChange,
  defaultValue = 'newest',
  options = DEFAULT_SORT_OPTIONS,
}: SortingSelectProps) {
  const handleSortChange = (value: string) => {
    const selectedOption = options.find(opt => opt.value === value);
    if (selectedOption) {
      onSortChange(selectedOption.field, selectedOption.order);
    }
  };

  return (
    <Select defaultValue={defaultValue} onValueChange={handleSortChange}>
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
