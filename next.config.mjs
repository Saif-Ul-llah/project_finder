/** @type {import('next').NextConfig} */

// Django backend base URL. Server-side only (kept out of the client bundle).
// The rewrite below proxies /api/backend/* to the Django API so the browser
// makes same-origin requests (no CORS needed).
// Defaults to the deployed Railway backend; override with BACKEND_API_URL
// (e.g. http://127.0.0.1:8000) to point at a local backend.
const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  'https://projecthuntingbackendpython-production.up.railway.app'

const nextConfig = {
  // NOTE: `typescript.ignoreBuildErrors` is deliberately absent. It used to be
  // true, which meant `next build` happily shipped type errors — and the only
  // errors it was hiding came from four card components that nothing
  // imported. With those deleted the tree typechecks clean, so the build is
  // the gate again. Do not re-add this flag to get a red build green.
  allowedDevOrigins: ['localhost', '127.0.0.1'],
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        // Trailing slash on the destination: Django requires it (APPEND_SLASH).
        // Client paths are slash-less; the proxy adds it here.
        source: '/api/backend/:path*',
        destination: `${BACKEND_API_URL}/api/:path*/`,
      },
      // Legacy direct-to-Freelancer proxy (kept for reference / fallback).
      {
        source: '/api/freelancer/:path*',
        destination: 'https://www.freelancer.com/:path*',
      },
    ]
  },
}

export default nextConfig
