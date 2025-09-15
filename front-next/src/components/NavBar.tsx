'use client';

import { Menu, User, LogOut, Settings, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useIsAuthenticated, useAuthUser, useAuthLogout, useAuthCheckStatus, useAuthLoading } from "../stores/authStore";
import { LoadingSpinner } from "./LoadingSpinner";

interface NavBarProps {
  onMenuClick?: () => void;
  title?: string;
}

export default function NavBar({ onMenuClick, title = "KOSA" }: NavBarProps): JSX.Element {
  const [showAuthPopover, setShowAuthPopover] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthUser();
  const isLoading = useAuthLoading();
  const logout = useAuthLogout();
  const checkAuthStatus = useAuthCheckStatus();

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // 외부 클릭 시 팝오버 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowAuthPopover(false);
      }
    };

    if (showAuthPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAuthPopover]);

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      setShowAuthPopover(false);
      router.push("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      // 로그아웃 실패해도 UI는 업데이트됨 (store에서 처리)
    }
  };

  const handleNavigation = (path: string) => {
    setShowAuthPopover(false);
    router.push(path);
  };

  return (
    <div className="fixed top-0 left-0 w-full flex items-center justify-between p-4 bg-white shadow z-50" style={{height: 56}}>
      <Menu size={28} className="cursor-pointer text-blue-600" onClick={onMenuClick} />
      <span className="text-xl font-bold text-blue-600">{title}</span>
      
      <div className="relative" ref={popoverRef}>
        <button
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => setShowAuthPopover((v) => !v)}
          disabled={isLoading}
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <User size={28} className="text-blue-600" />
          )}
        </button>
        
        {showAuthPopover && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border p-2 z-20">
            {isAuthenticated && user ? (
              <>
                <div className="px-3 py-2 border-b border-gray-100 mb-2">
                  <div className="font-semibold text-gray-800 truncate">{user.email}</div>
                  <div className="text-sm text-gray-500 capitalize">{user.role}</div>
                </div>
                
                <button
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
                  onClick={() => handleNavigation('/interests')}
                >
                  <Heart size={16} className="mr-2" />
                  관심 상품
                </button>
                
                <button
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
                  onClick={() => handleNavigation('/profile')}
                >
                  <Settings size={16} className="mr-2" />
                  프로필 설정
                </button>
                
                {user.role === 'admin' && (
                  <button
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
                    onClick={() => handleNavigation('/admin')}
                  >
                    <Settings size={16} className="mr-2" />
                    관리자 페이지
                  </button>
                )}
                
                <hr className="my-2" />
                
                <button
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-red-50 text-red-600 rounded-md transition-colors"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  <LogOut size={16} className="mr-2" />
                  {isLoading ? "로그아웃 중..." : "로그아웃"}
                </button>
              </>
            ) : (
              <>
                <button
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
                  onClick={() => handleNavigation('/login')}
                >
                  <User size={16} className="mr-2" />
                  로그인
                </button>
                
                <button
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
                  onClick={() => handleNavigation('/signup')}
                >
                  <User size={16} className="mr-2" />
                  회원가입
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}