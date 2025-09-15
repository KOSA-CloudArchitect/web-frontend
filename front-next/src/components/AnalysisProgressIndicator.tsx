import React from 'react';
import { InterestAnalysisStatus } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface AnalysisProgressIndicatorProps {
  status: InterestAnalysisStatus;
  className?: string;
}

export const AnalysisProgressIndicator: React.FC<AnalysisProgressIndicatorProps> = ({
  status,
  className = ''
}) => {
  const getStatusColor = () => {
    switch (status.status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'pending':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'processing':
        return <LoadingSpinner size="sm" />;
      case 'completed':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'pending':
        return '분석 대기 중';
      case 'processing':
        return status.currentStep || '분석 진행 중';
      case 'completed':
        return '분석 완료';
      case 'failed':
        return '분석 실패';
      default:
        return '알 수 없는 상태';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()} ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{getStatusText()}</h3>
            {status.status === 'processing' && (
              <span className="text-sm font-medium">
                {status.progress}%
              </span>
            )}
          </div>
          
          {status.status === 'processing' && (
            <div className="mt-2">
              <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                <div 
                  className="bg-current h-2 rounded-full transition-all duration-300"
                  style={{ width: `${status.progress}%` }}
                />
              </div>
              {status.estimatedTime && (
                <p className="text-sm mt-1 opacity-75">
                  예상 완료 시간: 약 {Math.ceil(status.estimatedTime / 60)}분
                </p>
              )}
            </div>
          )}
          
          {status.status === 'failed' && status.error && (
            <p className="text-sm mt-1 opacity-75">
              오류: {status.error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};