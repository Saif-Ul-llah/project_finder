import { NextRequest, NextResponse } from 'next/server';

// Protects the /admin page with HTTP Basic Auth. Runs on the edge before the
// page renders, so it is real server-side protection (not client-side hiding).
//
// Credentials come from env vars (set these in Vercel):
//   ADMIN_USER     (default "admin")
//   ADMIN_PASSWORD (required to ENABLE the gate)
//
// If ADMIN_PASSWORD is unset, the gate is disabled (handy for local dev) — so
// you MUST set ADMIN_PASSWORD in Vercel for protection to take effect.
export const config = {
  matcher: ['/admin', '/admin/:path*'],
};

export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.next(); // protection disabled until configured
  }

  const user = process.env.ADMIN_USER || 'admin';
  const header = req.headers.get('authorization');

  if (header?.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6));
      const sep = decoded.indexOf(':');
      const u = decoded.slice(0, sep);
      const p = decoded.slice(sep + 1);
      if (u === user && p === password) {
        return NextResponse.next();
      }
    } catch {
      /* fall through to challenge */
    }
  }

  return new NextResponse('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin", charset="UTF-8"' },
  });
}
