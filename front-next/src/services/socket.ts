import { io, Socket } from 'socket.io-client';
import { SocketAnalysisData } from '../types';
import { getWebSocketUrl } from '../utils/apiConfig';

const WS_URL = getWebSocketUrl();

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(WS_URL, { 
        transports: ["websocket", "polling"],
        autoConnect: true,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected');
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToAnalysis(
    productId: string, 
    callback: (data: SocketAnalysisData) => void
  ): () => void {
    const socket = this.connect();
    const eventName = `analysis:${productId}`;

    socket.on(eventName, callback);

    // 구독 해제 함수 반환
    return () => {
      socket.off(eventName, callback);
    };
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;