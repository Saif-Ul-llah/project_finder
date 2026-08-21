'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Loader2,
  Play,
  Save,
  RefreshCw,
  Database,
  LogOut,
  Target,
  Users,
  Trash2,
  HardDrive,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  checkHealth,
  fetchStats,
  fetchFilters,
  triggerPull,
  fetchScheduler,
  updatePoller,
  getApiKey,
  setApiKey as persistApiKey,
} from '@/lib/api';
import { Stats, PullResult, FilterCatalog, Poller } from '@/lib/types';
import { logout, getUser } from '@/lib/auth-client';
import { previewOldJobs, deleteOldJobs } from '@/lib/users-api';

export default function AdminPage() {
  const router = useRouter();

  // Config
  const [apiKey, setApiKeyState] = useState('');
  const [savedKey, setSavedKey] = useState(false);

  // Health + stats
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  // Pull form
  const [platform, setPlatform] = useState('freelancer');
  const [limit, setLimit] = useState('20');
  const [query, setQuery] = useState('');
  const [jobType, setJobType] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [pullResult, setPullResult] = useState<PullResult | null>(null);
  const [pullError, setPullError] = useState<string | null>(null);

  // Filter catalog
  const [catalog, setCatalog] = useState<FilterCatalog | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const refreshStats = useCallback(async () => {
    try {
      setStats(await fetchStats());
    } catch {
      setStats(null);
    }
  }, []);

  useEffect(() => {
    setApiKeyState(getApiKey());
    checkHealth().then(setHealthy);
    refreshStats();
  }, [refreshStats]);

  const handleSaveKey = () => {
    persistApiKey(apiKey);
    setSavedKey(true);
    setTimeout(() => setSavedKey(false), 2000);
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
    router.refresh();
  };

  const handlePull = async () => {
    setPulling(true);
    setPullError(null);
    setPullResult(null);
    try {
      const body: Record<string, unknown> = {
        platform,
        limit: Number(limit) || 20,
        query: query || undefined,
      };
      if (platform === 'upwork') {
        body.verified_only = verifiedOnly;
        if (jobType) body.job_type = [jobType];
      }
      const res = await triggerPull(body);
      setPullResult(res);
      refreshStats();
    } catch (err: any) {
      setPullError(err?.message || 'Pull failed');
    } finally {
      setPulling(false);
    }
  };

  const loadCatalog = async (p: string) => {
    setCatalogLoading(true);
    try {
      setCatalog(await fetchFilters(p));
    } catch {
      setCatalog({ error: 'Failed to load filters' });
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog(platform);
  }, [platform]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin &amp; Config</h1>
            <p className="text-muted-foreground mt-1">
              Manage ingestion, credentials, and monitor the backend.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {healthy === null ? (
              <Badge variant="outline" className="gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> checking
              </Badge>
            ) : healthy ? (
              <Badge className="gap-1 bg-emerald-500 text-white">
                <CheckCircle2 className="w-3 h-3" /> Backend online
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="w-3 h-3" /> Backend offline
              </Badge>
            )}
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href="/admin/users">
                <Users className="w-4 h-4" /> Users
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href="/admin/ranking/groups">
                <Target className="w-4 h-4" /> Ranking Agent Config
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" /> Log out
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatTile label="Total" value={stats?.total ?? '—'} icon={<Database className="w-4 h-4" />} />
          <StatTile label="Verified" value={stats?.verified ?? '—'} />
          <StatTile label="Hourly" value={stats?.hourly ?? '—'} />
          <StatTile label="Fixed" value={stats?.fixed ?? '—'} />
        </div>

        {stats?.by_platform && Object.keys(stats.by_platform).length > 0 && (
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4" /> By platform
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs uppercase tracking-wider text-muted-foreground w-16">Platform</span>
                {Object.entries(stats.by_platform).map(([p, n]) => (
                  <Badge key={p} variant="secondary" className="capitalize text-sm py-1 px-3">
                    {p}: <span className="font-bold ml-1">{n}</span>
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" className="gap-1 ml-auto" onClick={refreshStats}>
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </Button>
              </div>
              {stats.by_source && Object.keys(stats.by_source).length > 0 && (
                <div className="flex flex-wrap items-center gap-3 border-t border-border/40 pt-3">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground w-16">Source</span>
                  {Object.entries(stats.by_source).map(([s, n]) => (
                    <Badge key={s} variant="outline" className="capitalize text-sm py-1 px-3">
                      {s}: <span className="font-bold ml-1">{n}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Background pollers */}
        <PollersCard />

        {/* Storage cleanup */}
        <CleanupCard />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* API key config */}
          <Card>
            <CardHeader>
              <CardTitle>Ingestion API Key</CardTitle>
              <CardDescription>
                Sent as the <code className="text-xs">api-key</code> header for pulls/pushes.
                Stored locally in your browser.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="apikey">API Key</Label>
                <Input
                  id="apikey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKeyState(e.target.value)}
                  placeholder="your-hardcoded-api-key-here_lol"
                  className="mt-2 font-mono"
                />
              </div>
              <Button onClick={handleSaveKey} className="gap-2">
                <Save className="w-4 h-4" />
                {savedKey ? 'Saved!' : 'Save key'}
              </Button>
            </CardContent>
          </Card>

          {/* Trigger pull */}
          <Card>
            <CardHeader>
              <CardTitle>Run a Pull</CardTitle>
              <CardDescription>Fetch &amp; ingest jobs from a platform (deduplicated).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                      <SelectItem value="upwork">Upwork</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="limit">Limit</Label>
                  <Input id="limit" type="number" value={limit} onChange={(e) => setLimit(e.target.value)} className="mt-2" />
                </div>
              </div>
              <div>
                <Label htmlFor="query">Keyword (optional)</Label>
                <Input id="query" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. django" className="mt-2" />
              </div>
              {platform === 'upwork' && (
                <div className="flex items-center gap-6">
                  <div>
                    <Label>Job type</Label>
                    <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger className="mt-2 w-36"><SelectValue placeholder="Any" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <Switch id="verified" checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
                    <Label htmlFor="verified">Verified only</Label>
                  </div>
                </div>
              )}
              <Button onClick={handlePull} disabled={pulling} className="gap-2 w-full">
                {pulling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {pulling ? 'Pulling…' : `Pull from ${platform}`}
              </Button>

              {pullResult && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    {pullResult.message} — fetched {pullResult.fetched ?? 0},{' '}
                    <strong>{pullResult.created}</strong> created,{' '}
                    {pullResult.updated} updated, {pullResult.skipped_duplicates} duplicates skipped.
                  </AlertDescription>
                </Alert>
              )}
              {pullError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription className="break-words">{pullError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filter catalog */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="capitalize">{platform} filter catalog</CardTitle>
            <CardDescription>Available filters exposed by the platform (from the backend).</CardDescription>
          </CardHeader>
          <CardContent>
            {catalogLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading…
              </div>
            ) : (
              <pre className="text-xs bg-muted rounded-lg p-4 overflow-x-auto max-h-96">
                {JSON.stringify(catalog, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PollersCard() {
  const [pollers, setPollers] = useState<Poller[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { interval: string; limit: string }>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetchScheduler();
      setPollers(res.pollers);
      setDrafts((prev) => {
        const next = { ...prev };
        res.pollers.forEach((p) => {
          if (!next[p.platform]) {
            next[p.platform] = { interval: String(p.interval_seconds), limit: String(p.limit) };
          }
        });
        return next;
      });
    } catch {
      /* backend may be offline */
    }
  }, []);

  // Live status: refresh every 3s so you can watch pulls happen.
  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [load]);

  const save = async (platform: string, patch: Record<string, unknown>) => {
    setBusy(platform);
    setErr(null);
    try {
      await updatePoller({ platform, ...patch });
      await load();
    } catch (e: any) {
      const msg = String(e?.message || '');
      setErr(
        /api key/i.test(msg) || /401/.test(msg)
          ? 'Invalid or missing API key — set your Ingestion API Key below and click Save, then retry.'
          : msg || 'Update failed.',
      );
    } finally {
      setBusy(null);
    }
  };

  const statusBadge = (p: Poller) => {
    if (!p.enabled) return <Badge variant="outline">disabled</Badge>;
    if (p.last_status === 'ok') return <Badge className="bg-emerald-500 text-white">running</Badge>;
    if (p.last_status === 'error') return <Badge variant="destructive">error</Badge>;
    return <Badge variant="secondary">pending</Badge>;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Background Pollers (auto-sync)</CardTitle>
        <CardDescription>
          Enable a platform to auto-pull on an interval. Requires the{' '}
          <code className="text-xs">run_scheduler</code> process to be running.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {err && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{err}</AlertDescription>
          </Alert>
        )}
        {pollers.map((p) => {
          const d = drafts[p.platform] || { interval: '', limit: '' };
          return (
            <div key={p.platform} className="rounded-lg border border-border/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold capitalize">{p.platform}</span>
                  {statusBadge(p)}
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`en-${p.platform}`} className="text-sm text-muted-foreground">
                    {p.enabled ? 'On' : 'Off'}
                  </Label>
                  <Switch
                    id={`en-${p.platform}`}
                    checked={p.enabled}
                    disabled={busy === p.platform}
                    onCheckedChange={(v) => save(p.platform, { enabled: v })}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <Label className="text-xs">Interval (s)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={d.interval}
                    onChange={(e) => setDrafts((s) => ({ ...s, [p.platform]: { ...d, interval: e.target.value } }))}
                    className="mt-1 w-24 h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs">Limit</Label>
                  <Input
                    type="number"
                    min={1}
                    value={d.limit}
                    onChange={(e) => setDrafts((s) => ({ ...s, [p.platform]: { ...d, limit: e.target.value } }))}
                    className="mt-1 w-24 h-9"
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy === p.platform}
                  onClick={() => save(p.platform, { interval_seconds: Number(d.interval), limit: Number(d.limit) })}
                >
                  Apply
                </Button>
                <div className="text-xs text-muted-foreground ml-auto">
                  {p.last_run ? (
                    <>last run {new Date(p.last_run).toLocaleTimeString()} — {p.last_message}</>
                  ) : (
                    'not run yet'
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground">
          ⚠️ Very short intervals (e.g. 5s) can get your IP rate-limited by the platforms and
          rarely surface new jobs. 60s+ is recommended.
        </p>
      </CardContent>
    </Card>
  );
}

function CleanupCard() {
  const [days, setDays] = useState('2');
  const [eligible, setEligible] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const preview = async () => {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await previewOldJobs(Number(days) || 2);
      setEligible(res.eligible_count);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load count.');
    } finally {
      setBusy(false);
    }
  };

  const purge = async () => {
    if (!confirm(`Permanently delete jobs older than ${days} day(s)? This cannot be undone.`)) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const deleted = await deleteOldJobs(Number(days) || 2);
      setMsg(`Deleted ${deleted} old job(s). Storage reclaimed.`);
      setEligible(0);
    } catch (e: any) {
      setErr(e?.message || 'Delete failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="w-4 h-4" /> Storage cleanup
        </CardTitle>
        <CardDescription>
          Permanently delete old, stale jobs to reclaim storage. Hard delete — no backup.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="cleanup-days">Older than (days)</Label>
            <Input
              id="cleanup-days"
              type="number"
              min={1}
              value={days}
              onChange={(e) => { setDays(e.target.value); setEligible(null); }}
              className="mt-1 w-28"
            />
          </div>
          <Button variant="outline" onClick={preview} disabled={busy}>
            {busy && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Preview count
          </Button>
          {eligible !== null && (
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{eligible}</span> job(s) eligible
            </span>
          )}
          <Button
            variant="destructive"
            className="gap-2 ml-auto"
            onClick={purge}
            disabled={busy || eligible === 0}
          >
            <Trash2 className="w-4 h-4" /> Delete old jobs
          </Button>
        </div>
        {msg && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{msg}</AlertDescription>
          </Alert>
        )}
        {err && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{err}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

function StatTile({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
          {icon}
        </div>
        <div className="text-3xl font-bold mt-2">{value}</div>
      </CardContent>
    </Card>
  );
}
