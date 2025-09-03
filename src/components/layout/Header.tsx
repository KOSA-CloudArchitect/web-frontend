import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useIsAuthenticated, useAuthUser, useAuthLogout } from '../../stores/authStore';
import { Search, User, LogOut, Settings } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthUser();
  const logout = useAuthLogout();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              KOSA
            </Link>
          </div>

          {/* 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/search" 
              className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              상품 검색
            </Link>
            {isAuthenticated && (
              <Link 
                to="/analysis" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                분석 요청
              </Link>
            )}
          </nav>

          {/* 사용자 메뉴 */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-gray-700">
                  <User className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">
                    {user?.email || '사용자'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate('/settings')}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    title="설정"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="로그아웃"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 모바일 네비게이션 */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-4 py-3 space-y-2">
          <Link 
            to="/search" 
            className="flex items-center text-gray-700 hover:text-blue-600 transition-colors py-2"
          >
            <Search className="w-4 h-4 mr-3" />
            상품 검색
          </Link>
          {isAuthenticated && (
            <Link 
              to="/analysis" 
              className="block text-gray-700 hover:text-blue-600 transition-colors py-2 pl-7"
            >
              분석 요청
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};