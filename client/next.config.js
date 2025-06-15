/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["github.com", "avatars.githubusercontent.com"],
    unoptimized: true,
  },
}

module.exports = nextConfig
