import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Check, X } from 'lucide-react';
import { useAuthRegister, useAuthClearError, useAuthLoading, useAuthError } from '../../stores/authStore';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage';

interface SignupFormProps {
  onSuccess?: () => void;
  className?: string;
}

interface PasswordValidation {
  minLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export const SignupForm: React.FC<SignupFormProps> = ({ 
  onSuccess, 
  className = '' 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const isLoading = useAuthLoading();
  const error = useAuthError();
  const register = useAuthRegister();
  const clearError = useAuthClearError();

  // 에러 초기화
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // 비밀번호 검증
  useEffect(() => {
    setPasswordValidation({
      minLength: formData.password.length >= 8,
      hasLowercase: /[a-z]/.test(formData.password),
      hasUppercase: /[A-Z]/.test(formData.password),
      hasNumber: /\d/.test(formData.password),
      hasSpecialChar: /[@$!%*?&]/.test(formData.password),
    });
  }, [formData.password]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 이메일 검증
    if (!formData.email) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    // 비밀번호 검증
    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
    } else {
      const isPasswordValid = Object.values(passwordValidation).every(Boolean);
      if (!isPasswordValid) {
        errors.password = '비밀번호 요구사항을 모두 충족해주세요.';
      }
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      errors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
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
      await register(formData.email, formData.password, formData.confirmPassword);
      onSuccess?.();
    } catch (error) {
      console.error('회원가입 실패:', error);
    }
  };

  const getValidationIcon = (isValid: boolean) => {
    return isValid ? (
      <Check className="w-4 h-4 text-green-600" />
    ) : (
      <X className="w-4 h-4 text-red-600" />
    );
  };

  const getValidationTextColor = (isValid: boolean) => {
    return isValid ? 'text-green-600' : 'text-red-600';
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
            리뷰 분석 서비스에 가입하세요
          </p>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
          회원가입
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

            {/* 비밀번호 강도 표시 */}
            {formData.password && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  비밀번호 요구사항:
                </p>
                <div className="grid grid-cols-1 gap-1 text-sm">
                  <div className={`flex items-center ${getValidationTextColor(passwordValidation.minLength)}`}>
                    {getValidationIcon(passwordValidation.minLength)}
                    <span className="ml-2">8자 이상</span>
                  </div>
                  <div className={`flex items-center ${getValidationTextColor(passwordValidation.hasLowercase)}`}>
                    {getValidationIcon(passwordValidation.hasLowercase)}
                    <span className="ml-2">소문자 포함</span>
                  </div>
                  <div className={`flex items-center ${getValidationTextColor(passwordValidation.hasUppercase)}`}>
                    {getValidationIcon(passwordValidation.hasUppercase)}
                    <span className="ml-2">대문자 포함</span>
                  </div>
                  <div className={`flex items-center ${getValidationTextColor(passwordValidation.hasNumber)}`}>
                    {getValidationIcon(passwordValidation.hasNumber)}
                    <span className="ml-2">숫자 포함</span>
                  </div>
                  <div className={`flex items-center ${getValidationTextColor(passwordValidation.hasSpecialChar)}`}>
                    {getValidationIcon(passwordValidation.hasSpecialChar)}
                    <span className="ml-2">특수문자 포함 (@$!%*?&)</span>
                  </div>
                </div>
              </div>
            )}

            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.password}
              </p>
            )}
          </div>

          {/* 비밀번호 확인 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 확인
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationErrors.confirmPassword 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="비밀번호를 다시 입력하세요"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                회원가입 중...
              </>
            ) : (
              '회원가입'
            )}
          </button>
        </form>

        {/* 하단 링크 */}
        <div className="mt-6 flex flex-col space-y-3">
          <div className="text-center">
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              이미 계정이 있으신가요? 로그인
            </Link>
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