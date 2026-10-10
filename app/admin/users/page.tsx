'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, UserPlus, Trash2, XCircle, ArrowLeft, ShieldCheck, Users } from 'lucide-react';
import { AdminUser } from '@/lib/types';
import { fetchUsers, createUser, updateUser, deleteUser } from '@/lib/users-api';
import { getUser } from '@/lib/auth-client';

const EMPTY = { username: '', email: '', password: '', role: 'member' as 'admin' | 'member' };

export default function AdminUsersPage() {
  const me = typeof window !== 'undefined' ? getUser() : null;
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | 'new' | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [addError, setAddError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchUsers()
      .then(setUsers)
      .catch((e: any) => setError(e?.message || 'Failed to load users.'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const changeRole = async (u: AdminUser, role: 'admin' | 'member') => {
    setBusy(u.id);
    try {
      await updateUser(u.id, { role });
      load();
    } catch (e: any) {
      setError(e?.message || 'Update failed.');
    } finally {
      setBusy(null);
    }
  };

  const toggleActive = async (u: AdminUser) => {
    setBusy(u.id);
    try {
      await updateUser(u.id, { is_active: !u.is_active });
      load();
    } catch (e: any) {
      setError(e?.message || 'Update failed.');
    } finally {
      setBusy(null);
    }
  };

  const removeUser = async (u: AdminUser) => {
    if (!confirm(`Delete user "${u.username}"? This cannot be undone.`)) return;
    setBusy(u.id);
    try {
      await deleteUser(u.id);
      load();
    } catch (e: any) {
      setError(e?.message || 'Delete failed.');
    } finally {
      setBusy(null);
    }
  };

  const add = async () => {
    setBusy('new');
    setAddError(null);
    try {
      await createUser(form);
      setAddOpen(false);
      setForm(EMPTY);
      load();
    } catch (e: any) {
      setAddError(e?.message || 'Create failed.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Admin
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="w-7 h-7" /> Users
            </h1>
            <p className="text-muted-foreground mt-1">Manage accounts and roles.</p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <UserPlus className="w-4 h-4" /> Add user
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {users.length} user{users.length === 1 ? '' : 's'}
            </CardTitle>
            <CardDescription>
              Members can view suggestions and compose proposals. Admins can manage everything.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-8">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading…
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => {
                      const isMe = me?.id === u.id;
                      return (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">
                            {u.username}
                            {isMe && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{u.email || '—'}</TableCell>
                          <TableCell>
                            <Select
                              value={u.role}
                              onValueChange={(v) => changeRole(u, v as 'admin' | 'member')}
                              disabled={busy === u.id || isMe}
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {u.is_active ? (
                              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0">
                                <ShieldCheck className="w-3 h-3 mr-1" /> Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">Disabled</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={busy === u.id || isMe}
                              onClick={() => toggleActive(u)}
                            >
                              {u.is_active ? 'Disable' : 'Enable'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              disabled={busy === u.id || isMe}
                              onClick={() => removeUser(u)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>Create an account and set its role.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="u-username">Username</Label>
              <Input id="u-username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="u-email">Email</Label>
              <Input id="u-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="u-pw">Password</Label>
              <Input id="u-pw" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as 'admin' | 'member' })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {addError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{addError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={busy === 'new'}>Cancel</Button>
            <Button onClick={add} disabled={busy === 'new' || !form.username || !form.password} className="gap-2">
              {busy === 'new' && <Loader2 className="w-4 h-4 animate-spin" />}
              Create user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
