'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Briefcase, LayoutGrid } from 'lucide-react';

export function SiteHeader() {
  const pathname = usePathname();

  const routes = [
    {
      href: '/projects',
      label: 'Projects & Contests',
      icon: LayoutGrid,
      active: pathname === '/projects'
    },
    {
      href: '/jobs',
      label: 'Freelance Jobs',
      icon: Briefcase,
      active: pathname === '/jobs'
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center">
        <div className="mr-8 flex items-center">
          <Link href="/projects" className="flex items-center space-x-2">
            <span className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              ProjectFinder
            </span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "transition-all hover:text-foreground/80 flex items-center gap-2",
                  route.active ? "text-primary border-b-2 border-primary py-5" : "text-muted-foreground py-5 border-b-2 border-transparent"
                )}
              >
                <route.icon className="w-4 h-4" />
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
