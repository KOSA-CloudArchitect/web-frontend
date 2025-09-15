import React from 'react';
import { motion } from 'framer-motion';
import { useProgress, useCurrentStage, useConnectionStatus, useRealtimeError } from '../stores/realtimeAnalysisStore';
import { Wifi, WifiOff, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const RealtimeProgressIndicator: React.FC = () => {
  const progress = useProgress();
  const stage = useCurrentStage();
  const isConnected = useConnectionStatus();
  const error = useRealtimeError();

  const getStageIcon = () => {
    if (error) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    
    if (progress >= 100) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    
    return <Clock className="w-5 h-5 text-blue-500" />;
  };

  const getStageColor = () => {
    if (error) return 'text-red-600';
    if (progress >= 100) return 'text-green-600';
    return 'text-blue-600';
  };

  const getProgressBarColor = () => {
    if (error) return 'bg-red-500';
    if (progress >= 100) return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">분석 진행 상황</h3>
        
        {/* 연결 상태 표시 */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">연결됨</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600">연결 끊김</span>
            </>
          )}
        </div>
      </div>

      {/* 현재 단계 표시 */}
      <div className="flex items-center gap-3 mb-4">
        {getStageIcon()}
        <div>
          <div className={`font-medium ${getStageColor()}`}>
            {stage}
          </div>
          {error && (
            <div className="text-sm text-red-500 mt-1">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">진행률</span>
          <span className="text-sm font-medium text-gray-700">{progress}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${getProgressBarColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* 단계별 상태 표시 */}
      <div className="space-y-2">
        {[
          { name: '리뷰 수집 중', threshold: 0 },
          { name: '데이터 전처리', threshold: 25 },
          { name: '감성 분석 중', threshold: 50 },
          { name: '결과 생성', threshold: 75 },
          { name: '완료', threshold: 100 },
        ].map((step, index) => {
          const isActive = progress >= step.threshold;
          const isCurrent = progress >= step.threshold && progress < (index < 4 ? [25, 50, 75, 100][index] : 100);
          
          return (
            <div key={step.name} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                isActive 
                  ? (progress >= 100 ? 'bg-green-500' : 'bg-blue-500')
                  : 'bg-gray-300'
              }`} />
              <span className={`text-sm transition-colors duration-300 ${
                isCurrent 
                  ? 'text-blue-600 font-medium'
                  : isActive 
                    ? 'text-gray-700'
                    : 'text-gray-400'
              }`}>
                {step.name}
              </span>
              {isCurrent && (
                <motion.div
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 재연결 버튼 (연결이 끊어진 경우) */}
      {!isConnected && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            페이지 새로고침
          </button>
        </div>
      )}
    </div>
  );
};