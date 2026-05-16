'use client';

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  budgetMin?: number;
  budgetMax?: number;
  skills?: string[];
  status?: string;
  bidCountMin?: number;
  bidCountMax?: number;
  dateRange?: string;
  rating?: number;
}

const SKILL_OPTIONS = [
  'PHP',
  'MySQL',
  'HTML',
  'Software Development',
  'Laravel',
  'Web Development',
  'Backend Development',
  'Database Management',
  'API Development',
  'Logo Design',
  'Graphic Design',
  'UI Design',
  'UX Design',
  'Figma',
  'Branding',
  'WordPress',
  'JavaScript',
  'React',
  'Node.js',
  'Python',
  'TypeScript',
];

const STATUS_OPTIONS = ['all', 'open', 'active', 'featured', 'urgent', 'sealed', 'guaranteed'];

const DATE_RANGE_OPTIONS = [
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Any time', value: 'all' },
];

export function AdvancedFilters({
  onFiltersChange,
  initialFilters = {},
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    initialFilters.skills || []
  );

  const handleBudgetMinChange = (value: string) => {
    const newFilters = { ...filters, budgetMin: value ? parseInt(value) : undefined };
    setFilters(newFilters);
  };

  const handleBudgetMaxChange = (value: string) => {
    const newFilters = { ...filters, budgetMax: value ? parseInt(value) : undefined };
    setFilters(newFilters);
  };

  const handleStatusChange = (value: string) => {
    const newFilters = { ...filters, status: value };
    setFilters(newFilters);
  };

  const handleDateRangeChange = (value: string) => {
    const newFilters = { ...filters, dateRange: value };
    setFilters(newFilters);
  };

  const handleBidCountMinChange = (value: string) => {
    const newFilters = { ...filters, bidCountMin: value ? parseInt(value) : undefined };
    setFilters(newFilters);
  };

  const handleBidCountMaxChange = (value: string) => {
    const newFilters = { ...filters, bidCountMax: value ? parseInt(value) : undefined };
    setFilters(newFilters);
  };

  const handleRatingChange = (value: string) => {
    const newFilters = { ...filters, rating: value ? parseFloat(value) : undefined };
    setFilters(newFilters);
  };

  const toggleSkill = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(newSkills);
    const newFilters = { ...filters, skills: newSkills };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(filters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSelectedSkills([]);
    onFiltersChange({});
  };

  const activeFilterCount = Object.values(filters).filter(
    v => v !== undefined && v !== null
  ).length;

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <ChevronDown className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-2 inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 w-80 rounded-lg border border-border bg-card p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Advanced Filters</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Budget Range */}
            <div>
              <Label className="text-sm font-medium">Budget Range</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.budgetMin || ''}
                  onChange={(e) => handleBudgetMinChange(e.target.value)}
                  className="w-full"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.budgetMax || ''}
                  onChange={(e) => handleBudgetMaxChange(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Select value={filters.status || ''} onValueChange={handleStatusChange}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <Label className="text-sm font-medium">Posted</Label>
              <Select value={filters.dateRange || 'all'} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bid Count Range */}
            <div>
              <Label className="text-sm font-medium">Bid Count</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.bidCountMin || ''}
                  onChange={(e) => handleBidCountMinChange(e.target.value)}
                  className="w-full"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.bidCountMax || ''}
                  onChange={(e) => handleBidCountMaxChange(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <Label className="text-sm font-medium">Min Rating</Label>
              <Input
                type="number"
                placeholder="e.g., 4.5"
                min="0"
                max="5"
                step="0.1"
                value={filters.rating || ''}
                onChange={(e) => handleRatingChange(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Skills */}
            <div>
              <Label className="text-sm font-medium">Skills</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {SKILL_OPTIONS.map((skill) => (
                  <label key={skill} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedSkills.includes(skill)}
                      onCheckedChange={() => toggleSkill(skill)}
                    />
                    <span className="text-xs">{skill}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4 border-t border-border pt-4">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex-1"
            >
              Clear
            </Button>
            <Button onClick={handleApplyFilters} className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
