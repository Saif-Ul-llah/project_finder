'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, XCircle, CheckCircle2, ListTodo, Trash2 } from 'lucide-react';
import { fetchRankingQueueStatus, clearRankingQueue } from '@/lib/ranking-api';

export default function RankingQueuePage() {
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lastCleared, setLastCleared] = useState<number | null>(null);

  const refresh = () => {
    setLoading(true);
    setError(null);
    fetchRankingQueueStatus()
      .then((res) => setPendingCount(res.pending_count))
      .catch((err: any) => setError(err?.message || 'Failed to load queue status. Check your API key on the Admin page.'))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const handleClear = async () => {
    setClearing(true);
    setError(null);
    try {
      const res = await clearRankingQueue();
      setLastCleared(res.cleared);
      setConfirmOpen(false);
      refresh();
    } catch (err: any) {
      setError(err?.message || 'Clear failed.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {lastCleared !== null && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Cleared {lastCleared} job(s) from the ranking queue. No LLM tokens were spent.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Ranking queue
          </CardTitle>
          <CardDescription>
            Jobs with no score yet, or whose last scoring attempt failed — the background worker
            picks these up every few seconds and spends an LLM call on each one (unless it matches
            your ignore-tech-stack list). Clearing marks them skipped instead, at zero token cost.
            Already-scored jobs are never touched.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : (
            <div className="text-4xl font-bold text-foreground">
              {pendingCount}
              <span className="text-base font-normal text-muted-foreground ml-2">
                job(s) pending
              </span>
            </div>
          )}

          <Button
            variant="destructive"
            className="gap-2"
            disabled={loading || clearing || !pendingCount}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="w-4 h-4" />
            Clear ranking queue
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear the ranking queue?</DialogTitle>
            <DialogDescription>
              This will mark all {pendingCount} pending job(s) as skipped (Low Priority /
              "queue_reset") without ever sending them to the AI. This cannot be undone from here —
              use "Reset to ranking queue" on individual jobs in the Django admin if you need one
              back in the queue later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={clearing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClear} disabled={clearing} className="gap-2">
              {clearing && <Loader2 className="w-4 h-4 animate-spin" />}
              {clearing ? 'Clearing...' : `Clear ${pendingCount} job(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
