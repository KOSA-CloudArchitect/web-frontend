// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";  
import SignupPage from "./pages/SignupPage";
import ResultPage from "./pages/ResultPage";
import AdminPage from "./pages/AdminPage";
import SearchListPage from "./pages/SearchListPage";
import AnalysisPage from "./pages/AnalysisPage";
import { AnalysisResultPage } from "./pages/AnalysisResultPage";
import { InterestPage } from "./pages/InterestPage";
import { ComparePage } from "./pages/ComparePage";
import { InterestAnalysisPage } from "./pages/InterestAnalysisPage";
import { NotificationSettingsPage } from "./pages/NotificationSettingsPage";
import RealtimeTestPage from "./pages/RealtimeTestPage";
import ProductListPage from "./pages/ProductListPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import { useAuthCheckStatus } from "./stores/authStore";
import { setupGlobalErrorHandler } from "./utils/errorUtils";
import "./utils/realtimeTestUtils"; // 개발용 테스트 유틸리티

export default function App(): JSX.Element {
  const checkAuthStatus = useAuthCheckStatus();

  useEffect(() => {
    // 전역 에러 핸들러 설정
    setupGlobalErrorHandler();
    
    // 앱 시작 시 인증 상태 확인
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* 보호된 라우트 (로그인 필요) */}
          <Route 
            path="/result/:id" 
            element={
              <ProtectedRoute>
                <ResultPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/search" 
            element={<SearchListPage />}
          />
          {/* 임시: 모든 경로에서 SearchListPage 테스트 */}
          <Route 
            path="/test-search" 
            element={<SearchListPage />}
          />
          <Route 
            path="/analysis" 
            element={
              <ProtectedRoute>
                <AnalysisPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analysis/:productId" 
            element={
              <ProtectedRoute>
                <AnalysisPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analysis-result/:productId" 
            element={
              <ProtectedRoute>
                <AnalysisResultPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/interests" 
            element={
              <ProtectedRoute>
                <InterestPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/compare" 
            element={
              <ProtectedRoute>
                <ComparePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/interests/:id/analysis" 
            element={
              <ProtectedRoute>
                <InterestAnalysisPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings/notifications" 
            element={
              <ProtectedRoute>
                <NotificationSettingsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* 테스트 페이지 (개발용) */}
          <Route 
            path="/test/realtime" 
            element={<RealtimeTestPage />} 
          />
          <Route 
            path="/products" 
            element={<ProductListPage />} 
          />
          
          {/* 관리자 전용 라우트 */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            } 
          />
          
          {/* 404 페이지 */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-gray-600 mb-4">페이지를 찾을 수 없습니다.</p>
                  <a href="/" className="text-blue-600 hover:underline">
                    홈으로 돌아가기
                  </a>
                </div>
              </div>
            } 
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}