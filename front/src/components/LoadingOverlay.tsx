import React from 'react';
import { Loader2, Clock, TrendingUp } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
  estimatedTime?: number;
  stage?: 'fetching' | 'analyzing' | 'processing' | 'finalizing';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = '분석 중입니다...',
  progress,
  estimatedTime,
  stage = 'analyzing',
}) => {
  if (!isVisible) return null;

  const getStageInfo = () => {
    switch (stage) {
      case 'fetching':
        return {
          icon: <Loader2 className="w-8 h-8 animate-spin text-blue-500" />,
          title: '리뷰 데이터 수집 중',
          description: '상품 리뷰를 가져오고 있습니다...',
        };
      case 'analyzing':
        return {
          icon: <TrendingUp className="w-8 h-8 text-green-500" />,
          title: '감성 분석 진행 중',
          description: 'AI가 리뷰를 분석하고 있습니다...',
        };
      case 'processing':
        return {
          icon: <Loader2 className="w-8 h-8 animate-spin text-purple-500" />,
          title: '데이터 처리 중',
          description: '분석 결과를 정리하고 있습니다...',
        };
      case 'finalizing':
        return {
          icon: <Loader2 className="w-8 h-8 animate-spin text-orange-500" />,
          title: '결과 준비 중',
          description: '시각화 데이터를 준비하고 있습니다...',
        };
      default:
        return {
          icon: <Loader2 className="w-8 h-8 animate-spin text-blue-500" />,
          title: '분석 중',
          description: message,
        };
    }
  };

  const stageInfo = getStageInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* 아이콘 */}
          <div className="flex justify-center mb-4">
            {stageInfo.icon}
          </div>

          {/* 제목 */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {stageInfo.title}
          </h2>

          {/* 설명 */}
          <p className="text-gray-600 mb-6">
            {stageInfo.description}
          </p>

          {/* 진행률 바 */}
          {progress !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>진행률</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* 예상 시간 */}
          {estimatedTime && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>예상 소요 시간: 약 {estimatedTime}초</span>
            </div>
          )}

          {/* 팁 메시지 */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 분석 중에는 페이지를 새로고침하지 마세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};