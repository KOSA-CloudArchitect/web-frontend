import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getWebSocketUrl } from '../utils/apiConfig';
import { useRealtimeAnalysisStore } from '../stores/realtimeAnalysisStore';
import { createMockWebSocketServer, MockWebSocketServer } from '../mocks/websocketMock';

// 지연 평가: 호출 시점에 구성에서 URL을 가져옴
const getWsUrl = () => getWebSocketUrl();
const USE_MOCK = process.env.NODE_ENV === 'test' || (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK_WS === 'true');

export interface UseWebSocketOptions {
  productId: string;
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export interface WebSocketHookReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  subscribeToAnalysis: (taskId: string) => void;
  subscribeToUser: (userId: string) => void;
  subscribeToSearch: (jobId: string) => void;
}

export const useWebSocket = ({
  productId,
  autoConnect = true,
  reconnectionAttempts = 5,
  reconnectionDelay = 1000,
}: UseWebSocketOptions): WebSocketHookReturn => {
  const socketRef = useRef<Socket | MockWebSocketServer | null>(null);
  const isInitializedRef = useRef(false);
  const { 
    setConnectionStatus, 
    setCurrentStage, 
    setProgress, 
    addEmotionCard, 
    setError,
    clearError,
    updateAnalysisChart
  } = useRealtimeAnalysisStore();

  const setupEventHandlers = useCallback((socket: Socket | MockWebSocketServer) => {
    // 연결 이벤트 핸들러
    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setConnectionStatus(true);
      clearError();
      
      // 상품 룸에 참여하여 관련 업데이트 수신
      if ('emit' in socket) {
        (socket as Socket).emit('join-product-room', productId);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setConnectionStatus(false);
      
      if (reason === 'io server disconnect' && 'connect' in socket) {
        // 서버에서 연결을 끊은 경우 수동으로 재연결
        (socket as Socket).connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        description: (error as any).description,
        context: (error as any).context,
        type: (error as any).type
      });
      setConnectionStatus(false);
      setError(`연결 오류: ${error.message}`);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ WebSocket reconnected after ${attemptNumber} attempts`);
      setConnectionStatus(true);
      clearError();
    });

    socket.on('reconnect_error', (error) => {
      console.error('❌ WebSocket reconnection error:', error);
      setError(`재연결 실패: ${error.message}`);
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ WebSocket reconnection failed');
      setError('서버 연결에 실패했습니다. 페이지를 새로고침해주세요.');
    });

    // 분석 상태 업데이트 이벤트 (백엔드 analysisService에서 전송)
    socket.on('analysis-update', (data) => {
      console.log('📊 Analysis update received:', data);
      
      if (data.type === 'analysis_started') {
        setCurrentStage('분석 시작');
        setProgress(5);
      } else if (data.type === 'result_saved') {
        setCurrentStage('분석 완료');
        setProgress(100);
      }
      
      if (data.message) {
        // 메시지를 상태로 표시할 수 있음
        console.log('📝 분석 메시지:', data.message);
      }
      
      if (data.error) {
        setError(data.error);
      }
    });

    // 기존 이벤트도 유지 (하위 호환성)
    socket.on(`analysis:status:${productId}`, (data) => {
      console.log('📊 Analysis status update:', data);
      
      if (data.stage) {
        setCurrentStage(data.stage);
      }
      
      if (typeof data.progress === 'number') {
        setProgress(data.progress);
      }
      
      if (data.error) {
        setError(data.error);
      }
    });

    // 감정 카드 데이터 수신 이벤트
    socket.on(`analysis:emotion:${productId}`, (data) => {
      console.log('💭 Emotion card received:', data);
      
      addEmotionCard({
        id: data.id || Date.now().toString(),
        sentiment: data.sentiment,
        content: data.content,
        keywords: data.keywords || [],
        confidence: data.confidence || 0,
        timestamp: data.timestamp || new Date().toISOString(),
        color: getSentimentColor(data.sentiment),
      });
    });

    // 분석 차트 업데이트 이벤트
    socket.on(`analysis:chart:${productId}`, (data) => {
      console.log('📈 Chart update received:', data);
      
      updateAnalysisChart({
        positive: data.positive || 0,
        negative: data.negative || 0,
        neutral: data.neutral || 0,
        totalProcessed: data.totalProcessed || 0,
      });
    });

    // 분석 완료 이벤트
    socket.on(`analysis:complete:${productId}`, (data) => {
      console.log('✅ Analysis completed:', data);
      setCurrentStage('완료');
      setProgress(100);
    });

    // 분석 오류 이벤트
    socket.on(`analysis:error:${productId}`, (data) => {
      console.error('❌ Analysis error:', data);
      setError(data.message || '분석 중 오류가 발생했습니다.');
    });

    // 상품별 분석 완료 알림 (다른 사용자가 분석한 결과)
    socket.on('analysis-completed', (data) => {
      console.log('🎉 Product analysis completed by another user:', data);
      if (data.productId === productId) {
        setCurrentStage('새 분석 결과 업데이트됨');
        // 페이지 새로고침이나 데이터 재로드를 트리거할 수 있음
      }
    });

    // 내 분석 완료 알림
    socket.on('my-analysis-completed', (data) => {
      console.log('✅ My analysis completed:', data);
      setCurrentStage('분석 완료');
      setProgress(100);
    });

    // 분석 시작 알림
    socket.on('analysis-started', (data) => {
      console.log('🚀 Analysis started:', data);
      if (data.productId === productId) {
        setCurrentStage('분석 시작');
        setProgress(10);
      }
    });

    // 검색 관련 이벤트 핸들러
    socket.on('search-started', (data) => {
      console.log('🔍 Search started:', data);
      if ((window as any).searchStatusCallback) {
        (window as any).searchStatusCallback({
          status: 'started',
          message: data.message,
          jobId: data.jobId,
          keyword: data.keyword
        });
      }
    });

    socket.on('search-completed', (data) => {
      console.log('✅ Search completed:', data);
      if ((window as any).searchStatusCallback) {
        (window as any).searchStatusCallback({
          status: 'completed',
          message: data.message,
          jobId: data.jobId,
          keyword: data.keyword,
          products: data.products,
          productCount: data.productCount
        });
      }
    });

    socket.on('search-error', (data) => {
      console.log('❌ Search error:', data);
      if ((window as any).searchStatusCallback) {
        (window as any).searchStatusCallback({
          status: 'error',
          message: data.message,
          jobId: data.jobId,
          keyword: data.keyword,
          error: data.error
        });
      }
    });

    // 크롤링 상태 이벤트 핸들러
    socket.on('crawling-status', (data) => {
      console.log('🔄 Crawling status update:', data);
      if ((window as any).searchStatusCallback) {
        (window as any).searchStatusCallback({
          status: 'crawling',
          message: data.message,
          keyword: data.keyword,
          crawlingStatus: data.status,
          pollCount: data.pollCount
        });
      }
    });

    socket.on('crawling-completed', (data) => {
      console.log('🎉 Crawling completed:', data);
      if ((window as any).searchStatusCallback) {
        (window as any).searchStatusCallback({
          status: 'crawling-done',
          message: data.message,
          keyword: data.keyword
        });
      }
    });
  }, [productId, setConnectionStatus, setCurrentStage, setProgress, addEmotionCard, setError, clearError, updateAnalysisChart]);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    // 기존 소켓이 있다면 정리
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    try {
      // Mock 서버 사용 여부 확인
      if (USE_MOCK) {
        console.log('🔧 Using Mock WebSocket Server');
        socketRef.current = createMockWebSocketServer(productId);
      } else {
        socketRef.current = io(getWsUrl(), {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts,
          reconnectionDelay,
          timeout: 20000,
          forceNew: true, // 새로운 연결 강제 생성
          autoConnect: true,
        });
      }

      const socket = socketRef.current;

      if (!socket) {
        console.error('❌ Failed to create socket connection');
        setError('소켓 연결을 생성할 수 없습니다.');
        return;
      }

      setupEventHandlers(socket);
    } catch (error) {
      console.error('❌ Error creating socket:', error);
      setError('소켓 연결 생성 중 오류가 발생했습니다.');
    }
  }, [productId, reconnectionAttempts, reconnectionDelay, setupEventHandlers, setError]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnectionStatus(false);
    }
  }, [setConnectionStatus]);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => connect(), 100); // 약간의 지연을 두어 안정성 확보
  }, [connect, disconnect]);

  const subscribeToAnalysis = useCallback((taskId: string) => {
    if (socketRef.current && 'emit' in socketRef.current) {
      (socketRef.current as Socket).emit('subscribe-analysis', taskId);
      console.log(`📊 Subscribed to analysis: ${taskId}`);
    }
  }, []);

  const subscribeToUser = useCallback((userId: string) => {
    if (socketRef.current && 'emit' in socketRef.current) {
      (socketRef.current as Socket).emit('join-user-room', userId);
      console.log(`👤 Joined user room: ${userId}`);
    }
  }, []);

  const subscribeToSearch = useCallback((jobId: string) => {
    if (socketRef.current && 'emit' in socketRef.current) {
      const socket = socketRef.current as Socket;
      console.log(`🔍 Attempting to subscribe to search: ${jobId}`);
      console.log(`🔍 Socket connected: ${socket.connected}`);
      console.log(`🔍 Socket ID: ${socket.id}`);
      
      socket.emit('subscribe-search', jobId);
      console.log(`🔍 Subscribed to search room: search:${jobId}`);
      
      // 구독 확인을 위한 추가 로그
      socket.emit('ping');
    } else {
      console.error('❌ Socket not available for search subscription');
    }
  }, []);

  // 자동 연결 (한 번만 실행)
  useEffect(() => {
    if (autoConnect && productId && !isInitializedRef.current) {
      isInitializedRef.current = true;
      connect();
    }

    return () => {
      if (isInitializedRef.current) {
        disconnect();
        isInitializedRef.current = false;
      }
    };
  }, [productId, autoConnect]); // connect, disconnect 의존성 제거

  return {
    socket: socketRef.current as Socket | null,
    isConnected: socketRef.current?.connected || false,
    connect,
    disconnect,
    reconnect,
    subscribeToAnalysis,
    subscribeToUser,
    subscribeToSearch,
  };
};

// 감정에 따른 카드 색상 결정
const getSentimentColor = (sentiment: string): string => {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-100 border-green-300 text-green-800';
    case 'negative':
      return 'bg-red-100 border-red-300 text-red-800';
    case 'neutral':
      return 'bg-gray-100 border-gray-300 text-gray-800';
    default:
      return 'bg-blue-100 border-blue-300 text-blue-800';
  }
};