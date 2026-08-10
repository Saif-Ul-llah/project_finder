'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Loader2, Plus, Pencil, Trash2, XCircle } from 'lucide-react';
import { TechGroupAdmin, TechGroupAdminInput } from '@/lib/types';
import { fetchAdminGroups, createAdminGroup, updateAdminGroup, deleteAdminGroup } from '@/lib/ranking-api';

const PRIORITY_TIERS: TechGroupAdmin['priority_tier'][] = [
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
  'IGNORE',
];

const EMPTY_FORM: TechGroupAdminInput = {
  name: '',
  keywords: [],
  instruction: '',
  specialization: '',
  domain: '',
  priority_tier: 'MEDIUM',
  priority_weight: 1.0,
  base_decay_rate: 0.05,
  min_budget: null,
  max_budget: null,
  hourly_min_rate: null,
  hourly_max_rate: null,
  active: true,
};

export default function RankingGroupsPage() {
  const [groups, setGroups] = useState<TechGroupAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TechGroupAdminInput>(EMPTY_FORM);
  const [keywordsText, setKeywordsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setGroups(await fetchAdminGroups());
    } catch (err: any) {
      setError(err?.message || 'Failed to load groups. Check your API key on the Admin page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setKeywordsText('');
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (g: TechGroupAdmin) => {
    setEditingId(g.id);
    setForm({
      name: g.name,
      keywords: g.keywords,
      instruction: g.instruction,
      specialization: g.specialization,
      domain: g.domain,
      priority_tier: g.priority_tier,
      priority_weight: g.priority_weight,
      base_decay_rate: g.base_decay_rate,
      min_budget: g.min_budget,
      max_budget: g.max_budget,
      hourly_min_rate: g.hourly_min_rate,
      hourly_max_rate: g.hourly_max_rate,
      active: g.active,
    });
    setKeywordsText(g.keywords.join(', '));
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError(null);
    try {
      const body: TechGroupAdminInput = {
        ...form,
        keywords: keywordsText
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
      };
      if (editingId) {
        await updateAdminGroup(editingId, body);
      } else {
        await createAdminGroup(body);
      }
      setDialogOpen(false);
      await load();
    } catch (err: any) {
      setFormError(err?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (g: TechGroupAdmin) => {
    if (!confirm(`Delete group "${g.name}"? This cannot be undone.`)) return;
    try {
      await deleteAdminGroup(g.id);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Delete failed.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{groups.length}</span> groups
        </p>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Add group
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
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card border border-border/50 rounded-xl text-center">
          <p className="text-muted-foreground">No groups yet. Add one to start matching jobs.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((g) => (
            <div
              key={g.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-card p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">{g.name}</span>
                  <Badge variant="secondary" className="text-xs">{g.priority_tier}</Badge>
                  {!g.active && <Badge variant="outline" className="text-xs">inactive</Badge>}
                  {(g.min_budget != null || g.max_budget != null) && (
                    <Badge variant="outline" className="text-xs">
                      Fixed: ${g.min_budget ?? '0'} - ${g.max_budget ?? '∞'}
                    </Badge>
                  )}
                  {(g.hourly_min_rate != null || g.hourly_max_rate != null) && (
                    <Badge variant="outline" className="text-xs">
                      Hourly: ${g.hourly_min_rate ?? '0'} - ${g.hourly_max_rate ?? '∞'}/hr
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {g.keywords.join(', ') || 'no keywords'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openEdit(g)}>
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-destructive" onClick={() => handleDelete(g)}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit group' : 'Add group'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="g-name">Name</Label>
              <Input
                id="g-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="g-keywords">Keywords (comma-separated)</Label>
              <Input
                id="g-keywords"
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                placeholder="django, drf, postgresql"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="g-instruction">Instruction (fed to the AI)</Label>
              <Textarea
                id="g-instruction"
                value={form.instruction}
                onChange={(e) => setForm((f) => ({ ...f, instruction: e.target.value }))}
                className="mt-1.5"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="g-specialization">Specialization</Label>
                <Input
                  id="g-specialization"
                  value={form.specialization}
                  onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="g-domain">Domain</Label>
                <Input
                  id="g-domain"
                  value={form.domain}
                  onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Priority tier</Label>
                <Select
                  value={form.priority_tier}
                  onValueChange={(v) => setForm((f) => ({ ...f, priority_tier: v as TechGroupAdmin['priority_tier'] }))}
                >
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITY_TIERS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="g-decay">Base decay rate</Label>
                <Input
                  id="g-decay"
                  type="number"
                  step="0.01"
                  value={form.base_decay_rate}
                  onChange={(e) => setForm((f) => ({ ...f, base_decay_rate: Number(e.target.value) }))}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Fixed-price budget</Label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <Input
                  aria-label="Min fixed budget"
                  type="number"
                  step="0.01"
                  value={form.min_budget ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, min_budget: e.target.value === '' ? null : Number(e.target.value) }))}
                  placeholder="No minimum"
                />
                <Input
                  aria-label="Max fixed budget"
                  type="number"
                  step="0.01"
                  value={form.max_budget ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, max_budget: e.target.value === '' ? null : Number(e.target.value) }))}
                  placeholder="No maximum"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Hourly rate ($/hr)</Label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <Input
                  aria-label="Min hourly rate"
                  type="number"
                  step="0.01"
                  value={form.hourly_min_rate ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, hourly_min_rate: e.target.value === '' ? null : Number(e.target.value) }))}
                  placeholder="No minimum"
                />
                <Input
                  aria-label="Max hourly rate"
                  type="number"
                  step="0.01"
                  value={form.hourly_max_rate ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, hourly_max_rate: e.target.value === '' ? null : Number(e.target.value) }))}
                  placeholder="No maximum"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Optional. Bounds this group cares about, kept separate since fixed-price and hourly jobs aren't on the
              same scale — used as a filter/note, not a scoring dimension.
            </p>

            <div className="flex items-center gap-2">
              <Switch
                id="g-active"
                checked={form.active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
              />
              <Label htmlFor="g-active">Active</Label>
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
            <Button onClick={handleSave} disabled={saving || !form.name}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? 'Save changes' : 'Create group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
