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
  typescript: {
    ignoreBuildErrors: true,
  },
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
