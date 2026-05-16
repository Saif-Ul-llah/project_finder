/** @type {import('next').NextConfig} */
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
        source: '/api/freelancer/:path*',
        destination: 'https://www.freelancer.com/:path*',
      },
    ]
  },
}

export default nextConfig
