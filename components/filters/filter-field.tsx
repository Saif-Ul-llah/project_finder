'use client';

// Renders one field from the filter schema. Keeping the control mapping in a
// single component is what lets the drawer stay a layout concern.

import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import type { FilterField, FilterFieldId, FilterValues, Option } from '@/lib/filter-schema';

interface Props {
  field: FilterField;
  values: FilterValues;
  onChange: (patch: Partial<FilterValues>) => void;
  dynamicOptions?: Partial<Record<FilterFieldId, Option[]>>;
}

const SELECT_CLASS =
  'w-full h-10 rounded-lg border border-border/60 bg-background px-3 text-sm text-foreground';

/** A searchable single-select. Scrolling 26 currencies in a plain dropdown is
 *  the specific thing that made the old bar tiring to use. */
function Combobox({
  options,
  value,
  placeholder,
  onSelect,
}: {
  options: Option[];
  value: string;
  placeholder: string;
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value && o.value !== '');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full h-10 justify-between font-normal"
        >
          <span className={cn(!selected && 'text-muted-foreground')}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No match.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value || '__all__'}
                  value={option.label}
                  onSelect={() => {
                    onSelect(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      option.value === value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function FilterFieldControl({ field, values, onChange, dynamicOptions }: Props) {
  // A dynamic field with nothing to offer is hidden rather than shown empty —
  // the same behaviour the old bar had, now declared rather than hand-wired.
  const options: Option[] = field.options ?? dynamicOptions?.[field.id] ?? [];
  if (field.dynamic && options.length === 0) return null;

  const labelId = `filter-${String(field.id)}`;

  if (field.control === 'switch') {
    return (
      <div className="flex items-center justify-between gap-3 py-1">
        <Label htmlFor={labelId} className="text-sm font-medium cursor-pointer">
          {field.label}
        </Label>
        <Switch
          id={labelId}
          checked={Boolean(values[field.id])}
          onCheckedChange={(checked) =>
            onChange({ [field.id]: checked } as Partial<FilterValues>)
          }
        />
      </div>
    );
  }

  if (field.control === 'range') {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {field.label}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder={`${field.prefix} min`}
            value={String(values[field.id] ?? '')}
            onChange={(e) =>
              onChange({
                // '' must clear to undefined: toQuery drops undefined but
                // keeps 0, so an empty box would otherwise filter on zero.
                [field.id]: e.target.value === '' ? undefined : Number(e.target.value),
              } as Partial<FilterValues>)
            }
            className="h-10"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder={`${field.prefix} max`}
            value={String(values[field.maxId] ?? '')}
            onChange={(e) =>
              onChange({
                [field.maxId]: e.target.value === '' ? undefined : Number(e.target.value),
              } as Partial<FilterValues>)
            }
            className="h-10"
          />
        </div>
      </div>
    );
  }

  if (field.control === 'toggle') {
    const current = String(values[field.id] ?? '');
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {field.label}
        </Label>
        <ToggleGroup
          type="single"
          value={current}
          // Radix emits '' when the active item is re-pressed; treat that as
          // "All" rather than letting the group go valueless.
          onValueChange={(next) =>
            onChange({ [field.id]: next || undefined } as Partial<FilterValues>)
          }
          className="w-full justify-start gap-1"
        >
          {field.options.map((option) => (
            <ToggleGroupItem
              key={option.value || '__all__'}
              value={option.value}
              className="flex-1 h-9 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    );
  }

  if (field.control === 'combobox') {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {field.label}
        </Label>
        <Combobox
          options={options}
          value={String(values[field.id] ?? '')}
          placeholder={options[0]?.label ?? field.label}
          onSelect={(value) =>
            onChange({ [field.id]: value || undefined } as Partial<FilterValues>)
          }
        />
      </div>
    );
  }

  // Plain select. Dynamic fields have no "All ..." sentinel in their options,
  // so one is prepended.
  const withSentinel: Option[] = field.dynamic
    ? [{ label: `All ${field.label}s`, value: '' }, ...options]
    : options;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={labelId} className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {field.label}
      </Label>
      <select
        id={labelId}
        value={String(values[field.id] ?? '')}
        onChange={(e) =>
          onChange({ [field.id]: e.target.value || undefined } as Partial<FilterValues>)
        }
        className={cn(SELECT_CLASS, field.dynamic && 'capitalize')}
      >
        {withSentinel.map((option) => (
          <option key={option.value || '__all__'} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
