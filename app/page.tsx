import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Briefcase, Trophy } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 z-50 bg-card/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="text-2xl font-bold text-primary">Marketplace</div>
            <div className="flex items-center gap-4">
              <Link href="/projects">
                <Button variant="ghost">Projects</Button>
              </Link>
              <Link href="/jobs">
                <Button variant="ghost">Contests</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-6 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance">
            Find Your Next Opportunity
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Browse through thousands of projects and contests. Find skilled professionals or showcase your talents.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/projects">
              <Button size="lg" className="gap-2">
                Browse Projects
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/jobs">
              <Button size="lg" variant="outline" className="gap-2">
                Explore Contests
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Projects Card */}
          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Projects</CardTitle>
              </div>
              <CardDescription>Find your next project opportunity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Browse through a wide range of projects from small tasks to large enterprise solutions. Filter by budget, skills, status, and more.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  Advanced filtering options
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  Real-time search capabilities
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  Multiple sorting options
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  Detailed project information
                </li>
              </ul>
              <Link href="/projects" className="inline-block">
                <Button size="sm" className="gap-2">
                  Browse Projects
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Jobs Card */}
          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle>Contests & Jobs</CardTitle>
              </div>
              <CardDescription>Participate in contests and find job opportunities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Showcase your talent in design contests or find job postings. Connect with clients and grow your portfolio.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-amber-600 dark:bg-amber-400 rounded-full" />
                  Featured contest highlighting
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-amber-600 dark:bg-amber-400 rounded-full" />
                  Filter by contest type
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-amber-600 dark:bg-amber-400 rounded-full" />
                  Entry count tracking
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-amber-600 dark:bg-amber-400 rounded-full" />
                  Owner ratings visibility
                </li>
              </ul>
              <Link href="/jobs" className="inline-block">
                <Button size="sm" className="gap-2">
                  Browse Contests
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Powerful Tools for Discovery
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Both sections come equipped with advanced search, filtering, sorting, and pagination features to help you find exactly what you&apos;re looking for.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="font-semibold text-foreground mb-2">🔍 Search</div>
              <p className="text-muted-foreground">Full-text search across titles and descriptions</p>
            </div>
            <div>
              <div className="font-semibold text-foreground mb-2">⚙️ Filter</div>
              <p className="text-muted-foreground">Advanced filters for budget, skills, status, and more</p>
            </div>
            <div>
              <div className="font-semibold text-foreground mb-2">📊 Sort</div>
              <p className="text-muted-foreground">Multiple sorting options including newest, price, and rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground text-sm">
            <p>&copy; 2024 Marketplace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
