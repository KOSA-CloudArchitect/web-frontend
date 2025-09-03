import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsAuthenticated, useAuthActions, useAuthLoading, useAuthError } from "../stores/authStore";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const error = useAuthError();
  const { login, clearError } = useAuthActions();

  // 로그인된 사용자는 메인 페이지로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // 에러 초기화
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력하세요.");
      return;
    }

    try {
      await login(email, password);
      // 로그인 성공 시 useEffect에서 리다이렉트 처리
    } catch (error) {
      // 에러는 store에서 관리되므로 여기서는 별도 처리 불필요
      console.error("로그인 실패:", error);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) clearError(); // 입력 시 에러 초기화
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) clearError(); // 입력 시 에러 초기화
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
          <div className="flex flex-col items-center mb-8">
            <span className="text-4xl font-extrabold text-blue-600 tracking-widest">KOSA</span>
          </div>
          <h2 className="text-2xl font-bold mb-6">이미 로그인중입니다.</h2>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <span className="text-4xl font-extrabold text-blue-600 tracking-widest">KOSA</span>
        </div>
        
        <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>
        
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
            onChange={handleEmailChange}
            placeholder="이메일을 입력하세요"
            autoFocus
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block mb-1 text-gray-700">비밀번호</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200 focus:border-blue-500"
              value={password}
              onChange={handlePasswordChange}
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
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              로그인 중...
            </>
          ) : (
            "로그인"
          )}
        </button>
        
        <div className="flex justify-between mt-4">
          <button
            type="button"
            className="text-blue-600 hover:underline disabled:opacity-50"
            onClick={() => navigate('/signup')}
            disabled={isLoading}
          >
            회원가입
          </button>
          <button
            type="button"
            className="text-gray-600 hover:underline disabled:opacity-50"
            onClick={() => alert('비밀번호 찾기 기능은 준비중입니다.')}
            disabled={isLoading}
          >
            비밀번호 찾기
          </button>
        </div>
      </form>
    </div>
  );
} 