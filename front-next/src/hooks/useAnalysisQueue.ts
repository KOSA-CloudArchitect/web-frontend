import { useState, useEffect, useCallback } from 'react';
import { analysisQueueService, AnalysisResponse, AnalysisProgress, QueueStatus } from '../services/analysisQueueService';

export const useAnalysisQueue = (productId: string) => {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 대기열 상태 조회
  const fetchQueueStatus = useCallback(async () => {
    try {
      const status = await analysisQueueService.getQueueStatus(productId);
      setQueueStatus(status);
      setError(null);
    } catch (err: any) {
      setError(err.message || '대기열 상태 조회에 실패했습니다.');
    }
  }, [productId]);

  // 분석 요청
  const requestAnalysis = useCallback(async (type: 'realtime' | 'batch'): Promise<AnalysisResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await analysisQueueService.requestAnalysis({
        product_id: productId,
        type
      });

      // 상태 업데이트
      await fetchQueueStatus();

      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '분석 요청에 실패했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [productId, fetchQueueStatus]);

  // 초기 로드 및 주기적 업데이트
  useEffect(() => {
    fetchQueueStatus();

    // 30초마다 상태 업데이트
    const interval = setInterval(fetchQueueStatus, 30000);

    return () => clearInterval(interval);
  }, [fetchQueueStatus]);

  return {
    queueStatus,
    isLoading,
    error,
    requestAnalysis,
    refreshStatus: fetchQueueStatus
  };
};

export const useAnalysisProgress = (taskId: string | null) => {
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!taskId) {
      setProgress(null);
      setIsPolling(false);
      return;
    }

    setIsPolling(true);

    const pollProgress = async () => {
      try {
        const progressData = await analysisQueueService.getAnalysisProgress(taskId);
        setProgress(progressData);

        // 완료되면 폴링 중지
        if (progressData.status === 'completed' || progressData.status === 'failed') {
          setIsPolling(false);
          return false; // 폴링 중지
        }

        return true; // 폴링 계속
      } catch (error) {
        console.error('진행률 조회 실패:', error);
        setIsPolling(false);
        return false;
      }
    };

    // 초기 조회
    pollProgress();

    // 2초마다 폴링
    const interval = setInterval(async () => {
      const shouldContinue = await pollProgress();
      if (!shouldContinue) {
        clearInterval(interval);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [taskId]);

  return {
    progress,
    isPolling
  };
};

export const useAnalysisHistory = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (page = 1, limit = 10) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await analysisQueueService.getAnalysisHistory(page, limit);
      setHistory(response.history);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || '분석 이력 조회에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const loadMore = useCallback(() => {
    if (pagination.page * pagination.limit < pagination.total) {
      fetchHistory(pagination.page + 1, pagination.limit);
    }
  }, [fetchHistory, pagination]);

  return {
    history,
    pagination,
    isLoading,
    error,
    loadMore,
    refresh: () => fetchHistory(1, pagination.limit)
  };
};