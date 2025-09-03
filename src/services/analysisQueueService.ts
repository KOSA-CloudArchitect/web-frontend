import axios from 'axios';

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

interface AnalysisHistoryResponse {
    history: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}

class AnalysisQueueService {
    private getBaseURL = () => {
        // 런타임에 API URL 가져오기 (빌드타임 환경변수 완전 무시)
        const runtimeConfig = (window as any).__RUNTIME_CONFIG__ || {};
        if (runtimeConfig.API_BASE_URL) {
            return runtimeConfig.API_BASE_URL;
        }
        // 기본값: 쿠버네티스 내부 서비스
        return 'http://backend-service.web-tier.svc.cluster.local:3001';
    };

    /**
     * 분석 요청
     */
    async requestAnalysis(request: AnalysisRequest): Promise<AnalysisResponse> {
        try {
            const response = await axios.post<ApiResponse<AnalysisResponse>>(
                `${this.getBaseURL()}/api/analysis/request`,
                request
            );
            return response.data.data;
        } catch (error) {
            console.error('분석 요청 실패:', error);
            throw error;
        }
    }

    /**
     * 분석 진행률 조회
     */
    async getAnalysisProgress(taskId: string): Promise<AnalysisProgress> {
        try {
            const response = await axios.get<ApiResponse<AnalysisProgress>>(
                `${this.getBaseURL()}/api/analysis/progress/${taskId}`
            );
            return response.data.data;
        } catch (error) {
            console.error('진행률 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 대기열 상태 조회
     */
    async getQueueStatus(productId: string): Promise<QueueStatus> {
        try {
            const response = await axios.get<ApiResponse<QueueStatus>>(
                `${this.getBaseURL()}/api/analysis/queue/${productId}`
            );
            return response.data.data;
        } catch (error) {
            console.error('대기열 상태 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 분석 이력 조회
     */
    async getAnalysisHistory(page = 1, limit = 10): Promise<AnalysisHistoryResponse> {
        try {
            const response = await axios.get<ApiResponse<AnalysisHistoryResponse>>(
                `${this.getBaseURL()}/api/analysis/history`,
                {
                    params: { page, limit }
                }
            );
            return response.data.data;
        } catch (error) {
            console.error('분석 이력 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 분석 취소 (관리자용)
     */
    async cancelAnalysis(productId: string, reason?: string): Promise<ApiResponse<null>> {
        try {
            // POST 방식으로 변경 (DELETE + body 대신)
            const response = await axios.post<ApiResponse<null>>(
                `${this.getBaseURL()}/api/analysis/cancel/${productId}`,
                { reason }
            );
            return response.data;
        } catch (error) {
            console.error('분석 취소 실패:', error);
            throw error;
        }
    }
}

export const analysisQueueService = new AnalysisQueueService();