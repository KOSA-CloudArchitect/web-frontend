import React, { useState, useEffect } from 'react';
import { analysisQueueService, AnalysisResponse, AnalysisProgress } from '../services/analysisQueueService';

interface AnalysisRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

const AnalysisRequestModal: React.FC<AnalysisRequestModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName
}) => {
  const [analysisType, setAnalysisType] = useState<'realtime' | 'batch'>('realtime');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AnalysisResponse | null>(null);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 진행률 폴링
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (response?.task_id && (response.status === 'started' || response.status === 'sharing')) {
      interval = setInterval(async () => {
        try {
          const progressData = await analysisQueueService.getAnalysisProgress(response.task_id!);
          setProgress(progressData);

          // 완료되면 폴링 중지
          if (progressData.status === 'completed' || progressData.status === 'failed') {
            clearInterval(interval);
          }
        } catch (error) {
          console.error('진행률 조회 실패:', error);
        }
      }, 2000); // 2초마다 업데이트
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [response?.task_id, response?.status]);

  const handleAnalysisRequest = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await analysisQueueService.requestAnalysis({
        product_id: productId,
        type: analysisType
      });

      setResponse(result);

      // 즉시 시작된 경우 초기 진행률 설정
      if (result.status === 'started' || result.status === 'sharing') {
        setProgress(result.progress || { 
          progress: 0, 
          status: 'initializing', 
          current_step: '초기화 중...', 
          processed_reviews: 0, 
          total_reviews: 0 
        });
      }
    } catch (error: any) {
      setError(error.response?.data?.message || '분석 요청에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setResponse(null);
    setProgress(null);
    setError(null);
    onClose();
  };

  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) {
      return `약 ${minutes}분`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `약 ${hours}시간 ${remainingMinutes}분`;
  };

  const getStepDescription = (step: string) => {
    const stepMap: { [key: string]: string } = {
      'initializing': '초기화 중...',
      'preprocessing': '데이터 전처리 중...',
      'sentiment_analysis': '감정 분석 중...',
      'keyword_extraction': '키워드 추출 중...',
      'summary_generation': '요약 생성 중...',
      'saving_results': '결과 저장 중...',
      'completed': '분석 완료!'
    };
    return stepMap[step] || step;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">리뷰 분석 요청</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">상품: {productName}</p>
        </div>

        {!response && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">분석 유형</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="realtime"
                    checked={analysisType === 'realtime'}
                    onChange={(e) => setAnalysisType(e.target.value as 'realtime')}
                    className="mr-2"
                  />
                  <span>실시간 분석 (약 15분)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="batch"
                    checked={analysisType === 'batch'}
                    onChange={(e) => setAnalysisType(e.target.value as 'batch')}
                    className="mr-2"
                  />
                  <span>배치 분석 (약 45분, 더 정확함)</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleAnalysisRequest}
                disabled={isLoading}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? '요청 중...' : '분석 시작'}
              </button>
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </>
        )}

        {response && (
          <div className="space-y-4">
            {/* 상태별 메시지 */}
            <div className={`p-3 rounded ${
              response.status === 'started' ? 'bg-green-100 border border-green-400 text-green-700' :
              response.status === 'sharing' ? 'bg-blue-100 border border-blue-400 text-blue-700' :
              'bg-yellow-100 border border-yellow-400 text-yellow-700'
            }`}>
              <p className="font-medium">
                {response.status === 'started' && '🚀 분석 시작됨'}
                {response.status === 'sharing' && '🔄 분석 결과 공유'}
                {response.status === 'queued' && '⏳ 대기열 추가됨'}
              </p>
              <p className="text-sm mt-1">{response.message}</p>
            </div>

            {/* 대기열 정보 */}
            {response.status === 'queued' && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm">
                  <strong>대기 순서:</strong> {response.queue_position}번째
                </p>
                <p className="text-sm">
                  <strong>예상 대기 시간:</strong> {formatWaitTime(response.estimated_wait_minutes || 0)}
                </p>
                {response.current_task && (
                  <p className="text-sm text-gray-600 mt-2">
                    현재 {response.current_task.type === 'batch' ? '배치' : '실시간'} 분석이 진행 중입니다.
                  </p>
                )}
              </div>
            )}

            {/* 진행률 표시 */}
            {progress && (response.status === 'started' || response.status === 'sharing') && (
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">진행률</span>
                  <span className="text-sm text-gray-600">{progress.progress}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-600">
                  {getStepDescription(progress.current_step)}
                </p>
                
                {progress.total_reviews > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {progress.processed_reviews} / {progress.total_reviews} 리뷰 처리됨
                  </p>
                )}
              </div>
            )}

            {/* 완료 상태 */}
            {progress?.status === 'completed' && (
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="text-green-700 font-medium">✅ 분석이 완료되었습니다!</p>
                <button
                  onClick={handleClose}
                  className="mt-2 bg-green-500 text-white py-1 px-3 rounded text-sm hover:bg-green-600"
                >
                  결과 보기
                </button>
              </div>
            )}

            {/* 실패 상태 */}
            {progress?.status === 'failed' && (
              <div className="bg-red-50 p-3 rounded border border-red-200">
                <p className="text-red-700 font-medium">❌ 분석에 실패했습니다.</p>
                <button
                  onClick={() => setResponse(null)}
                  className="mt-2 bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600"
                >
                  다시 시도
                </button>
              </div>
            )}

            {/* 닫기 버튼 */}
            {response.status === 'queued' && (
              <button
                onClick={handleClose}
                className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                확인
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisRequestModal;