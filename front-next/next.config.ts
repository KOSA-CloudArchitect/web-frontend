import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.coupang.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'coupangcdn.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // API 프록시 설정
  async rewrites() {
    return [
      // 웹소켓 프록시 설정
      {
        source: '/ws/:path*',
        destination: 'http://review-analysis-web-alb-2002000396.ap-northeast-2.elb.amazonaws.com/ws/:path*',
      },
      // 특정 API 경로들을 백엔드로 프록시 (이미지 프록시 제외)
      {
        source: '/api/health',
        destination: 'http://review-analysis-web-alb-2002000396.ap-northeast-2.elb.amazonaws.com/api/health',
      },
      {
        source: '/api/search',
        destination: 'http://review-analysis-web-alb-2002000396.ap-northeast-2.elb.amazonaws.com/api/search',
      },
      {
        source: '/api/products/:path*',
        destination: 'http://review-analysis-web-alb-2002000396.ap-northeast-2.elb.amazonaws.com/api/products/:path*',
      },
      {
        source: '/api/analysis/:path*',
        destination: 'http://review-analysis-web-alb-2002000396.ap-northeast-2.elb.amazonaws.com/api/analysis/:path*',
      },
    ];
  },
  // 성능 최적화
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
  // Docker를 위한 standalone 모드 활성화
  output: 'standalone',
  // ESLint 비활성화 (빌드 시)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // TypeScript 오류 무시 (빌드 시)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
