import { io, Socket } from 'socket.io-client';
import { SocketAnalysisData } from '../types';

const WS_URL = process.env.REACT_APP_WS_URL || "wss://kosa-backend-879200699978.asia-northeast3.run.app";

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(WS_URL, { 
        transports: ["websocket"],
        autoConnect: true,
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