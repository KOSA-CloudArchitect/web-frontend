import { apiService } from './api';

export interface NotificationSettings {
  id: string;
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  webEnabled: boolean;
  priceDropEnabled: boolean;
  reviewChangeEnabled: boolean;
  analysisCompleteEnabled: boolean;
  priceDropThreshold: number;
  reviewChangeThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLog {
  id: string;
  userId: string;
  type: 'PRICE_DROP' | 'REVIEW_CHANGE' | 'ANALYSIS_COMPLETE';
  channel: 'EMAIL' | 'PUSH' | 'WEB';
  title: string;
  message: string;
  data?: any;
  status: 'PENDING' | 'SENT' | 'FAILED';
  sentAt?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface NotificationStats {
  byType: Record<string, number>;
  byChannel: Record<string, number>;
  byStatus: Record<string, number>;
  total: number;
}

export interface NotificationLogsResponse {
  logs: NotificationLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class NotificationService {
  /**
   * 사용자 알림 설정 조회
   */
  async getSettings(): Promise<{ success: boolean; data: NotificationSettings }> {
    const response = await apiService.get<{ success: boolean; data: NotificationSettings }>('/api/notifications/settings');
    return response;
  }

  /**
   * 사용자 알림 설정 업데이트
   */
  async updateSettings(settings: Partial<NotificationSettings>): Promise<{ success: boolean; data: NotificationSettings; message: string }> {
    const response = await apiService.put<{ success: boolean; data: NotificationSettings; message: string }>('/api/notifications/settings', settings);
    return response;
  }

  /**
   * 알림 기록 조회
   */
  async getLogs(options: {
    page?: number;
    limit?: number;
    type?: 'PRICE_DROP' | 'REVIEW_CHANGE' | 'ANALYSIS_COMPLETE';
    channel?: 'EMAIL' | 'PUSH' | 'WEB';
  } = {}): Promise<{ success: boolean; data: NotificationLog[]; pagination: any }> {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.type) params.append('type', options.type);
    if (options.channel) params.append('channel', options.channel);

    const response = await apiService.get<{ success: boolean; data: NotificationLog[]; pagination: any }>(`/api/notifications/logs?${params.toString()}`);
    return response;
  }

  /**
   * 테스트 알림 전송
   */
  async sendTestNotification(type: 'PRICE_DROP' | 'REVIEW_CHANGE' | 'ANALYSIS_COMPLETE', channel?: 'EMAIL' | 'PUSH' | 'WEB'): Promise<{ success: boolean; message: string }> {
    const response = await apiService.post<{ success: boolean; message: string }>('/api/notifications/test', { type, channel });
    return response;
  }

  /**
   * 알림 통계 조회
   */
  async getStats(): Promise<{ success: boolean; data: NotificationStats }> {
    const response = await apiService.get<{ success: boolean; data: NotificationStats }>('/api/notifications/stats');
    return response;
  }

  /**
   * 브라우저 푸시 알림 권한 요청
   */
  async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * 로컬 푸시 알림 표시
   */
  showLocalNotification(title: string, options: NotificationOptions = {}) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    // 알림 클릭 시 창 포커스
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // 5초 후 자동 닫기
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }

  /**
   * Service Worker 등록 (FCM용)
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker is not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * FCM 토큰 가져오기 (Firebase 설정 필요)
   */
  async getFCMToken(): Promise<string | null> {
    // TODO: Firebase FCM 구현
    // const messaging = getMessaging();
    // const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
    // return token;
    
    console.warn('FCM is not implemented yet');
    return null;
  }
}

export const notificationService = new NotificationService();