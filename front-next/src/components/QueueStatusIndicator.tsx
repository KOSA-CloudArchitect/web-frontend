import React, { useState, useEffect } from 'react';
import { analysisQueueService, QueueStatus } from '../services/analysisQueueService';

interface QueueStatusIndicatorProps {
  productId: string;
  className?: string;
}

const QueueStatusIndicator: React.FC<QueueStatusIndicatorProps> = ({
  productId,
  className = ''
}) => {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQueueStatus = async () => {
      try {
        const status = await analysisQueueService.getQueueStatus(productId);
        setQueueStatus(status);
      } catch (error) {
        console.error('대기열 상태 조회 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQueueStatus();

    // 30초마다 상태 업데이트
    const interval = setInterval(fetchQueueStatus, 30000);

    return () => clearInterval(interval);
  }, [productId]);

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-500">상태 확인 중...</span>
      </div>
    );
  }

  if (!queueStatus?.has_active_task && queueStatus?.queue_length === 0) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-green-600">분석 가능</span>
      </div>
    );
  }

  const formatTimeRemaining = (isoString: string) => {
    const remaining = new Date(isoString).getTime() - new Date().getTime();
    const minutes = Math.max(0, Math.ceil(remaining / (1000 * 60)));
    
    if (minutes < 60) {
      return `${minutes}분`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}시간 ${remainingMinutes}분`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 현재 진행 중인 작업 */}
      {queueStatus?.current_task && (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-blue-600">
            {queueStatus.current_task.type === 'batch' ? '배치' : '실시간'} 분석 진행 중
          </span>
          <span className="text-xs text-gray-500">
            (남은 시간: {formatTimeRemaining(queueStatus.current_task.estimated_completion)})
          </span>
        </div>
      )}

      {/* 대기열 정보 */}
      {queueStatus && queueStatus.queue_length && queueStatus.queue_length > 0 && (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-sm text-yellow-600">
            {queueStatus.queue_length}명 대기 중
          </span>
          {queueStatus.estimated_wait && queueStatus.estimated_wait > 0 && (
            <span className="text-xs text-gray-500">
              (예상 대기: {Math.ceil(queueStatus.estimated_wait)}분)
            </span>
          )}
        </div>
      )}

      {/* 사용자 수 표시 */}
      {queueStatus && queueStatus.current_task && queueStatus.current_task.user_count && queueStatus.current_task.user_count > 1 && (
        <div className="text-xs text-gray-500">
          {queueStatus.current_task.user_count}명이 이 분석을 보고 있습니다
        </div>
      )}
    </div>
  );
};

export default QueueStatusIndicator;