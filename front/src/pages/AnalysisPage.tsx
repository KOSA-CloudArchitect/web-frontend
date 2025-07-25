import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar";
import BottomBar from "../components/BottomBar";
import { 
  AnalysisStatus, 
  WebSocketAnalysisEvent,
} from "../types";
import { apiService, ApiError } from "../services/api";
import { webSocketService } from "../services/websocket";

export default function AnalysisPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState<number>(0);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const isDummy = new URLSearchParams(location.search).get("dummy") === "true";
  const productIdRef = useRef<string>(
    isDummy
      ? (Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000)).toString()
      : new URLSearchParams(location.search).get("productId") || ""
  );
  const productId = productIdRef.current;

  // 분석 상태 확인 및 요청 함수
  const checkAndStartAnalysis = useCallback(async (): Promise<void> => {
    try {
      if (isDummy) {
        // 더미 분석인 경우 바로 분석 요청
        await apiService.requestDummyAnalysis(productId);
        return;
      }

      try {
        // 기존 분석 상태 확인
        const statusData = await apiService.getAnalysisStatus(productId);
        
        if (statusData.status === "completed") {
          navigate(`/result/${productId}`);
        } else if (statusData.status === "failed") {
          setError(statusData.error || "분석에 실패했습니다.");
        } else {
          // 진행 중 상태
          setProgress(statusData.progress || 0);
          setEstimatedTime(statusData.estimatedTime || null);
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          // 분석 정보가 없는 경우 → 분석 요청
          await apiService.requestAnalysis({ productId });
        } else {
          throw err;
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [productId, navigate, isDummy]);

  // 소켓 연결 및 분석 시작
  useEffect(() => {
    if (!productId) {
      navigate("/");
      return;
    }

    // WebSocket 구독
    const unsubscribe = webSocketService.subscribeToAnalysis(productId, (data: WebSocketAnalysisEvent) => {
      if (data.status === "completed") {
        navigate(`/result/${productId}`);
      } else if (data.status === "failed") {
        setError(data.error || "분석에 실패했습니다.");
      } else if (data.status === "processing") {
        setProgress(data.progress || 0);
        setEstimatedTime(data.progress ? Math.round((100 - data.progress) * 2) : null);
      }
    });

    // 분석 시작
    checkAndStartAnalysis();

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [productId, checkAndStartAnalysis, navigate]);

  // 로딩 상태 처리
  if (loading) {
    return (
      <>
        <NavBar title="KOSA" />
        <div className="max-w-2xl mx-auto p-4 bg-gray-100 min-h-screen pt-16 pb-24 flex flex-col items-center justify-center">
          <div className="text-lg text-gray-700">분석을 준비 중입니다...</div>
        </div>
        <BottomBar />
      </>
    );
  }

  // 에러 화면 처리
  if (error) {
    return (
      <>
        <NavBar title="KOSA" />
        <div className="max-w-2xl mx-auto p-4 bg-gray-100 min-h-screen pt-16 pb-24 flex flex-col items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">오류가 발생했습니다</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              이전 페이지로 돌아가기
            </button>
          </div>
        </div>
        <BottomBar />
      </>
    );
  }

  // 정상 분석 진행 화면
  return (
    <>
      <NavBar title="KOSA" />
      <div className="max-w-2xl mx-auto p-4 bg-gray-100 min-h-screen pt-16 pb-24 flex flex-col items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">리뷰 분석 중입니다</h2>
          <p className="text-gray-600 mb-6">
            잠시만 기다려주세요...
            {estimatedTime && (
              <>
                <br />
                예상 소요 시간: 약 {estimatedTime}초
              </>
            )}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">진행률: {progress}%</p>
        </div>
      </div>
      <BottomBar />
    </>
  );
}