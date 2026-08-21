'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/admin/ranking/groups', label: 'Groups' },
  { href: '/admin/ranking/config', label: 'Global Config' },
  { href: '/admin/ranking/keys', label: 'API Keys' },
  { href: '/admin/ranking/queue', label: 'Queue' },
];

export default function RankingAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Ranking Agent Config</h1>
          <p className="text-muted-foreground mt-1">
            Manage tech groups, scoring weights, and LLM API keys.
          </p>
        </div>

        <div className="flex rounded-lg border border-border/60 bg-card p-1 w-fit mb-6">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'px-4 h-9 rounded-md text-sm font-medium transition-colors flex items-center',
                pathname.startsWith(tab.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {children}
      </div>
    </div>
  );
}
