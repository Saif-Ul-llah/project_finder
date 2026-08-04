import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, expectedSessionToken } from '@/lib/auth';

// Gates /admin behind a login screen. Runs on the edge before the page renders.
// The login page itself (/admin/login) is always allowed through.
//
// Enable by setting ADMIN_PASSWORD (and ideally AUTH_SECRET) in Vercel. When
// ADMIN_PASSWORD is unset, the gate is disabled (local dev).
export const config = {
  matcher: ['/admin', '/admin/:path*'],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow the login screen.
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    return NextResponse.next();
  }

  const expected = await expectedSessionToken();
  if (!expected) {
    return NextResponse.next(); // auth not configured -> open
  }

  const session = req.cookies.get(SESSION_COOKIE)?.value;
  if (session && session === expected) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}
