import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuthLogin, useAuthClearError, useAuthLoading, useAuthError } from '../../stores/authStore';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage';

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  className = '' 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isLoading = useAuthLoading();
  const error = useAuthError();
  const login = useAuthLogin();
  const clearError = useAuthClearError();

  // 에러 초기화
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      errors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));

    // 입력 시 해당 필드의 에러 초기화
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // 전역 에러 초기화
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      onSuccess?.();
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-white p-8 rounded-lg shadow-md">
        {/* 로고 */}
        <div className="flex flex-col items-center mb-8">
          <span className="text-4xl font-extrabold text-blue-600 tracking-widest">
            KOSA
          </span>
          <p className="text-gray-600 mt-2 text-center">
            리뷰 분석 서비스에 로그인하세요
          </p>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
          로그인
        </h2>

        {/* 전역 에러 메시지 */}
        {error && (
          <ErrorMessage 
            message={error} 
            onClose={clearError}
            className="mb-4"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이메일 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationErrors.email 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="이메일을 입력하세요"
                disabled={isLoading}
                autoFocus
              />
            </div>
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange('password')}
                className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationErrors.password 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="비밀번호를 입력하세요"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.password}
              </p>
            )}
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </button>
        </form>

        {/* 하단 링크 */}
        <div className="mt-6 flex flex-col space-y-3">
          <div className="flex justify-between items-center text-sm">
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              회원가입
            </Link>
            <button
              type="button"
              className="text-gray-600 hover:text-gray-700 hover:underline transition-colors"
              onClick={() => alert('비밀번호 찾기 기능은 준비중입니다.')}
            >
              비밀번호 찾기
            </button>
          </div>
          
          <div className="text-center">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-700 hover:underline text-sm transition-colors"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};