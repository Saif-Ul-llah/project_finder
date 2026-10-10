'use client';

// The filter controls, moved off the page into a slide-over.
//
// Thirteen controls in one wrapping row left no room for labels or grouping
// and wrapped into ragged rows at common widths. In a drawer they get labels,
// grouping and vertical space, and the page keeps only search, sort and a
// badged trigger.
//
// Changes apply immediately rather than on a submit: every control on the
// listing already refetched on change, the result cache makes it near-free,
// and it means the count on the footer button is live as you tick.

import { SlidersHorizontal } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { FilterFieldControl } from '@/components/filters/filter-field';
import { cn } from '@/lib/utils';
import {
  activeFieldCount,
  FILTER_GROUPS,
  GROUP_LABELS,
  isFieldActive,
  OPPORTUNITY_FILTERS,
  type FilterField,
  type FilterFieldId,
  type FilterGroup,
  type FilterValues,
  type Option,
} from '@/lib/filter-schema';

interface Props {
  values: FilterValues;
  onChange: (patch: Partial<FilterValues>) => void;
  onReset: () => void;
  resultCount: number;
  fields?: FilterField[];
  hiddenFields?: FilterFieldId[];
  dynamicOptions?: Partial<Record<FilterFieldId, Option[]>>;
}

export function FilterDrawer({
  values,
  onChange,
  onReset,
  resultCount,
  fields = OPPORTUNITY_FILTERS,
  hiddenFields = [],
  dynamicOptions,
}: Props) {
  const hidden = new Set(hiddenFields);
  const visible = fields.filter((f) => !hidden.has(f.id));
  const activeCount = activeFieldCount(values, fields, hiddenFields);

  const groupsWithFields = FILTER_GROUPS.filter((group) =>
    visible.some((f) => f.group === group),
  );
  // Open the groups that already hold a value, so an active filter is never
  // hidden behind a collapsed section.
  const defaultOpen = groupsWithFields.filter((group) =>
    visible.some((f) => f.group === group && isFieldActive(f, values)),
  );

  const groupActiveCount = (group: FilterGroup) =>
    visible.filter((f) => f.group === group && isFieldActive(f, values)).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className={cn('h-10 gap-2', activeCount > 0 && 'border-primary text-primary')}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col gap-0">
        <SheetHeader className="px-6 py-4 border-b border-border/60">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle>Filters</SheetTitle>
            <Button
              variant="link"
              size="sm"
              onClick={onReset}
              disabled={activeCount === 0}
              className="h-auto p-0 text-xs"
            >
              Clear all
            </Button>
          </div>
          <SheetDescription className="text-left">
            Changes apply as you make them.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <Accordion
            type="multiple"
            defaultValue={defaultOpen.length > 0 ? defaultOpen : [groupsWithFields[0]]}
            className="px-6"
          >
            {groupsWithFields.map((group) => {
              const count = groupActiveCount(group);
              return (
                <AccordionItem key={group} value={group}>
                  <AccordionTrigger className="text-sm">
                    <span className="flex items-center gap-2">
                      {GROUP_LABELS[group]}
                      {count > 0 && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                          {count}
                        </Badge>
                      )}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    {visible
                      .filter((f) => f.group === group)
                      .map((field) => (
                        <FilterFieldControl
                          key={String(field.id)}
                          field={field}
                          values={values}
                          onChange={onChange}
                          dynamicOptions={dynamicOptions}
                        />
                      ))}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>

        <SheetFooter className="flex-row gap-2 border-t border-border/60 bg-background px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            variant="outline"
            onClick={onReset}
            disabled={activeCount === 0}
            className="flex-1"
          >
            Reset
          </Button>
          <SheetClose asChild>
            <Button className="flex-1">
              Show {resultCount.toLocaleString()} result{resultCount === 1 ? '' : 's'}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
