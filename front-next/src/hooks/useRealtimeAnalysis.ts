import { useEffect, useRef, useState, useCallback } from 'react';
import { WSMessage, RawEmotionCard, EmotionCard, FinalSummary, ConnectionStatus, ChartPoint, RealtimeAnalysisState } from '../types/realtime';

interface UseRealtimeAnalysisOptions {
  productId: string;
  autoConnect?: boolean;
}

export const useRealtimeAnalysis = ({ productId, autoConnect = true }: UseRealtimeAnalysisOptions) => {
  const [state, setState] = useState<RealtimeAnalysisState>({
    connection: 'closed',
    progress: 0,
    emotionCards: [],
    chartData: [],
    finalSummary: undefined,
    error: undefined,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const updateState = useCallback((updates: Partial<RealtimeAnalysisState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // WebSocket URL 생성 (Socket.IO 네임스페이스 방식)
  const getWebSocketUrl = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    return `${baseUrl}/ws/realtime`;
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
      id: card.id,
      sentiment: getSentimentLabel(card.sentiment),
      content: card.summary,
      keywords: card.keywords?.map(k => k.key) || [],
      confidence: card.score,
      timestamp: card.timestamp,
      color: getSentimentColor(card.sentiment)
    };
  }, []);

  // 메시지 파싱 및 처리
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WSMessage = JSON.parse(event.data);
      console.log('📨 WebSocket 메시지 수신:', message);

      switch (message.type) {
        case 'analysis_started':
          console.log('🚀 분석 시작 확인:', message.productId);
          updateState({
            connection: 'open',
            progress: 0,
            error: undefined
          });
          break;

        case 'emotion_card':
          console.log('💭 감정 카드 수신:', message.card);
          setState(prev => ({
            ...prev,
            emotionCards: [transformEmotionCard(message.card), ...prev.emotionCards].slice(0, 50) // 최대 50개
          }));
          break;

        case 'progress':
          console.log('📊 진행률 업데이트:', message.value);
          updateState({ progress: Math.max(0, Math.min(100, message.value)) });
          break;

        case 'final_summary':
          console.log('✅ 최종 분석 결과 수신:', message.payload);
          updateState({
            finalSummary: message.payload,
            progress: 100,
            connection: 'open'
          });
          break;

        case 'error':
          console.error('❌ 분석 오류:', message.message);
          updateState({
            error: message.message,
            connection: 'error'
          });
          break;

        default:
          console.warn('🤷 알 수 없는 메시지 타입:', message);
      }
    } catch (error) {
      console.error('❌ 메시지 파싱 오류:', error);
      updateState({
        error: '메시지 파싱에 실패했습니다.',
        connection: 'error'
      });
    }
  }, [updateState, transformEmotionCard]);

  // Socket.IO 연결
  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.connected) {
      console.log('🔗 이미 Socket.IO가 연결되어 있습니다.');
      return;
    }

    try {
      updateState({ connection: 'connecting', error: undefined });
      
      const wsUrl = getWebSocketUrl();
      console.log('🔌 Socket.IO 연결 시도:', `${wsUrl}?productId=${productId}`);
      
      // Socket.IO를 사용한 연결
      const io = require('socket.io-client');
      wsRef.current = io(wsUrl, {
        query: { productId },
        transports: ['websocket', 'polling'],
      });

      wsRef.current.on('connect', () => {
        console.log('🟢 Socket.IO 연결 성공');
        updateState({ connection: 'open' });
        reconnectAttempts.current = 0;
      });

      wsRef.current.on('analysis_started', (data) => {
        console.log('🚀 분석 시작 확인:', data);
        updateState({
          connection: 'open',
          progress: 0,
          error: undefined
        });
      });

      wsRef.current.on('emotion_card', (data) => {
        console.log('💭 감정 카드 수신:', data.card);
        setState(prev => ({
          ...prev,
          emotionCards: [transformEmotionCard(data.card), ...prev.emotionCards].slice(0, 50)
        }));
      });

      wsRef.current.on('progress', (data) => {
        console.log('📊 진행률 업데이트:', data.value);
        updateState({ progress: Math.max(0, Math.min(100, data.value)) });
      });

      wsRef.current.on('final_summary', (data) => {
        console.log('✅ 최종 분석 결과 수신:', data.payload);
        updateState({
          finalSummary: data.payload,
          progress: 100,
          connection: 'open'
        });
      });

      wsRef.current.on('error', (data) => {
        console.error('❌ 분석 오류:', data.message);
        updateState({
          error: data.message,
          connection: 'error'
        });
      });

      wsRef.current.on('disconnect', (reason) => {
        console.log('🔴 Socket.IO 연결 해제:', reason);
        updateState({ connection: 'closed' });
        
        // 정상 종료가 아닌 경우 재연결 시도
        if (reason !== 'io client disconnect' && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // 지수 백오프
          console.log(`🔄 ${delay}ms 후 재연결 시도 (${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      });

      wsRef.current.on('connect_error', (error) => {
        console.error('❌ Socket.IO 연결 오류:', error);
        updateState({ 
          connection: 'error',
          error: 'Socket.IO 연결 중 오류가 발생했습니다.'
        });
      });

    } catch (error) {
      console.error('❌ Socket.IO 연결 실패:', error);
      updateState({ 
        connection: 'error',
        error: 'Socket.IO 연결에 실패했습니다.'
      });
    }
  }, [getWebSocketUrl, handleMessage, updateState, productId, transformEmotionCard]);

  // Socket.IO 연결 해제
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }

    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }

    updateState({ connection: 'closed' });
    reconnectAttempts.current = 0;
  }, [updateState]);

  // 수동 시작 (분석 요청 없이 WebSocket만 연결)
  const start = useCallback(() => {
    if (state.connection !== 'open') {
      connect();
    }
  }, [connect, state.connection]);

  // 중지
  const stop = useCallback(() => {
    disconnect();
  }, [disconnect]);

  // 재연결
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => connect(), 1000);
  }, [disconnect, connect]);

  // 자동 연결
  useEffect(() => {
    if (autoConnect && productId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, productId, connect, disconnect]);

  // productId가 변경되면 재연결
  useEffect(() => {
    if (wsRef.current && wsRef.current.connected) {
      disconnect();
      setTimeout(() => connect(), 500);
    }
  }, [productId, connect, disconnect]);

  return {
    ...state,
    start,
    stop,
    reconnect,
  };
};