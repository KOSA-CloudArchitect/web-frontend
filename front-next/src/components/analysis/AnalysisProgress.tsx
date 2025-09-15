import React from 'react';
import { CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';
import { LoadingSpinner } from '../LoadingSpinner';

interface AnalysisStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  estimatedTime?: number;
}

interface AnalysisProgressProps {
  steps: AnalysisStep[];
  currentStep?: string;
  overallProgress: number;
  estimatedTimeRemaining?: number;
  message?: string;
  className?: string;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  steps,
  currentStep,
  overallProgress,
  estimatedTimeRemaining,
  message,
  className = ''
}) => {
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}초`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}분 ${remainingSeconds}초` : `${minutes}분`;
  };

  const getStepIcon = (step: AnalysisStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <LoadingSpinner size="sm" className="text-blue-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepStatusColor = (step: AnalysisStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            리뷰 분석 진행 상황
          </h3>
          <span className="text-sm font-medium text-blue-600">
            {Math.round(overallProgress)}%
          </span>
        </div>
        
        {/* 전체 진행률 바 */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        
        {/* 현재 메시지 및 예상 시간 */}
        <div className="flex items-center justify-between mt-3 text-sm">
          <span className="text-gray-600">
            {message || '분석을 진행하고 있습니다...'}
          </span>
          {estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
            <span className="text-gray-500">
              약 {formatTime(estimatedTimeRemaining)} 남음
            </span>
          )}
        </div>
      </div>

      {/* 단계별 진행 상황 */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`border rounded-lg p-4 transition-all duration-200 ${getStepStatusColor(step)}`}
          >
            <div className="flex items-start space-x-3">
              {/* 단계 아이콘 */}
              <div className="flex-shrink-0 mt-0.5">
                {getStepIcon(step)}
              </div>
              
              {/* 단계 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium">
                    {index + 1}. {step.name}
                  </h4>
                  {step.status === 'processing' && step.progress !== undefined && (
                    <span className="text-xs font-medium">
                      {Math.round(step.progress)}%
                    </span>
                  )}
                </div>
                
                <p className="text-xs opacity-90 mb-2">
                  {step.description}
                </p>
                
                {/* 단계별 진행률 바 */}
                {step.status === 'processing' && step.progress !== undefined && (
                  <div className="w-full bg-white bg-opacity-50 rounded-full h-1.5">
                    <div
                      className="bg-current h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                )}
                
                {/* 예상 시간 */}
                {step.status === 'processing' && step.estimatedTime && (
                  <div className="flex items-center mt-2 text-xs opacity-75">
                    <Loader className="w-3 h-3 mr-1 animate-spin" />
                    예상 소요 시간: {formatTime(step.estimatedTime)}
                  </div>
                )}
                
                {/* 에러 메시지 */}
                {step.status === 'error' && (
                  <div className="mt-2 text-xs">
                    <p className="font-medium">오류가 발생했습니다</p>
                    <p className="opacity-75">잠시 후 다시 시도해주세요</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 정보 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {steps.filter(s => s.status === 'completed').length} / {steps.length} 단계 완료
          </span>
          <span>
            실시간으로 업데이트됩니다
          </span>
        </div>
      </div>
    </div>
  );
};