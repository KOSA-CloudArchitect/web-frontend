import { io, Socket } from 'socket.io-client';
import { WebSocketAnalysisEvent } from '../types';

const WS_URL = process.env.REACT_APP_WS_URL || '';

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