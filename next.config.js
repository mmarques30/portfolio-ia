/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/portfolio-ia',
  assetPrefix: '/portfolio-ia/',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
