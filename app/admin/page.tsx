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
} from 'lucide-react';
import {
  checkHealth,
  fetchStats,
  fetchFilters,
  triggerPull,
  getApiKey,
  setApiKey as persistApiKey,
} from '@/lib/api';
import { Stats, PullResult, FilterCatalog } from '@/lib/types';

export default function AdminPage() {
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
            <CardContent className="flex flex-wrap gap-3">
              {Object.entries(stats.by_platform).map(([p, n]) => (
                <Badge key={p} variant="secondary" className="capitalize text-sm py-1 px-3">
                  {p}: <span className="font-bold ml-1">{n}</span>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="gap-1 ml-auto" onClick={refreshStats}>
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
