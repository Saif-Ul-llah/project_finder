'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Server, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/auth-client';
import {
  BACKEND_PRESETS,
  getBackendUrl,
  normalizeBackendUrl,
  setBackendUrl,
  testBackend,
  type ConnectionResult,
} from '@/lib/backend';

// '' = default proxy, a preset URL, or CUSTOM for the text input.
const CUSTOM = 'custom';

export function BackendSwitcher() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const [choice, setChoice] = useState('');
  const [custom, setCustom] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<ConnectionResult | null>(null);
  const [mounted, setMounted] = useState(false);

  // localStorage is only readable after mount.
  useEffect(() => {
    setMounted(true);
    setActive(getBackendUrl());
  }, []);

  // Each time the panel opens, start from what is actually in use.
  const onOpenChange = (next: boolean) => {
    if (next) {
      const current = getBackendUrl();
      const isPreset = !current || BACKEND_PRESETS.some((p) => p.url === current);
      setChoice(isPreset ? current : CUSTOM);
      setCustom(isPreset ? '' : current);
      setResult(null);
    }
    setOpen(next);
  };

  const resolved = choice === CUSTOM ? normalizeBackendUrl(custom) : { url: choice };
  const target = 'url' in resolved ? resolved.url : null;
  const inputError = choice === CUSTOM && custom.trim() && 'error' in resolved ? resolved.error : null;

  const pick = (value: string) => {
    setChoice(value);
    setResult(null);
  };

  const runTest = async () => {
    if (target === null) return;
    setTesting(true);
    setResult(null);
    setResult(await testBackend(target));
    setTesting(false);
  };

  const apply = () => {
    if (target === null) return;
    if (target === active) {
      setOpen(false);
      return;
    }
    setBackendUrl(target);
    // Sessions don't carry over: each backend has its own users and signing key.
    // A full-page load rather than a router push, so the edge proxy sees the
    // cleared cookies and no page keeps data from the old backend.
    logout();
    window.location.replace('/login');
  };

  const activeLabel = !active
    ? 'Default'
    : BACKEND_PRESETS.find((p) => p.url === active)?.label ?? active;

  const options = [
    { value: '', label: 'Default', hint: 'Server-configured BACKEND_API_URL' },
    ...BACKEND_PRESETS.map((p) => ({ value: p.url, label: p.label, hint: p.url })),
    { value: CUSTOM, label: 'Custom URL', hint: 'ngrok, VS Code port forward, …' },
  ];

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Choose backend"
          title={mounted ? `Backend: ${activeLabel}` : 'Backend'}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Server className="h-4 w-4" />
          {mounted && active ? (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
          ) : null}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold">Backend</p>
            <p className="text-xs text-muted-foreground break-all">In use: {mounted ? activeLabel : '…'}</p>
          </div>

          <div role="radiogroup" className="space-y-1.5">
            {options.map((o) => (
              <button
                key={o.value || 'default'}
                type="button"
                role="radio"
                aria-checked={choice === o.value}
                onClick={() => pick(o.value)}
                className={cn(
                  'w-full rounded-md border px-3 py-2 text-left transition-colors',
                  choice === o.value ? 'border-primary bg-primary/5' : 'border-border/60 hover:bg-accent',
                )}
              >
                <span className="block text-sm font-medium">{o.label}</span>
                <span className="block text-xs text-muted-foreground break-all">{o.hint}</span>
              </button>
            ))}
          </div>

          {choice === CUSTOM ? (
            <div className="space-y-1">
              <Input
                autoFocus
                value={custom}
                placeholder="https://xxxx.ngrok-free.dev"
                onChange={(e) => {
                  setCustom(e.target.value);
                  setResult(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runTest();
                }}
              />
              {inputError ? <p className="text-xs text-destructive">{inputError}</p> : null}
              <p className="text-xs text-muted-foreground">
                VS Code: set the forwarded port&apos;s visibility to Public.
              </p>
            </div>
          ) : null}

          {result ? (
            <p
              className={cn(
                'flex items-start gap-1.5 text-xs',
                result.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive',
              )}
            >
              {result.ok ? (
                <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0" />
              ) : (
                <XCircle className="mt-px h-3.5 w-3.5 shrink-0" />
              )}
              {result.message}
            </p>
          ) : null}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={target === null || testing}
              onClick={runTest}
            >
              {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Test connection
            </Button>
            <Button type="button" size="sm" className="flex-1" disabled={target === null} onClick={apply}>
              Use this backend
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Switching signs you out: each backend has its own accounts.</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
