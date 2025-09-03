import { 
  AnalysisRequest, 
  AnalysisResponse, 
  AnalysisStatus, 
  AnalysisResultResponse,
  Product,
  ApiErrorResponse 
} from '../types';
import { authService } from './authService';

import { getApiBaseUrl } from '../utils/apiConfig';

export class ApiError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // 지연 평가: 호출 시점에 최신 설정을 읽어 URL 생성
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    
    // 인증 토큰 자동 추가
    const accessToken = authService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> || {}),
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    try {
      // AbortController를 사용한 timeout 설정 (2분)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      
      const response = await fetch(url, {
        headers,
        credentials: 'include', // 쿠키 포함 (Refresh Token용)
        signal: controller.signal,
        ...options,
      });
      
      clearTimeout(timeoutId);

      // response가 undefined이거나 null인 경우 처리
      if (!response) {
        throw new ApiError('네트워크 응답을 받을 수 없습니다.');
      }

      // 401 Unauthorized 처리 (토큰 만료 등)
      if (response.status === 401 && accessToken) {
        try {
          // 토큰 갱신 시도
          await authService.refreshToken();
          
          // 갱신된 토큰으로 재요청
          const newAccessToken = authService.getAccessToken();
          if (newAccessToken) {
            headers['Authorization'] = `Bearer ${newAccessToken}`;
            
            const retryController = new AbortController();
            const retryTimeoutId = setTimeout(() => retryController.abort(), 120000);
            
            const retryResponse = await fetch(url, {
              headers,
              credentials: 'include',
              signal: retryController.signal,
              ...options,
            });
            
            clearTimeout(retryTimeoutId);
            
            if (retryResponse.ok) {
              return await retryResponse.json();
            }
          }
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그아웃 처리
          authService.clearTokens();
          window.location.href = '/login';
          throw new ApiError('인증이 만료되었습니다. 다시 로그인해주세요.', 401, 'TOKEN_EXPIRED');
        }
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData: ApiErrorResponse = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // JSON 파싱 실패 시 기본 에러 메시지 사용
        }
        
        throw new ApiError(errorMessage, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // 네트워크 오류 등
      throw new ApiError(
        error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      );
    }
  }

  // 분석 요청
  async requestAnalysis(data: AnalysisRequest): Promise<AnalysisResponse> {
    return this.request<AnalysisResponse>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 더미 분석 요청
  async requestDummyAnalysis(productId: string): Promise<AnalysisResponse> {
    return this.request<AnalysisResponse>('/api/analyze/dummy', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  // 분석 상태 확인
  async getAnalysisStatus(productId: string): Promise<AnalysisStatus> {
    return this.request<AnalysisStatus>(`/api/analyze/status/${productId}`);
  }

  // 분석 결과 조회
  async getAnalysisResult(productId: string): Promise<AnalysisResultResponse> {
    return this.request<AnalysisResultResponse>(`/api/analyze/result/${productId}`);
  }

  // 상품 정보 조회
  async getProduct(productId: string): Promise<Product> {
    return this.request<Product>(`/api/products/${productId}`);
  }

  // 캐시 헬스체크
  async getCacheHealth(): Promise<{ success: boolean; cache: { status: string; latency?: number } }> {
    return this.request('/api/analyze/cache/health');
  }

  // 캐시 통계 조회
  async getCacheStats(): Promise<{ success: boolean; stats: any }> {
    return this.request('/api/analyze/cache/stats');
  }

  // 캐시 무효화
  async invalidateCache(productId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/analyze/cache/${productId}`, {
      method: 'DELETE',
    });
  }

  // 범용 GET 메서드
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  // 범용 POST 메서드
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // 범용 PUT 메서드
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // 범용 DELETE 메서드
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // 상품 목록 조회
  async getProductList(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    success: boolean;
    products: Array<{
      id: string;
      name: string;
      url: string;
      currentPrice: number | null;
      averageRating: number | null;
      totalReviews: number;
      imageUrl: string | null;
      lastCrawledAt: string;
      createdAt: string;
      updatedAt: string;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const endpoint = `/api/products/list${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<any>(endpoint, { method: 'GET' });
  }
}

export const apiService = new ApiService();