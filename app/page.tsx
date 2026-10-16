'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  Bot,
  Filter,
  Gauge,
  LayoutGrid,
  MessageSquare,
  PenLine,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { getUser, type AuthUser } from '@/lib/auth-client';

export default function Home() {
  // Cookies are only readable after mount, so hold the signed-out CTAs until
  // then rather than flashing the wrong pair.
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, []);
  const signedIn = mounted && !!user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* The shared SiteHeader is rendered by app/layout.tsx — no nav here. */}

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <Bot className="h-4 w-4 text-primary" />
            AI-scored freelance opportunities
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance">
            Stop scrolling job boards.
            <br />
            Bid on the ones worth winning.
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            ProjectFinder pulls openings from Upwork, Freelancer and Freelancermap,
            removes the duplicates, and scores every one against your stack — so
            you see a ranked shortlist instead of a firehose.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            {signedIn ? (
              <>
                <Link href="/ranking">
                  <Button size="lg" className="gap-2">
                    <Target className="h-5 w-5" />
                    View AI Suggestions
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button size="lg" variant="outline" className="gap-2">
                    <LayoutGrid className="h-5 w-5" />
                    Browse Opportunities
                  </Button>
                </Link>
              </>
            ) : mounted ? (
              <>
                <Link href="/login">
                  <Button size="lg" className="gap-2">
                    Sign in
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline">
                    Create an account
                  </Button>
                </Link>
              </>
            ) : null}
          </div>

          {!signedIn && mounted && (
            <p className="text-sm text-muted-foreground pt-2">
              Opportunities and AI suggestions require an account.
            </p>
          )}
        </div>
      </section>

      {/* The two things you actually do here */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <LayoutGrid className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Opportunities</CardTitle>
              </div>
              <CardDescription>Every listing, de-duplicated and normalised</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                One feed across platforms, with budgets, client history and skills
                parsed into the same shape — so a $-denominated hourly role and a
                ₹-denominated fixed project are actually comparable.
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  'Filter by platform, region, currency and tech stack',
                  'Budget range, job type and payment-verified only',
                  'Full-text search across titles and descriptions',
                  'Content-hash dedup — the same job never lands twice',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 mt-1.5 shrink-0 bg-blue-600 dark:bg-blue-400 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href={signedIn ? '/projects' : '/login'} className="inline-block">
                <Button size="sm" className="gap-2">
                  {signedIn ? 'Browse Opportunities' : 'Sign in to browse'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Target className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle>AI Suggestions</CardTitle>
              </div>
              <CardDescription>A ranked shortlist with the reasoning attached</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Each job is scored on skill match, client quality, competition,
                urgency and risk, then reduced to one call: bid now, bid, review
                first, low priority, or don&apos;t touch it.
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  'Business score and risk flags, with the AI’s reasoning shown',
                  'Priority decays as a posting ages and fills up',
                  'Unverified clients and ignored stacks filtered automatically',
                  'Generate a tailored proposal from the job page',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 mt-1.5 shrink-0 bg-amber-600 dark:bg-amber-400 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href={signedIn ? '/ranking' : '/login'} className="inline-block">
                <Button size="sm" className="gap-2">
                  {signedIn ? 'View Suggestions' : 'Sign in to view'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-lg border border-border bg-card p-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              From raw posting to sent proposal
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The pipeline runs on its own in the background. You come in at the
              point where a decision is actually needed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
            {[
              {
                icon: Filter,
                step: '01',
                title: 'Ingest & de-duplicate',
                body: 'Scheduled pulls from each platform, normalised into one model and fingerprinted so repeats collapse.',
              },
              {
                icon: Gauge,
                step: '02',
                title: 'Score & rank',
                body: 'Five dimensions weighted into a business score you can tune, with priority decaying as the posting ages.',
              },
              {
                icon: PenLine,
                step: '03',
                title: 'Draft the proposal',
                body: 'A tailored cover letter, bid and timeline generated from the job and your configured stack.',
              },
              {
                icon: MessageSquare,
                step: '04',
                title: 'Approve on WhatsApp',
                body: 'High scorers get pushed to your group. Reply “approve” and the bid goes out — nothing fires unattended.',
              },
            ].map(({ icon: Icon, step, title, body }) => (
              <div key={step} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-xs font-mono text-muted-foreground">{step}</span>
                </div>
                <div className="font-semibold text-foreground">{title}</div>
                <p className="text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin / trust strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="rounded-lg border border-border bg-card p-6">
            <ShieldCheck className="h-5 w-5 text-primary mb-2" />
            <div className="font-semibold text-foreground mb-1">Human in the loop</div>
            <p className="text-muted-foreground">
              Nothing is submitted without an explicit approval. The AI ranks and
              drafts; you decide.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <Bot className="h-5 w-5 text-primary mb-2" />
            <div className="font-semibold text-foreground mb-1">Tunable, not a black box</div>
            <p className="text-muted-foreground">
              Scoring weights, tech groups and ignored keywords are all editable —
              and every score shows its reasoning.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <Gauge className="h-5 w-5 text-primary mb-2" />
            <div className="font-semibold text-foreground mb-1">Runs unattended</div>
            <p className="text-muted-foreground">
              Scheduler, ranking and decay workers keep the feed current without
              anyone opening the app.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} ProjectFinder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
