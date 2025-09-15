'use client';

import { io, Socket } from 'socket.io-client';

// 웹소켓 이벤트 타입 정의
export interface WebSocketAnalysisEvent {
  type: 'status' | 'progress' | 'complete' | 'error';
  data: any;
  timestamp: number;
}

export interface RealtimeAnalysisEvent {
  productId: string;
  status: string;
  progress: number;
  message: string;
  result?: any;
}

import { getWebSocketUrl } from '@/utils/apiConfig';

const WS_URL = getWebSocketUrl();

export class WebSocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true,
      autoConnect: true,
      path: '/socket.io/',
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      console.log('🔌 Socket ID:', this.socket?.id);
      console.log('🔌 Transport:', this.socket?.io.engine.transport.name);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        description: (error as any).description,
        context: (error as any).context,
        type: (error as any).type
      });
    });

    return this.socket;
  }

  subscribeToAnalysis(
    productId: string, 
    callback: (data: WebSocketAnalysisEvent) => void
  ): () => void {
    const socket = this.connect();
    const eventName = `analysis:${productId}`;
    
    socket.on(eventName, callback);
    
    // 구독 해제 함수 반환
    return () => {
      socket.off(eventName, callback);
    };
  }

  // 실시간 분석 이벤트 구독
  subscribeToRealtimeAnalysis(
    productId: string,
    callbacks: {
      onStatusUpdate?: (data: any) => void;
      onEmotionCard?: (data: any) => void;
      onChartUpdate?: (data: any) => void;
      onComplete?: (data: any) => void;
      onError?: (data: any) => void;
    }
  ): () => void {
    const socket = this.connect();
    
    // 각 이벤트 타입별 구독
    if (callbacks.onStatusUpdate) {
      socket.on(`analysis:status:${productId}`, callbacks.onStatusUpdate);
    }
    
    if (callbacks.onEmotionCard) {
      socket.on(`analysis:emotion:${productId}`, callbacks.onEmotionCard);
    }
    
    if (callbacks.onChartUpdate) {
      socket.on(`analysis:chart:${productId}`, callbacks.onChartUpdate);
    }
    
    if (callbacks.onComplete) {
      socket.on(`analysis:complete:${productId}`, callbacks.onComplete);
    }
    
    if (callbacks.onError) {
      socket.on(`analysis:error:${productId}`, callbacks.onError);
    }
    
    // 구독 해제 함수 반환
    return () => {
      if (callbacks.onStatusUpdate) {
        socket.off(`analysis:status:${productId}`, callbacks.onStatusUpdate);
      }
      if (callbacks.onEmotionCard) {
        socket.off(`analysis:emotion:${productId}`, callbacks.onEmotionCard);
      }
      if (callbacks.onChartUpdate) {
        socket.off(`analysis:chart:${productId}`, callbacks.onChartUpdate);
      }
      if (callbacks.onComplete) {
        socket.off(`analysis:complete:${productId}`, callbacks.onComplete);
      }
      if (callbacks.onError) {
        socket.off(`analysis:error:${productId}`, callbacks.onError);
      }
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // 검색 요청
  searchProducts(keyword: string, page: number = 1, limit: number = 20) {
    const socket = this.connect();
    socket.emit('search-products', {
      keyword,
      page,
      limit
    });
    console.log(`🔍 검색 요청: "${keyword}", 페이지: ${page}, 제한: ${limit}`);
  }

  // 검색 상태 구독
  subscribeToSearch(
    callbacks: {
      onSearchStarted?: (data: any) => void;
      onSearchCompleted?: (data: any) => void;
      onSearchError?: (data: any) => void;
      onCrawlingStatus?: (data: any) => void;
    }
  ): () => void {
    const socket = this.connect();
    
    if (callbacks.onSearchStarted) {
      socket.on('search-started', callbacks.onSearchStarted);
    }
    
    if (callbacks.onSearchCompleted) {
      socket.on('search-completed', callbacks.onSearchCompleted);
    }
    
    if (callbacks.onSearchError) {
      socket.on('search-error', callbacks.onSearchError);
    }
    
    if (callbacks.onCrawlingStatus) {
      socket.on('crawling-status', callbacks.onCrawlingStatus);
    }
    
    // 구독 해제 함수 반환
    return () => {
      if (callbacks.onSearchStarted) {
        socket.off('search-started', callbacks.onSearchStarted);
      }
      if (callbacks.onSearchCompleted) {
        socket.off('search-completed', callbacks.onSearchCompleted);
      }
      if (callbacks.onSearchError) {
        socket.off('search-error', callbacks.onSearchError);
      }
      if (callbacks.onCrawlingStatus) {
        socket.off('crawling-status', callbacks.onCrawlingStatus);
      }
    };
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const webSocketService = new WebSocketService();
