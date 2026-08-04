// Admin session helpers. The session cookie holds an HMAC of the configured
// credentials, so it cannot be forged without the secret and changing the
// password invalidates old sessions. Uses Web Crypto (works in the edge
// middleware and in Node route handlers).

export const SESSION_COOKIE = 'admin_session';

async function hmacHex(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function adminUser(): string {
  return process.env.ADMIN_USER || 'admin';
}

// Returns null when auth is not configured (ADMIN_PASSWORD unset) — the gate is
// then disabled (handy for local dev).
export async function expectedSessionToken(): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  const secret = process.env.AUTH_SECRET || password;
  return hmacHex(`${adminUser()}:${password}`, secret);
}

export function verifyCredentials(username: string, password: string): boolean {
  const expectedPw = process.env.ADMIN_PASSWORD;
  return Boolean(expectedPw) && username === adminUser() && password === expectedPw;
}
