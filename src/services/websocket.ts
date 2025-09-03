import { io, Socket } from 'socket.io-client';
import { WebSocketAnalysisEvent, RealtimeAnalysisEvent } from '../types';

import { getWebSocketUrl } from '../utils/apiConfig';

const WS_URL = getWebSocketUrl();

export class WebSocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
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

  // 실시간 분석 이벤트 구독 (새로운 메서드)
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

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const webSocketService = new WebSocketService();