import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsAuthenticated } from '../stores/authStore';
import { Layout } from '../components/layout/Layout';
import { SignupForm } from '../components/auth/SignupForm';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();

  // 로그인된 사용자는 메인 페이지로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSignupSuccess = () => {
    // 회원가입 성공 시 로그인 페이지로 이동
    navigate('/login', { 
      replace: true,
      state: { message: '회원가입이 완료되었습니다. 로그인해주세요.' }
    });
  };

  if (isAuthenticated) {
    return (
      <Layout showHeader={false} showFooter={false}>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">리다이렉트 중입니다...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={false} showFooter={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <SignupForm onSuccess={handleSignupSuccess} />
      </div>
    </Layout>
  );
};

export default SignupPage;