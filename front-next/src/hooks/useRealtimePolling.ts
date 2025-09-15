import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import { RawEmotionCard, EmotionCard, FinalSummary, ConnectionStatus, RealtimeAnalysisState } from '../types/realtime';

interface UseRealtimePollingOptions {
  productId: string;
  autoStart?: boolean;
  pollingInterval?: number; // milliseconds
}

export const useRealtimePolling = ({ 
  productId, 
  autoStart = true,
  pollingInterval = 2000 // 2초마다 폴링
}: UseRealtimePollingOptions) => {
  const [state, setState] = useState<RealtimeAnalysisState>({
    connection: 'closed',
    progress: 0,
    emotionCards: [],
    chartData: [],
    finalSummary: undefined,
    error: undefined,
  });

  const pollingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastFetchTimeRef = useRef<string>(new Date().toISOString());
  const isActiveRef = useRef(false);

  const updateState = useCallback((updates: Partial<RealtimeAnalysisState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // EmotionCard 변환 (기존 형식과 호환)
  const transformEmotionCard = useCallback((card: RawEmotionCard): EmotionCard => {
    const getSentimentColor = (sentiment: string): string => {
      switch (sentiment) {
        case 'pos':
          return 'border-green-200 bg-green-50';
        case 'neg':
          return 'border-red-200 bg-red-50';
        case 'neu':
          return 'border-gray-200 bg-gray-50';
        default:
          return 'border-blue-200 bg-blue-50';
      }
    };

    const getSentimentLabel = (sentiment: string): string => {
      switch (sentiment) {
        case 'pos':
          return 'positive';
        case 'neg':
          return 'negative';
        case 'neu':
          return 'neutral';
        default:
          return 'neutral';
      }
    };

    return {
      id: card.cardId || card.id,
      sentiment: getSentimentLabel(card.sentiment),
      content: card.summary,
      keywords: card.keywords?.map(k => k.key) || [],
      confidence: card.score,
      timestamp: card.createdAt || card.timestamp,
      color: getSentimentColor(card.sentiment)
    };
  }, []);

  // MongoDB에서 새로운 감정카드 폴링
  const pollNewCards = useCallback(async () => {
    if (!isActiveRef.current) return;

    try {
      console.log(`🔄 Polling new emotion cards for product: ${productId}, since: ${lastFetchTimeRef.current}`);
      
      const response = await apiService.get(`/api/realtime/cards/${productId}/new`, {
        params: {
          since: lastFetchTimeRef.current,
          limit: 10
        }
      });

      if (response.success && response.cards && response.cards.length > 0) {
        console.log(`📨 Received ${response.cards.length} new emotion cards`);
        
        const newCards = response.cards.map(transformEmotionCard);
        
        setState(prev => ({
          ...prev,
          emotionCards: [...newCards, ...prev.emotionCards].slice(0, 50), // 최대 50개 유지
        }));

        // 마지막 카드의 시간을 업데이트
        const latestCard = response.cards[response.cards.length - 1];
        if (latestCard && latestCard.createdAt) {
          lastFetchTimeRef.current = latestCard.createdAt;
        }
      }

    } catch (error: any) {
      console.error('❌ Failed to poll new emotion cards:', error);
      
      // 404는 정상적인 상황 (새 카드가 없음)
      if (error.response?.status !== 404) {
        updateState({
          error: '새로운 감정 카드를 불러오는데 실패했습니다.',
          connection: 'error'
        });
      }
    }
  }, [productId, transformEmotionCard, updateState]);

  // 분석 진행 상황 폴링
  const pollProgress = useCallback(async () => {
    if (!isActiveRef.current) return;

    try {
      console.log(`📊 Polling analysis progress for product: ${productId}`);
      
      const response = await apiService.get(`/api/realtime/progress/${productId}`);

      if (response.success) {
        const { totalCards, sentimentStats, isActive, lastUpdated } = response;
        
        // 진행률 계산 (카드 수에 기반)
        const estimatedProgress = Math.min(Math.floor((totalCards / 100) * 100), 95); // 최대 95%까지
        
        updateState({
          progress: estimatedProgress,
          connection: isActive ? 'open' : 'closed',
        });

        // 분석이 완료된 것으로 보이면 최종 결과 확인
        if (!isActive && totalCards > 0) {
          await checkFinalSummary();
        }
      }

    } catch (error: any) {
      console.error('❌ Failed to poll analysis progress:', error);
      
      if (error.response?.status !== 404) {
        updateState({
          error: '분석 진행 상황을 불러오는데 실패했습니다.',
          connection: 'error'
        });
      }
    }
  }, [productId, updateState]);

  // 최종 분석 결과 확인
  const checkFinalSummary = useCallback(async () => {
    try {
      console.log(`✅ Checking final analysis result for product: ${productId}`);
      
      const response = await apiService.get(`/api/analyze/result/mongo/${productId}`);

      if (response.success && response.result) {
        const result = response.result;
        
        const finalSummary: FinalSummary = {
          productId: result.productId,
          overall: {
            pos: Math.round(result.sentimentPositive * 100),
            neg: Math.round(result.sentimentNegative * 100),
            neu: Math.round(result.sentimentNeutral * 100),
          },
          topKeywords: result.keywords?.map((k: any) => ({
            key: k.keyword,
            count: k.frequency
          })) || [],
          highlights: [
            `총 ${result.totalReviews}개의 리뷰를 분석했습니다.`,
            `평균 평점: ${result.averageRating?.toFixed(1)}점`,
            result.summary || '상세한 분석 결과를 확인해보세요.'
          ],
          insights: result.summary,
          rawCount: result.totalReviews,
          generatedAt: result.createdAt || new Date().toISOString()
        };

        updateState({
          finalSummary,
          progress: 100,
          connection: 'open'
        });

        // 최종 결과가 나오면 폴링 중지
        stopPolling();
      }

    } catch (error: any) {
      console.error('❌ Failed to check final analysis result:', error);
      
      // MongoDB에 결과가 아직 없을 수 있으므로 에러로 처리하지 않음
      if (error.response?.status !== 404) {
        console.warn('Final analysis result not yet available');
      }
    }
  }, [productId, updateState]);

  // 폴링 시작
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      return; // 이미 실행 중
    }

    console.log(`🚀 Starting polling for product: ${productId}`);
    isActiveRef.current = true;
    
    updateState({
      connection: 'connecting',
      error: undefined
    });

    // 초기 데이터 로드
    pollProgress();
    pollNewCards();

    // 정기적 폴링 설정
    pollingIntervalRef.current = setInterval(async () => {
      await Promise.all([
        pollProgress(),
        pollNewCards()
      ]);
    }, pollingInterval);

    updateState({
      connection: 'open'
    });

  }, [productId, pollingInterval, pollProgress, pollNewCards, updateState]);

  // 폴링 중지
  const stopPolling = useCallback(() => {
    console.log(`🛑 Stopping polling for product: ${productId}`);
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = undefined;
    }
    
    isActiveRef.current = false;
    updateState({ connection: 'closed' });
  }, [productId, updateState]);

  // 폴링 재시작
  const restart = useCallback(() => {
    console.log(`🔄 Restarting polling for product: ${productId}`);
    stopPolling();
    
    // 상태 초기화
    setState({
      connection: 'closed',
      progress: 0,
      emotionCards: [],
      chartData: [],
      finalSummary: undefined,
      error: undefined,
    });
    
    lastFetchTimeRef.current = new Date().toISOString();
    
    setTimeout(() => startPolling(), 1000);
  }, [productId, startPolling, stopPolling]);

  // 수동 시작
  const start = useCallback(() => {
    if (!isActiveRef.current) {
      startPolling();
    }
  }, [startPolling]);

  // 중지
  const stop = useCallback(() => {
    stopPolling();
  }, [stopPolling]);

  // 자동 시작
  useEffect(() => {
    if (autoStart && productId) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [autoStart, productId, startPolling, stopPolling]);

  // productId가 변경되면 재시작
  useEffect(() => {
    if (isActiveRef.current) {
      restart();
    }
  }, [productId, restart]);

  return {
    ...state,
    start,
    stop,
    restart,
    isPolling: isActiveRef.current,
  };
};