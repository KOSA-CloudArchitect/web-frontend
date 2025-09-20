'use client';

import React, { useState, useEffect } from 'react';
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

  const [currentSection, setCurrentSection] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrollY(scrollPosition);
      
      // 섹션 감지
      const sections = document.querySelectorAll('section[data-section]');
      let current = 0;
      
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          current = index;
        }
      });
      
      setCurrentSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기값 설정
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 섹션별 스타일 정의
  const getHeaderStyle = () => {
    const isHeroSection = currentSection === 0;
    
    return {
      backgroundColor: isHeroSection ? 'transparent' : '#ffffff',
      backdropFilter: isHeroSection ? 'none' : 'none',
      borderBottom: isHeroSection ? 'none' : '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: isHeroSection ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    };
  };

  const headerStyle = getHeaderStyle();

  const isHeroSection = currentSection === 0;
  const textColor = isHeroSection ? 'text-white' : 'text-gray-900';
  const hoverTextColor = isHeroSection ? 'hover:text-gray-200' : 'hover:text-gray-700';

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${className}`}
      style={headerStyle}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className={`text-3xl font-bold ${textColor} ${hoverTextColor} transition-colors`}
            >
              KOSA
            </Link>
          </div>

          {/* 오른쪽 메뉴 */}
          <div className="flex items-center space-x-8">
            {/* 로그인/회원가입 또는 사용자 정보 */}
            {isAuthenticated ? (
              <div className={`flex items-center space-x-3 text-sm ${textColor}`}>
                <span className="font-medium">{user?.email || '사용자'}</span>
                <span className={isHeroSection ? 'text-gray-300' : 'text-gray-400'}>|</span>
                <button
                  onClick={handleLogout}
                  className={`${hoverTextColor} transition-colors font-medium`}
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className={`flex items-center space-x-3 text-sm ${textColor}`}>
                <Link
                  href="/login"
                  className={`${hoverTextColor} transition-colors font-medium`}
                >
                  로그인
                </Link>
                <span className={isHeroSection ? 'text-gray-300' : 'text-gray-400'}>|</span>
                <Link
                  href="/signup"
                  className={`${hoverTextColor} transition-colors font-medium`}
                >
                  회원가입
                </Link>
              </div>
            )}
            
            {/* 아이콘 메뉴 */}
            <div className="flex items-center space-x-6">
              <button className={`p-2 ${isHeroSection ? 'text-white hover:text-gray-200 hover:bg-white/10' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} transition-colors rounded-full`}>
                <MapPin className="w-5 h-5" />
              </button>
              <button className={`p-2 ${isHeroSection ? 'text-white hover:text-gray-200 hover:bg-white/10' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} transition-colors rounded-full`}>
                <Heart className="w-5 h-5" />
              </button>
              <button className={`p-2 ${isHeroSection ? 'text-white hover:text-gray-200 hover:bg-white/10' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} transition-colors rounded-full`}>
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};