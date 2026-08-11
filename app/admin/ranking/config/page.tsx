'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save, XCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { RankingConfigAdmin, RankingConfigAdminInput } from '@/lib/types';
import { fetchAdminRankingConfig, updateAdminRankingConfig } from '@/lib/ranking-api';

const WEIGHT_FIELDS: { key: keyof RankingConfigAdminInput; label: string }[] = [
  { key: 'skill_weight', label: 'Skill match' },
  { key: 'client_quality_weight', label: 'Client quality' },
  { key: 'competition_weight', label: 'Competition' },
  { key: 'urgency_weight', label: 'Urgency' },
  { key: 'risk_penalty_weight', label: 'Risk penalty' },
];

export default function RankingConfigPage() {
  const [config, setConfig] = useState<RankingConfigAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchAdminRankingConfig()
      .then(setConfig)
      .catch((err: any) => setError(err?.message || 'Failed to load config. Check your API key on the Admin page.'))
      .finally(() => setLoading(false));
  }, []);

  const setField = <K extends keyof RankingConfigAdmin>(key: K, value: RankingConfigAdmin[K]) => {
    setConfig((c) => (c ? { ...c, [key]: value } : c));
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const { updated_at, ...body } = config;
      const updated = await updateAdminRankingConfig(body);
      setConfig(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!config) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>{error || 'Config unavailable.'}</AlertDescription>
      </Alert>
    );
  }

  const weightSum = WEIGHT_FIELDS.reduce((sum, f) => sum + (config[f.key] as number), 0);

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Business profile</CardTitle>
          <CardDescription>Sent to the AI for every job, alongside the matched group's instruction.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="c-instruction">Global instruction</Label>
            <Textarea
              id="c-instruction"
              value={config.global_instruction}
              onChange={(e) => setField('global_instruction', e.target.value)}
              rows={4}
              className="mt-1.5 max-h-96 overflow-y-auto resize-y"
            />
          </div>
          <div className="w-48">
            <Label htmlFor="c-ttl">Dead job TTL (hours)</Label>
            <Input
              id="c-ttl"
              type="number"
              value={config.dead_job_ttl_hours}
              onChange={(e) => setField('dead_job_ttl_hours', Number(e.target.value))}
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ignore filter</CardTitle>
          <CardDescription>
            Jobs matching any of these keywords are filtered out before ranking and never sent to
            the AI — no LLM tokens spent on them. Matches win regardless of what else the job
            contains (e.g. an "LLM" job that also says "WordPress" still gets filtered if
            "wordpress" is in this list).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="c-ignored-stack">Ignored tech stack (comma-separated)</Label>
          <Textarea
            id="c-ignored-stack"
            value={config.ignored_tech_stack.join(', ')}
            onChange={(e) =>
              setField(
                'ignored_tech_stack',
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            rows={3}
            placeholder="seo, wordpress, php, video editing, tutoring"
            className="mt-1.5"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LLM provider</CardTitle>
          <CardDescription>
            Which provider <code className="text-xs">run_ranking</code> calls. Must match a provider you have an
            active key for on the API Keys tab, or every job will fail to score.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              id="c-provider"
              checked={config.use_gemini}
              onCheckedChange={(v) => setField('use_gemini', v)}
            />
            <Label htmlFor="c-provider">
              {config.use_gemini ? 'Using Gemini' : 'Using Groq'}
            </Label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="c-gemini-model">Gemini model</Label>
              <Input
                id="c-gemini-model"
                value={config.gemini_model}
                onChange={(e) => setField('gemini_model', e.target.value)}
                disabled={!config.use_gemini}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="c-groq-model">Groq model</Label>
              <Input
                id="c-groq-model"
                value={config.groq_model}
                onChange={(e) => setField('groq_model', e.target.value)}
                disabled={config.use_gemini}
                className="mt-1.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proposal generator guidance</CardTitle>
          <CardDescription>
            How the AI should <em>write</em> proposals — tone, structure, length. Takes effect on
            the next proposal generated, no deploy needed. The JSON output format itself isn't
            editable here, so a change to this text can't break proposal parsing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={config.proposal_instruction}
            onChange={(e) => setField('proposal_instruction', e.target.value)}
            rows={8}
            className="font-mono text-sm max-h-96 overflow-y-auto resize-y"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scoring weights</CardTitle>
          <CardDescription>
            How much each dimension counts toward the business score. No deploy needed — takes effect on
            the next <code className="text-xs">run_ranking</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {WEIGHT_FIELDS.map((f) => (
            <div key={f.key}>
              <div className="flex items-center justify-between mb-2">
                <Label>{f.label}</Label>
                <span className="text-sm font-semibold text-foreground">
                  {(config[f.key] as number).toFixed(2)}
                </span>
              </div>
              <Slider
                value={[config[f.key] as number]}
                onValueChange={([v]) => setField(f.key, v)}
                min={0}
                max={5}
                step={0.05}
              />
            </div>
          ))}

          <div className="flex items-center gap-2 pt-2 border-t border-border/40">
            <span className="text-sm text-muted-foreground">
              Sum of weights: <span className="font-semibold text-foreground">{weightSum.toFixed(2)}</span>
            </span>
            {Math.abs(weightSum - 1) > 0.01 && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                Doesn't sum to 1 — that's fine, just a heads up.
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}
