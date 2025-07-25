// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import MainPage from "./pages/mainpage";
import LoginPage from "./pages/LoginPage";  
import SignupPage from "./pages/SignupPage";
import ResultPage from "./pages/ResultPage";
import AdminPage from "./pages/AdminPage";
import SearchListPage from "./pages/SearchListPage";
import AnalysisPage from "./pages/AnalysisPage";
import { AnalysisResultPage } from "./pages/AnalysisResultPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { setupGlobalErrorHandler } from "./utils/errorUtils";

export default function App(): JSX.Element {
  useEffect(() => {
    // 전역 에러 핸들러 설정
    setupGlobalErrorHandler();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/result/:id" element={<ResultPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/search" element={<SearchListPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/analysis-result/:productId" element={<AnalysisResultPage />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}