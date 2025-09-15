import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useIsAuthenticated, useAuthCheckStatus, useAuthLoading } from '../stores/authStore';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/login',
}) => {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const checkAuthStatus = useAuthCheckStatus();
  const location = useLocation();

  useEffect(() => {
    // 컴포넌트 마운트 시 인증 상태 확인
    if (!isAuthenticated && !isLoading) {
      checkAuthStatus();
    }
  }, [isAuthenticated, isLoading, checkAuthStatus]);

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // TODO: 역할 기반 접근 제어 구현
  // if (requiredRole && user?.role !== requiredRole) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return <>{children}</>;
};

// 관리자 전용 라우트
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="admin" redirectTo="/unauthorized">
      {children}
    </ProtectedRoute>
  );
};

// 인증된 사용자만 접근 가능한 라우트
export const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ProtectedRoute>{children}</ProtectedRoute>;
};