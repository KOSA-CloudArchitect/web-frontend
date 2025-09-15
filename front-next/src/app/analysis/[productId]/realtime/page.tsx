'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, RotateCcw, Wifi, WifiOff, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { RealtimeEmotionCards } from '../../../../components/RealtimeEmotionCards';
import { RealtimeAnalysisChart } from '../../../../components/RealtimeAnalysisChart';
import { RealtimeProgressIndicator } from '../../../../components/RealtimeProgressIndicator';
import { useRealtimeAnalysis } from '../../../../hooks/useRealtimeAnalysis';
import { FinalSummaryView } from '../../../../components/FinalSummaryView';
import NavBar from '../../../../components/NavBar';
import BottomBar from '../../../../components/BottomBar';
import Link from 'next/link';
import { apiService } from '../../../../services/api';

export default function RealtimeAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.productId as string;
  
  const [showCompletionToast, setShowCompletionToast] = useState(false);
  const [startingAnalysis, setStartingAnalysis] = useState(false);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  
  const { 
    connection,
    progress,
    emotionCards,
    chartData,
    finalSummary,
    error,
    start,
    stop,
    reconnect
  } = useRealtimeAnalysis({
    productId,
    autoConnect: true
  });

  // 분석 시작 함수
  const handleStartAnalysis = async () => {
    if (startingAnalysis) return;

    try {
      setStartingAnalysis(true);
      
      // job_id 생성 (현재 시간 기반)
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      // 분석 요청 API 호출
      const response = await apiService.post('/api/analyze', {
        product_id: productId,
        url: `https://example.com/product/${productId}`, // 실제 상품 URL로 변경 필요
        job_id: jobId,
        review_cnt: 0, // 초기값
        source: 'realtime_page'
      });

      if (response.success) {
        console.log(`✅ 분석 요청 성공 (job_id: ${jobId}), WebSocket 연결 시작`);
        start(); // WebSocket 연결 시작
      } else {
        throw new Error(response.message || '분석 요청에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('❌ 분석 시작 실패:', error);
    } finally {
      setStartingAnalysis(false);
    }
  };

  // 분석 중지
  const handleStopAnalysis = () => {
    stop();
    setShowFinalSummary(false);
  };

  // 초기화
  const handleReset = () => {
    stop();
    setShowCompletionToast(false);
    setShowFinalSummary(false);
  };

  // 최종 분석 결과 도착 시 처리
  useEffect(() => {
    if (finalSummary && !showFinalSummary) {
      setShowFinalSummary(true);
      setShowCompletionToast(true);
    }
  }, [finalSummary, showFinalSummary]);

  const isConnected = connection === 'open';
  const isConnecting = connection === 'connecting';
  const hasError = connection === 'error' || !!error;

  if (!productId) {
    return (
      <>
        <NavBar title="분석" />
        <div className="min-h-screen bg-gray-50 p-6 pt-20 pb-24 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">상품 정보를 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-4">올바른 상품 ID가 필요합니다.</p>
            <Link 
              href="/search" 
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              검색으로 돌아가기
            </Link>
          </div>
        </div>
        <BottomBar />
      </>
    );
  }

  return (
    <>
      <NavBar title="실시간 분석" />
      <div className="min-h-screen bg-gray-50 p-4 pt-20 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Link 
                href={`/result?id=${productId}`}
                className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                실시간 리뷰 분석
              </h1>
            </div>
            <p className="text-gray-600 text-sm">
              상품 ID: {productId} | 실시간으로 리뷰를 분석하고 감정 카드를 생성합니다.
            </p>
          </div>

          {/* 에러 표시 */}
          {hasError && (
            <motion.div 
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium text-sm">
                  {error || '연결에 오류가 발생했습니다.'}
                </span>
                <button
                  onClick={reconnect}
                  className="ml-auto text-red-600 hover:text-red-800 underline text-sm"
                >
                  재연결
                </button>
              </div>
            </motion.div>
          )}

          {/* 최종 분석 완료 알림 */}
          <AnimatePresence>
            {showFinalSummary && finalSummary && (
              <motion.div
                className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    최종 분석이 완료되었습니다! 아래에서 결과를 확인하세요.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 컨트롤 패널 */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">분석 컨트롤</h2>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={handleStartAnalysis}
                disabled={startingAnalysis || isConnected}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  startingAnalysis || isConnected
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                <Play className="w-4 h-4" />
                {startingAnalysis ? '분석 요청 중...' : '분석 시작'}
              </button>

              <button
                onClick={handleStopAnalysis}
                disabled={!isConnected && !isConnecting}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  !isConnected && !isConnecting
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                <Square className="w-4 h-4" />
                분석 중지
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-500 text-white hover:bg-gray-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                초기화
              </button>
            </div>

            {/* 상태 표시 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">WebSocket</div>
                <div className={`flex items-center gap-2 font-semibold text-sm ${
                  isConnected ? 'text-green-600' : 
                  isConnecting ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {isConnected ? <Wifi className="w-4 h-4" /> : 
                   isConnecting ? <Wifi className="w-4 h-4 animate-pulse" /> :
                   <WifiOff className="w-4 h-4" />}
                  {isConnected ? '연결됨' : 
                   isConnecting ? '연결 중...' : '연결 끊김'}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">분석 진행률</div>
                <div className={`font-semibold text-sm ${progress >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                  {progress >= 100 ? '완료' : `${Math.round(progress)}%`}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">감정 카드</div>
                <div className="font-semibold text-sm text-purple-600">
                  {emotionCards.length}개 수신
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">최종 분석</div>
                <div className={`font-semibold text-sm ${finalSummary ? 'text-green-600' : 'text-gray-600'}`}>
                  {finalSummary ? '완료' : '대기 중'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* 최종 분석 결과 (우선 표시) */}
          <AnimatePresence>
            {showFinalSummary && finalSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <FinalSummaryView summary={finalSummary} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 실시간 스트림 영역 */}
          {!showFinalSummary && (
            <>
              {/* 진행률 표시 */}
              {(isConnected || isConnecting) && (
                <motion.div 
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <RealtimeProgressIndicator />
                </motion.div>
              )}

              {/* 실시간 UI 카드들 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <RealtimeAnalysisChart />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <RealtimeEmotionCards />
                </motion.div>
              </div>
            </>
          )}

          {/* 완료 토스트 */}
          {showCompletionToast && (
            <motion.div
              className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>상품 {productId}의 리뷰 분석이 완료되었습니다!</span>
                <button
                  onClick={() => setShowCompletionToast(false)}
                  className="ml-2 text-green-200 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <BottomBar />
    </>
  );
}