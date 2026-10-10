'use client';

// Removable chips for whatever is currently filtering the list.
//
// The old bar gave no indication of what was applied — you had to scan 13
// controls to find out. Chips make the applied set readable at a glance and
// individually removable, which is what lets the controls themselves move
// into a drawer.

import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  activeFields,
  chipLabel,
  clearPatch,
  OPPORTUNITY_FILTERS,
  type FilterField,
  type FilterFieldId,
  type FilterValues,
  type Option,
} from '@/lib/filter-schema';

interface Props {
  values: FilterValues;
  onChange: (patch: Partial<FilterValues>) => void;
  onReset: () => void;
  fields?: FilterField[];
  hiddenFields?: FilterFieldId[];
  dynamicOptions?: Partial<Record<FilterFieldId, Option[]>>;
}

export function ActiveFilterChips({
  values,
  onChange,
  onReset,
  fields = OPPORTUNITY_FILTERS,
  hiddenFields = [],
  dynamicOptions,
}: Props) {
  const active = activeFields(values, fields, hiddenFields);
  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {active.map((field) => {
        const label = chipLabel(field, values, dynamicOptions);
        return (
          <Badge
            key={String(field.id)}
            variant="secondary"
            className="gap-1 pl-2.5 pr-1 py-1 font-normal"
          >
            {label}
            <button
              type="button"
              aria-label={`Remove ${label} filter`}
              onClick={() => onChange(clearPatch(field))}
              className="rounded-full p-0.5 hover:bg-background/80 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}

      {active.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
