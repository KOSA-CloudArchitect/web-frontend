import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAuthenticated, useAuthActions, useAuthLoading, useAuthError } from "../stores/authStore";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  
  const navigate = useNavigate();
  
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const error = useAuthError();
  const { register, clearError } = useAuthActions();

  // 로그인된 사용자는 메인 페이지로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 에러 초기화
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // 비밀번호 검증
  useEffect(() => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[@$!%*?&]/.test(password),
    });
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      alert("모든 항목을 입력하세요.");
      return;
    }
    
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 비밀번호 강도 검증
    const isPasswordValid = Object.values(passwordValidation).every(Boolean);
    if (!isPasswordValid) {
      alert("비밀번호는 8자 이상이며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.");
      return;
    }

    try {
      await register(email, password, confirmPassword);
      alert("회원가입이 완료되었습니다! 로그인해주세요.");
      navigate("/login");
    } catch (error) {
      // 에러는 store에서 관리되므로 여기서는 별도 처리 불필요
      console.error("회원가입 실패:", error);
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) clearError(); // 입력 시 에러 초기화
  };

  const getPasswordStrengthColor = (isValid) => {
    return isValid ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <span className="text-4xl font-extrabold text-blue-600 tracking-widest">KOSA</span>
        </div>
        
        <h2 className="text-2xl font-bold mb-6 text-center">회원가입</h2>
        
        {error && (
          <ErrorMessage 
            message={error} 
            onClose={clearError}
            className="mb-4"
          />
        )}
        
        <div className="mb-4">
          <label className="block mb-1 text-gray-700">이메일</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200 focus:border-blue-500"
            value={email}
            onChange={handleInputChange(setEmail)}
            placeholder="이메일을 입력하세요"
            autoFocus
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-1 text-gray-700">비밀번호</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200 focus:border-blue-500"
              value={password}
              onChange={handleInputChange(setPassword)}
              placeholder="비밀번호를 입력하세요"
              disabled={isLoading}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? "숨기기" : "보기"}
            </button>
          </div>
          
          {/* 비밀번호 강도 표시 */}
          {password && (
            <div className="mt-2 text-sm">
              <div className="grid grid-cols-2 gap-1">
                <div className={getPasswordStrengthColor(passwordValidation.minLength)}>
                  ✓ 8자 이상
                </div>
                <div className={getPasswordStrengthColor(passwordValidation.hasLowercase)}>
                  ✓ 소문자 포함
                </div>
                <div className={getPasswordStrengthColor(passwordValidation.hasUppercase)}>
                  ✓ 대문자 포함
                </div>
                <div className={getPasswordStrengthColor(passwordValidation.hasNumber)}>
                  ✓ 숫자 포함
                </div>
                <div className={`col-span-2 ${getPasswordStrengthColor(passwordValidation.hasSpecialChar)}`}>
                  ✓ 특수문자 포함 (@$!%*?&)
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block mb-1 text-gray-700">비밀번호 확인</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200 focus:border-blue-500 ${
                confirmPassword && password !== confirmPassword ? 'border-red-500' : ''
              }`}
              value={confirmPassword}
              onChange={handleInputChange(setConfirmPassword)}
              placeholder="비밀번호를 다시 입력하세요"
              disabled={isLoading}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? "숨기기" : "보기"}
            </button>
          </div>
          
          {confirmPassword && password !== confirmPassword && (
            <p className="mt-1 text-sm text-red-600">비밀번호가 일치하지 않습니다.</p>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              회원가입 중...
            </>
          ) : (
            "회원가입"
          )}
        </button>
        
        <div className="flex justify-center mt-4">
          <button
            type="button"
            className="text-blue-600 hover:underline disabled:opacity-50"
            onClick={() => navigate('/login')}
            disabled={isLoading}
          >
            이미 계정이 있으신가요? 로그인
          </button>
        </div>
      </form>
    </div>
  );
} 