'use client';

export interface AnalysisRequest {
  product_id: string;
  type: 'realtime' | 'batch';
}

export interface AnalysisResponse {
  status: 'started' | 'queued' | 'sharing';
  task_id?: string;
  message: string;
  queue_position?: number;
  estimated_wait_minutes?: number;
  progress?: AnalysisProgress;
  current_task?: {
    type: string;
    progress: AnalysisProgress;
    estimated_completion: string;
  };
}

export interface AnalysisProgress {
  progress: number;
  status: string;
  current_step: string;
  processed_reviews: number;
  total_reviews: number;
}

export interface QueueStatus {
  has_active_task: boolean;
  current_task: {
    task_id: string;
    type: string;
    status: string;
    started_at: string;
    estimated_completion: string;
    user_count: number;
  } | null;
  queue_length: number;
  estimated_wait: number;
}

// API 응답 타입 정의
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export class AnalysisQueueService {
  private static readonly BASE_URL = '/api';

  // 분석 요청 시작
  static async startAnalysis(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/analyze/queue/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse<AnalysisResponse> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || data.message || '분석 요청에 실패했습니다.');
      }

      return data.data;
    } catch (error) {
      console.error('분석 요청 오류:', error);
      throw error instanceof Error ? error : new Error('분석 요청 중 오류가 발생했습니다.');
    }
  }

  // 분석 상태 확인
  static async getAnalysisStatus(taskId: string): Promise<AnalysisResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/analyze/queue/status/${taskId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse<AnalysisResponse> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || data.message || '상태 조회에 실패했습니다.');
      }

      return data.data;
    } catch (error) {
      console.error('상태 조회 오류:', error);
      throw error instanceof Error ? error : new Error('상태 조회 중 오류가 발생했습니다.');
    }
  }

  // 큐 상태 확인
  static async getQueueStatus(): Promise<QueueStatus> {
    try {
      const response = await fetch(`${this.BASE_URL}/analyze/queue/status`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse<QueueStatus> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || data.message || '큐 상태 조회에 실패했습니다.');
      }

      return data.data;
    } catch (error) {
      console.error('큐 상태 조회 오류:', error);
      throw error instanceof Error ? error : new Error('큐 상태 조회 중 오류가 발생했습니다.');
    }
  }

  // 분석 취소
  static async cancelAnalysis(taskId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/analyze/queue/cancel/${taskId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse<{ success: boolean }> = await response.json();
      return data.success;
    } catch (error) {
      console.error('분석 취소 오류:', error);
      return false;
    }
  }

  // 분석 결과 조회
  static async getAnalysisResult(taskId: string): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/analyze/queue/result/${taskId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse<any> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || data.message || '결과 조회에 실패했습니다.');
      }

      return data.data;
    } catch (error) {
      console.error('결과 조회 오류:', error);
      throw error instanceof Error ? error : new Error('결과 조회 중 오류가 발생했습니다.');
    }
  }

  // 실시간 분석 요청 (웹소켓 사용)
  static async startRealtimeAnalysis(
    productId: string,
    onProgress: (progress: AnalysisProgress) => void,
    onComplete: (result: any) => void,
    onError: (error: string) => void
  ): Promise<string> {
    try {
      const response = await fetch(`${this.BASE_URL}/analyze/realtime/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_id: productId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse<{ task_id: string }> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || data.message || '실시간 분석 요청에 실패했습니다.');
      }

      // 웹소켓을 통한 실시간 업데이트 구독
      this.subscribeToRealtimeUpdates(
        data.data.task_id,
        onProgress,
        onComplete,
        onError
      );

      return data.data.task_id;
    } catch (error) {
      console.error('실시간 분석 요청 오류:', error);
      throw error instanceof Error ? error : new Error('실시간 분석 요청 중 오류가 발생했습니다.');
    }
  }

  // 웹소켓을 통한 실시간 업데이트 구독
  private static subscribeToRealtimeUpdates(
    taskId: string,
    onProgress: (progress: AnalysisProgress) => void,
    onComplete: (result: any) => void,
    onError: (error: string) => void
  ): void {
    // 웹소켓 서비스 import (동적 import로 순환 참조 방지)
    import('./websocket').then(({ webSocketService }) => {
      webSocketService.subscribeToRealtimeAnalysis(
        taskId,
        {
          onStatusUpdate: (data) => {
            if (data.progress) {
              onProgress(data.progress);
            }
          },
          onComplete: (data) => {
            onComplete(data.result);
          },
          onError: (data) => {
            onError(data.message || '분석 중 오류가 발생했습니다.');
          },
        }
      );
    });
  }
}
