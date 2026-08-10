'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Plus, Trash2, XCircle } from 'lucide-react';
import { LLMApiKeyAdmin, LLMApiKeyAdminInput } from '@/lib/types';
import {
  fetchAdminApiKeys,
  createAdminApiKey,
  setAdminApiKeyActive,
  deleteAdminApiKey,
} from '@/lib/ranking-api';

// Plain if/elif model list per provider — a registry/config system isn't
// worth it until there's a third provider.
const MODELS_BY_PROVIDER: Record<'gemini' | 'groq', string[]> = {
  gemini: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'],
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
};

const EMPTY_FORM: LLMApiKeyAdminInput = {
  provider: 'gemini',
  label: '',
  model_name: MODELS_BY_PROVIDER.gemini[0],
  key: '',
  active: true,
};

export default function RankingApiKeysPage() {
  const [keys, setKeys] = useState<LLMApiKeyAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<LLMApiKeyAdminInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setKeys(await fetchAdminApiKeys());
    } catch (err: any) {
      setError(err?.message || 'Failed to load keys. Check your API key on the Admin page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleProviderChange = (provider: 'gemini' | 'groq') => {
    setForm((f) => ({ ...f, provider, model_name: MODELS_BY_PROVIDER[provider][0] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError(null);
    try {
      await createAdminApiKey(form);
      setDialogOpen(false);
      await load();
    } catch (err: any) {
      setFormError(err?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (k: LLMApiKeyAdmin) => {
    setBusyId(k.id);
    try {
      await setAdminApiKeyActive(k.id, !k.active);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Update failed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (k: LLMApiKeyAdmin) => {
    if (!confirm(`Delete key "${k.label || k.masked_key}"? This cannot be undone.`)) return;
    setBusyId(k.id);
    try {
      await deleteAdminApiKey(k.id);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Delete failed.');
    } finally {
      setBusyId(null);
    }
  };

  const cooldownLabel = (k: LLMApiKeyAdmin) => {
    if (!k.cooldown_until) return null;
    const until = new Date(k.cooldown_until);
    if (until.getTime() <= Date.now()) return null;
    return `cooling down until ${until.toLocaleTimeString()}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{keys.length}</span> keys in rotation
        </p>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Add key
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card border border-border/50 rounded-xl text-center">
          <p className="text-muted-foreground">No keys yet. Add one to enable AI scoring.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k) => {
                const cooldown = cooldownLabel(k);
                return (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.label || '—'}</TableCell>
                    <TableCell className="capitalize">{k.provider}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{k.model_name || '—'}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{k.masked_key}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={k.active}
                            disabled={busyId === k.id}
                            onCheckedChange={() => handleToggleActive(k)}
                          />
                          <span className="text-xs text-muted-foreground">{k.active ? 'Active' : 'Disabled'}</span>
                        </div>
                        {cooldown && (
                          <Badge variant="outline" className="text-xs w-fit text-amber-600 dark:text-amber-400">
                            {cooldown}
                          </Badge>
                        )}
                        {k.failure_count > 0 && (
                          <span className="text-xs text-muted-foreground">{k.failure_count} recent failures</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-destructive"
                        disabled={busyId === k.id}
                        onClick={() => handleDelete(k)}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add API key</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Provider</Label>
              <Select value={form.provider} onValueChange={(v) => handleProviderChange(v as 'gemini' | 'groq')}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="k-model">Model</Label>
              <Input
                id="k-model"
                list="model-suggestions"
                value={form.model_name}
                onChange={(e) => setForm((f) => ({ ...f, model_name: e.target.value }))}
                placeholder="e.g. gemini-2.0-flash"
                className="mt-1.5"
              />
              <datalist id="model-suggestions">
                {MODELS_BY_PROVIDER[form.provider].map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
              <p className="text-xs text-muted-foreground mt-1">
                Type any model name — the list below is just suggestions, not a restriction.
              </p>
            </div>

            <div>
              <Label htmlFor="k-label">Label</Label>
              <Input
                id="k-label"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="e.g. personal-key-1"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="k-key">API key</Label>
              <Input
                id="k-key"
                type="password"
                value={form.key}
                onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
                placeholder="paste key"
                className="mt-1.5 font-mono"
              />
            </div>

            {formError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="break-words">{formError}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.key}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
