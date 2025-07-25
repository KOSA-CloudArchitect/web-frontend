import { 
  AnalysisRequest, 
  AnalysisResponse, 
  AnalysisStatus, 
  AnalysisResultResponse,
  Product,
  ApiErrorResponse 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export class ApiError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      // response가 undefined이거나 null인 경우 처리
      if (!response) {
        throw new ApiError('네트워크 응답을 받을 수 없습니다.');
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
}

export const apiService = new ApiService();