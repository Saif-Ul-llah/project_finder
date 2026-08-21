import { NextRequest, NextResponse } from 'next/server';

// Route gating based on the JWT cookies set at login (see lib/auth-client.ts).
// The backend is the real security boundary; this only drives UX redirects.
//
//   /admin, /admin/*        -> require role=admin
//   /ranking, /ranking/*    -> require login (member or admin)
//   everything else         -> public (job listing, home, login, register)
export const config = {
  matcher: ['/admin', '/admin/:path*', '/ranking', '/ranking/:path*'],
};

const ACCESS_COOKIE = 'pf_access';
const ROLE_COOKIE = 'pf_role';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasToken = !!req.cookies.get(ACCESS_COOKIE)?.value;
  const role = req.cookies.get(ROLE_COOKIE)?.value;

  const needsAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

  if (needsAdmin) {
    if (!hasToken) return redirectToLogin(req, pathname);
    if (role !== 'admin') {
      // Logged in but not an admin — send to the app, not the login loop.
      const url = req.nextUrl.clone();
      url.pathname = '/ranking';
      url.searchParams.set('denied', 'admin');
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // /ranking and children — any authenticated user.
  if (!hasToken) return redirectToLogin(req, pathname);
  return NextResponse.next();
}

function redirectToLogin(req: NextRequest, next: string) {
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', next);
  return NextResponse.redirect(url);
}
