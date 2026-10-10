// One declarative description of the opportunity filters.
//
// Each filter used to be expressed in four disconnected places: a useState, a
// control in the bar, a label, and nowhere at all for an "active filter"
// indicator. That is how the bar drifted into 13 unlabelled controls with no
// way to see what was applied.
//
// Declaring them once means the drawer controls, the chip labels and the
// active count all derive from the same source, so a chip can never disagree
// with the control that set it, and adding a filter is one entry.

import {
  CURRENCIES,
  EXPERIENCE_LEVELS,
  PLATFORMS,
  PROJECT_LENGTHS,
  PROJECT_TYPES,
  TECH_STACKS,
} from '@/lib/filter-options';
import type { OpportunityFilters } from '@/lib/types';

export interface Option {
  label: string;
  value: string;
}

/** The filter fields, i.e. everything except search, sort and paging. */
export type FilterValues = Omit<
  OpportunityFilters,
  'search' | 'sort' | 'page' | 'page_size'
>;

export type FilterFieldId = keyof FilterValues;

export const FILTER_GROUPS = ['basics', 'scope', 'budget', 'client', 'source'] as const;
export type FilterGroup = (typeof FILTER_GROUPS)[number];

export const GROUP_LABELS: Record<FilterGroup, string> = {
  basics: 'Basics',
  scope: 'Skills & scope',
  budget: 'Budget',
  client: 'Client',
  source: 'Ingestion',
};

interface BaseField {
  id: FilterFieldId;
  label: string;
  group: FilterGroup;
  // Prefix the field label on the chip, for values that read ambiguously on
  // their own. "Upwork" is clear; "scraper" is not.
  prefixChip?: boolean;
}

export type FilterField =
  | (BaseField & { control: 'select' | 'combobox'; options: Option[]; dynamic?: never })
  // Options come from live data (stats) rather than a fixed list.
  | (BaseField & { control: 'select'; dynamic: 'source' | 'region'; options?: never })
  | (BaseField & { control: 'toggle'; options: Option[]; dynamic?: never })
  | (BaseField & { control: 'switch'; options?: never; dynamic?: never })
  | (BaseField & {
      control: 'range';
      maxId: FilterFieldId;
      prefix: string;
      options?: never;
      dynamic?: never;
    });

export const JOB_TYPES: Option[] = [
  { label: 'All Types', value: '' },
  { label: 'Hourly', value: 'hourly' },
  { label: 'Fixed', value: 'fixed' },
];

export const OPPORTUNITY_FILTERS: FilterField[] = [
  { id: 'platform', label: 'Platform', group: 'basics', control: 'select', options: PLATFORMS, prefixChip: true },
  { id: 'job_type', label: 'Job type', group: 'basics', control: 'toggle', options: JOB_TYPES },
  { id: 'project_type', label: 'Project type', group: 'basics', control: 'select', options: PROJECT_TYPES },

  { id: 'tech_stack', label: 'Tech stack', group: 'scope', control: 'combobox', options: TECH_STACKS },
  { id: 'duration', label: 'Duration', group: 'scope', control: 'select', options: PROJECT_LENGTHS },
  { id: 'experience', label: 'Experience', group: 'scope', control: 'select', options: EXPERIENCE_LEVELS },

  { id: 'min_budget', maxId: 'max_budget', label: 'Budget', group: 'budget', control: 'range', prefix: '$' },
  { id: 'currency', label: 'Currency', group: 'budget', control: 'combobox', options: CURRENCIES },

  { id: 'region', label: 'Region', group: 'client', control: 'select', dynamic: 'region' },
  { id: 'verified', label: 'Payment verified', group: 'client', control: 'switch' },

  { id: 'source', label: 'Source', group: 'source', control: 'select', dynamic: 'source', prefixChip: true },
];

/** True when this field currently constrains the query. */
export function isFieldActive(field: FilterField, values: FilterValues): boolean {
  if (field.control === 'range') {
    return Boolean(values[field.id]) || Boolean(values[field.maxId]);
  }
  const value = values[field.id];
  return value !== undefined && value !== null && value !== '' && value !== false;
}

export function activeFields(
  values: FilterValues,
  fields: FilterField[] = OPPORTUNITY_FILTERS,
  hidden: FilterFieldId[] = [],
): FilterField[] {
  const skip = new Set(hidden);
  return fields.filter((f) => !skip.has(f.id) && isFieldActive(f, values));
}

export function activeFieldCount(
  values: FilterValues,
  fields: FilterField[] = OPPORTUNITY_FILTERS,
  hidden: FilterFieldId[] = [],
): number {
  return activeFields(values, fields, hidden).length;
}

/** The patch that clears a field. A range clears both of its bounds. */
export function clearPatch(field: FilterField): Partial<FilterValues> {
  if (field.control === 'range') {
    return { [field.id]: undefined, [field.maxId]: undefined } as Partial<FilterValues>;
  }
  if (field.control === 'switch') {
    return { [field.id]: false } as Partial<FilterValues>;
  }
  return { [field.id]: undefined } as Partial<FilterValues>;
}

/**
 * The chip text for an active field.
 *
 * Values are resolved back through the field's own option list, so a chip
 * reads "USD ($)" rather than "$" and "AI / ML" rather than "machine
 * learning" — the raw query value is rarely what a person recognises.
 */
export function chipLabel(
  field: FilterField,
  values: FilterValues,
  dynamicOptions?: Partial<Record<FilterFieldId, Option[]>>,
): string {
  if (field.control === 'switch') return field.label;

  if (field.control === 'range') {
    const min = values[field.id];
    const max = values[field.maxId];
    const fmt = (n: unknown) => field.prefix + Number(n).toLocaleString();
    if (min && max) return `${field.label}: ${fmt(min)} – ${fmt(max)}`;
    if (min) return `${field.label}: from ${fmt(min)}`;
    return `${field.label}: up to ${fmt(max)}`;
  }

  const raw = String(values[field.id] ?? '');
  const options = field.options ?? dynamicOptions?.[field.id] ?? [];
  const match = options.find((o) => o.value === raw);
  const text = match?.label ?? raw;
  return field.prefixChip ? `${field.label}: ${text}` : text;
}
