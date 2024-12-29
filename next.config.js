const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'vercel.app'],
  },
  async rewrites() {
    return [
      {
        source: '/analyze/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'https://your-vercel-deployment-url/analyze/:path*'
          : 'http://localhost:8000/analyze/:path*'
      }
    ]
  }
}

module.exports = nextConfig