'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  XCircle,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GeneratedProposal, RankingSuggestion } from '@/lib/types';
import { fetchRankedJob, generateProposal } from '@/lib/ranking-api';
import { readProposal, writeProposal } from '@/lib/proposal-cache';

const DURATION_OPTIONS = [
  'Less than 1 month',
  '1 to 3 months',
  '3 to 6 months',
  'More than 6 months',
];

// Every field Upwork's real "Submit a Proposal" form asks for. The AI fills
// the first three; the rest are genuinely manual — screening questions are
// job-specific, attachments/skills are a portfolio judgment call, and
// Connects is Upwork's own visibility-boost spend. Auto-filling Upwork
// itself is a later phase — this page only prepares what to paste in.
const UPWORK_FORM_FIELDS = [
  { label: 'Cover Letter', aiSuggested: true },
  { label: 'Bid (hourly rate or total price)', aiSuggested: true },
  { label: 'Project duration', aiSuggested: true },
  { label: 'Featured skills (up to 3, from the job listing)', aiSuggested: false },
  { label: 'Answers to screening questions (if the client asked any)', aiSuggested: false },
  { label: 'Attachments / portfolio samples', aiSuggested: false },
  { label: 'Connects to boost the proposal', aiSuggested: false },
];

export default function ProposalPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = Number(params.jobId);

  const [job, setJob] = useState<RankingSuggestion | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);

  const [proposal, setProposal] = useState<GeneratedProposal | null>(null);
  const [generating, setGenerating] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchRankedJob(jobId)
      .then(setJob)
      .catch((err: any) => setJobError(err?.message || 'Failed to load job.'));
  }, [jobId]);

  const handleGenerate = async () => {
    setGenerating(true);
    setProposalError(null);
    try {
      const result = await generateProposal(jobId);
      const withTimestamp: GeneratedProposal = { ...result, generated_at: new Date().toISOString() };
      writeProposal(withTimestamp);
      setProposal(withTimestamp);
    } catch (err: any) {
      setProposalError(err?.message || 'Failed to generate proposal.');
    } finally {
      setGenerating(false);
    }
  };

  // React's dev-mode Strict Mode double-invokes effects; without this guard
  // that means two LLM calls (two sets of tokens spent) for one page load.
  const autoGenerateFired = useRef(false);

  useEffect(() => {
    const cached = readProposal(jobId);
    if (cached) {
      setProposal(cached);
    } else if (!autoGenerateFired.current) {
      autoGenerateFired.current = true;
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const updateField = <K extends keyof GeneratedProposal>(key: K, value: GeneratedProposal[K]) => {
    setProposal((p) => {
      if (!p) return p;
      const updated = { ...p, [key]: value };
      writeProposal(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
      return updated;
    });
  };

  const bidLabel = job?.job_type === 'hourly' ? 'Hourly Rate ($/hr)' : 'Total Bid Amount ($)';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href="/ranking"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Suggestions
        </Link>

        {jobError && (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{jobError}</AlertDescription>
          </Alert>
        )}

        {job && (
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs rounded-full capitalize">{job.platform}</Badge>
              {job.recommendation && (
                <Badge className="text-xs rounded-full bg-emerald-500 text-white">
                  {job.recommendation.replace('_', ' ')}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
              <span>Listed budget: {job.budget_raw || 'TBD'}</span>
              <span className="capitalize">{job.job_type || 'unknown'} price</span>
            </div>
          </div>
        )}

        {/* AI-suggested bid parameters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> AI-Suggested Bid Parameters
            </CardTitle>
            <CardDescription>
              Generated once, cached in this browser — editing here doesn't call the AI again.
              Nothing is sent to Upwork automatically yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generating && (
              <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" /> Generating proposal…
              </div>
            )}

            {proposalError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="break-words">{proposalError}</AlertDescription>
              </Alert>
            )}

            {!generating && proposal && (
              <>
                <div>
                  <Label htmlFor="p-cover-letter">Cover Letter</Label>
                  <Textarea
                    id="p-cover-letter"
                    value={proposal.cover_letter}
                    onChange={(e) => updateField('cover_letter', e.target.value)}
                    rows={10}
                    className="mt-1.5 max-h-96 overflow-y-auto resize-y"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="p-bid">{bidLabel}</Label>
                    <Input
                      id="p-bid"
                      type="number"
                      step="0.01"
                      value={proposal.bid}
                      onChange={(e) => updateField('bid', Number(e.target.value))}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Project Duration</Label>
                    <Select value={proposal.duration} onValueChange={(v) => updateField('duration', v)}>
                      <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DURATION_OPTIONS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-xs text-muted-foreground">
                    {saved ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Saved to this browser
                      </span>
                    ) : (
                      `Generated ${new Date(proposal.generated_at).toLocaleString()}`
                    )}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    disabled={generating}
                    onClick={handleGenerate}
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Full Upwork proposal-form checklist, for parity/completeness */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Full Upwork Proposal Checklist</CardTitle>
            <CardDescription>
              Everything Upwork's own proposal form asks for. What's pre-filled above, and what
              you still fill in yourself on Upwork.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {UPWORK_FORM_FIELDS.map((f) => (
                <li key={f.label} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{f.label}</span>
                  {f.aiSuggested ? (
                    <Badge variant="secondary" className="text-xs">AI-suggested</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Set on Upwork
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Explicitly not auto-filling Upwork yet — just a link to the job. */}
        <Button size="lg" className="w-full gap-2" disabled={!job?.url} asChild={!!job?.url}>
          {job?.url ? (
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              Wanna Bid <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <span>Wanna Bid</span>
          )}
        </Button>
      </div>
    </div>
  );
}
