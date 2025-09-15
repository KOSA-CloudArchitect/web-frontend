import React, { useState } from 'react';
import { Play, Pause, RotateCcw, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '../LoadingSpinner';

interface AnalysisRequestButtonProps {
  productId: string;
  productName: string;
  onAnalysisStart: (productId: string, options: AnalysisOptions) => void;
  isAnalyzing?: boolean;
  canRetry?: boolean;
  onRetry?: () => void;
  className?: string;
}

interface AnalysisOptions {
  includeKeywords: boolean;
  includeSentiment: boolean;
  includeTrends: boolean;
  analysisDepth: 'basic' | 'detailed';
}

export const AnalysisRequestButton: React.FC<AnalysisRequestButtonProps> = ({
  productId,
  productName,
  onAnalysisStart,
  isAnalyzing = false,
  canRetry = false,
  onRetry,
  className = ''
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<AnalysisOptions>({
    includeKeywords: true,
    includeSentiment: true,
    includeTrends: true,
    analysisDepth: 'detailed'
  });

  const handleAnalysisStart = () => {
    if (isAnalyzing) return;
    
    onAnalysisStart(productId, options);
    setShowOptions(false);
  };

  const handleOptionsChange = (key: keyof AnalysisOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getButtonContent = () => {
    if (isAnalyzing) {
      return (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          분석 중...
        </>
      );
    }

    if (canRetry) {
      return (
        <>
          <RotateCcw className="w-4 h-4 mr-2" />
          다시 분석
        </>
      );
    }

    return (
      <>
        <Play className="w-4 h-4 mr-2" />
        리뷰 분석 시작
      </>
    );
  };

  const getButtonColor = () => {
    if (canRetry) {
      return 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500';
    }
    return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 상품 정보 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">분석 대상 상품</h3>
        <p className="text-gray-700 text-sm line-clamp-2">{productName}</p>
      </div>

      {/* 분석 옵션 */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          disabled={isAnalyzing}
        >
          <span>분석 옵션 설정</span>
          <span className={`transform transition-transform ${showOptions ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {showOptions && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
            {/* 분석 항목 선택 */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">분석 항목</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.includeSentiment}
                    onChange={(e) => handleOptionsChange('includeSentiment', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={isAnalyzing}
                  />
                  <span className="ml-2 text-sm text-gray-700">감정 분석</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.includeKeywords}
                    onChange={(e) => handleOptionsChange('includeKeywords', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={isAnalyzing}
                  />
                  <span className="ml-2 text-sm text-gray-700">키워드 추출</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.includeTrends}
                    onChange={(e) => handleOptionsChange('includeTrends', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={isAnalyzing}
                  />
                  <span className="ml-2 text-sm text-gray-700">시간별 추이 분석</span>
                </label>
              </div>
            </div>

            {/* 분석 깊이 선택 */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">분석 깊이</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="analysisDepth"
                    value="basic"
                    checked={options.analysisDepth === 'basic'}
                    onChange={(e) => handleOptionsChange('analysisDepth', e.target.value)}
                    className="border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={isAnalyzing}
                  />
                  <div className="ml-2">
                    <span className="text-sm text-gray-700">기본 분석</span>
                    <p className="text-xs text-gray-500">빠른 분석 (약 1분)</p>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="analysisDepth"
                    value="detailed"
                    checked={options.analysisDepth === 'detailed'}
                    onChange={(e) => handleOptionsChange('analysisDepth', e.target.value)}
                    className="border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={isAnalyzing}
                  />
                  <div className="ml-2">
                    <span className="text-sm text-gray-700">상세 분석</span>
                    <p className="text-xs text-gray-500">정밀 분석 (약 2-3분)</p>
                  </div>
                </label>
              </div>
            </div>

            {/* 주의사항 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-xs text-yellow-800">
                  <p className="font-medium mb-1">분석 시 주의사항</p>
                  <ul className="space-y-1">
                    <li>• 분석 중에는 페이지를 새로고침하지 마세요</li>
                    <li>• 리뷰가 많은 상품일수록 분석 시간이 길어집니다</li>
                    <li>• 분석 결과는 실시간으로 업데이트됩니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 분석 시작 버튼 */}
      <div className="flex space-x-3">
        <button
          onClick={canRetry ? onRetry : handleAnalysisStart}
          disabled={isAnalyzing}
          className={`flex-1 flex items-center justify-center px-4 py-3 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${getButtonColor()}`}
        >
          {getButtonContent()}
        </button>

        {isAnalyzing && (
          <button
            type="button"
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            title="분석 일시정지"
          >
            <Pause className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 예상 소요 시간 */}
      {!isAnalyzing && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            예상 소요 시간: {options.analysisDepth === 'basic' ? '약 1분' : '약 2-3분'}
          </p>
        </div>
      )}
    </div>
  );
};