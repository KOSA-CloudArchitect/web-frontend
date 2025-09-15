'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useIsAuthenticated, useAuthUser, useAuthLogout } from '../../stores/authStore';
import { MapPin, Heart, ShoppingCart } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthUser();
  const logout = useAuthLogout();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <header className={`bg-white shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-3xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
            >
              KOSA
            </Link>
          </div>

          {/* 오른쪽 메뉴 */}
          <div className="flex items-center space-x-8">
            {/* 로그인/회원가입 또는 사용자 정보 */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span className="font-medium">{user?.email || '사용자'}</span>
                <span className="text-gray-400">|</span>
                <button
                  onClick={handleLogout}
                  className="hover:text-gray-800 transition-colors font-medium"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Link
                  href="/login"
                  className="hover:text-gray-800 transition-colors font-medium"
                >
                  로그인
                </Link>
                <span className="text-gray-400">|</span>
                <Link
                  href="/signup"
                  className="hover:text-gray-800 transition-colors font-medium"
                >
                  회원가입
                </Link>
              </div>
            )}
            
            {/* 아이콘 메뉴 */}
            <div className="flex items-center space-x-6">
              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100">
                <MapPin className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100">
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};