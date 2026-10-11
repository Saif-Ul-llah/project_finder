import { NextRequest, NextResponse } from 'next/server';

// Route gating based on the JWT cookies set at login (see lib/auth-client.ts).
// The backend is the real security boundary; this only drives UX redirects.
//
// Gates on the REFRESH cookie, not the access cookie. Access tokens are
// short-lived by design and expire constantly during normal use; the client
// swaps them for fresh ones from the refresh token. Treating a missing access
// cookie as "signed out" bounced people to /login mid-session even though
// their session had days left — this proxy has no way to refresh, so it must
// not be the thing that decides the session is over.
//
//   /admin, /admin/*          -> require role=admin
//   /ranking, /ranking/*      -> require login (member or admin)
//   /projects, /enterprise,
//   /jobs                     -> require login (member or admin)
//   /, /login, /register      -> public (landing + the auth pages themselves)
//
// Everything that shows real data is behind a login; only the landing page
// and the auth screens stay open.
export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/ranking',
    '/ranking/:path*',
    '/projects',
    '/projects/:path*',
    '/enterprise',
    '/enterprise/:path*',
    '/jobs',
    '/jobs/:path*',
  ],
};

// The session cookie. Set at login, replaced on every refresh, and cleared on
// logout — so its presence is what "signed in" means here.
const SESSION_COOKIE = 'pf_refresh';
const ROLE_COOKIE = 'pf_role';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = !!req.cookies.get(SESSION_COOKIE)?.value;
  const role = req.cookies.get(ROLE_COOKIE)?.value;

  const needsAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

  if (needsAdmin) {
    if (!hasSession) return redirectToLogin(req, pathname);
    if (role !== 'admin') {
      // Logged in but not an admin — send to the app, not the login loop.
      const url = req.nextUrl.clone();
      url.pathname = '/ranking';
      url.searchParams.set('denied', 'admin');
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // /ranking, /projects, /enterprise, /jobs and children — any
  // authenticated user.
  if (!hasSession) return redirectToLogin(req, pathname);
  return NextResponse.next();
}

function redirectToLogin(req: NextRequest, next: string) {
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', next);
  return NextResponse.redirect(url);
}
