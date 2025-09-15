import React from 'react';
import Link from 'next/link';
import { Github, Mail, ExternalLink } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-gray-50 border-t border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 브랜드 정보 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-blue-600">KOSA</span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              리뷰 기반 실시간 감정 분석 및 요약 서비스로 
              더 나은 구매 결정을 도와드립니다.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@kosa.com"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="이메일"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* 서비스 링크 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              서비스
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/search" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  상품 검색
                </Link>
              </li>
              <li>
                <Link 
                  href="/analysis" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  리뷰 분석
                </Link>
              </li>
              <li>
                <Link 
                  href="/watchlist" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  관심 상품
                </Link>
              </li>
            </ul>
          </div>

          {/* 지원 링크 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              지원
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/help" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  도움말
                </Link>
              </li>
              <li>
                <Link 
                  href="/faq" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  문의하기
                </Link>
              </li>
              <li>
                <a
                  href="https://coupang.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors flex items-center"
                >
                  쿠팡 바로가기
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm">
              © {currentYear} KOSA. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link 
                href="/privacy" 
                className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                개인정보처리방침
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                이용약관
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};