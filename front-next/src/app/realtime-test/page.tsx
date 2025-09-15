'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Square, RotateCcw, Zap, AlertTriangle } from 'lucide-react';
import { RealtimeEmotionCards } from '../../components/RealtimeEmotionCards';
import { RealtimeAnalysisChart } from '../../components/RealtimeAnalysisChart';
import { RealtimeProgressIndicator } from '../../components/RealtimeProgressIndicator';
import { useRealtimeSimulation } from '../../hooks/useRealtimeSimulation';
import { useConnectionStatus, useCurrentStage, useProgress, useIsCompleted } from '../../stores/realtimeAnalysisStore';
import { AnalysisSummaryCard } from '../../components/AnalysisSummaryCard';
import { CompletionToast } from '../../components/CompletionToast';

export default function RealtimeTestPage() {
  const [targetReviews, setTargetReviews] = React.useState(15);
  const [showCompletionToast, setShowCompletionToast] = React.useState(false);
  
  const { 
    isRunning, 
    currentCardCount, 
    startSimulation, 
    stopSimulation, 
    simulateError, 
    addSingleCard, 
    reset 
  } = useRealtimeSimulation({
    cardInterval: 1200, // 1.2초마다 카드 생성
    targetReviews: targetReviews
  });

  const isConnected = useConnectionStatus();
  const stage = useCurrentStage();
  const progress = useProgress();
  const isCompleted = useIsCompleted();

  // 분석 완료 시 토스트 표시 (한 번만)
  const prevIsCompleted = React.useRef(false);
  React.useEffect(() => {
    if (isCompleted && !prevIsCompleted.current && !showCompletionToast) {
      setShowCompletionToast(true);
      prevIsCompleted.current = true;
    }
    if (!isCompleted) {
      prevIsCompleted.current = false;
    }
  }, [isCompleted, showCompletionToast]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            실시간 UI 카드 테스트
          </h1>
          <p className="text-gray-600">
            데이터 분석 서버 없이 실시간 감정 분석 UI를 테스트해보세요.
          </p>
        </div>

        {/* 컨트롤 패널 */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">테스트 컨트롤</h2>
          
          {/* 리뷰 수 설정 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              목표 리뷰 수: {targetReviews}개
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={targetReviews}
              onChange={(e) => setTargetReviews(Number(e.target.value))}
              disabled={isRunning}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5개</span>
              <span>50개</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={startSimulation}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isRunning 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              <Play className="w-4 h-4" />
              시뮬레이션 시작
            </button>

            <button
              onClick={stopSimulation}
              disabled={!isRunning}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                !isRunning 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              <Square className="w-4 h-4" />
              시뮬레이션 중지
            </button>

            <button
              onClick={() => {
                reset();
                setShowCompletionToast(false);
                prevIsCompleted.current = false;
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-500 text-white hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              초기화
            </button>

            <button
              onClick={addSingleCard}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <Zap className="w-4 h-4" />
              카드 1개 추가
            </button>

            <button
              onClick={() => simulateError('테스트 에러: 연결이 끊어졌습니다.')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              에러 시뮬레이션
            </button>
          </div>

          {/* 상태 표시 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">연결 상태</div>
              <div className={`font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? '연결됨' : '연결 끊김'}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">현재 단계</div>
              <div className="font-semibold text-gray-800">{stage}</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">진행률</div>
              <div className={`font-semibold ${progress >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                {progress >= 100 ? '완료' : `${Math.round(progress)}%`}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">수집된 리뷰</div>
              <div className="font-semibold text-purple-600">
                {currentCardCount} / {targetReviews}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 진행률 표시 */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <RealtimeProgressIndicator />
        </motion.div>

        {/* 분석 완료 시 요약 카드 */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8"
          >
            <AnalysisSummaryCard />
          </motion.div>
        )}

        {/* 실시간 UI 카드들 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

        {/* 완료 토스트 */}
        <CompletionToast
          show={showCompletionToast}
          onClose={() => setShowCompletionToast(false)}
          message={`${targetReviews}개의 리뷰 분석이 완료되었습니다!`}
        />
      </div>
    </div>
  );
}