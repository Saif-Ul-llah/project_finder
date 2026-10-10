'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { LayoutGrid, Settings, Target, LogIn, LogOut, User } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { getUser, logout, type AuthUser } from '@/lib/auth-client';

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  // Read auth cookies only after mount to avoid hydration mismatch.
  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, [pathname]);

  const isAdmin = user?.role === 'admin';

  const routes = [
    { href: '/projects', label: 'Opportunities', icon: LayoutGrid, show: true },
    { href: '/ranking', label: 'Suggestions', icon: Target, show: true },
    { href: '/admin', label: 'Admin', icon: Settings, show: isAdmin },
  ].filter((r) => r.show);

  const handleLogout = () => {
    logout();
    setUser(null);
    router.replace('/login');
    router.refresh();
  };

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
                  'transition-all hover:text-foreground/80 flex items-center gap-2',
                  pathname === route.href
                    ? 'text-primary border-b-2 border-primary py-5'
                    : 'text-muted-foreground py-5 border-b-2 border-transparent',
                )}
              >
                <route.icon className="w-4 h-4" />
                {route.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {mounted && user ? (
              <>
                <span className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  {user.username}
                  <span className="text-xs rounded-full bg-secondary px-2 py-0.5 capitalize">{user.role}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : mounted ? (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogIn className="w-4 h-4" /> Sign in
              </Link>
            ) : null}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
