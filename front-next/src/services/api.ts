// API 서비스 클라이언트
import { getApiBaseUrl } from '@/utils/apiConfig';

const API_BASE_URL = getApiBaseUrl();

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface Product {
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
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ProductListResponse {
  success: boolean;
  products: Product[];
  pagination: Pagination;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 인증 관련 API
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(email: string, password: string, name: string) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  // 검색 관련 API
  async searchProducts(query: string, page: number = 1, limit: number = 20) {
    return this.request(`/api/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  // 상품 목록 API
  async getProductList(params: { page?: number; limit?: number; search?: string } = {}): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    
    const queryString = searchParams.toString();
    return this.request(`/api/products${queryString ? `?${queryString}` : ''}`) as Promise<ProductListResponse>;
  }

  async getTrendingKeywords() {
    return this.request('/api/trending/keywords');
  }

  async getTrendingProducts(keyword: string, limit: number = 6) {
    return this.request(`/api/trending/products/${encodeURIComponent(keyword)}?limit=${limit}`);
  }

  async getRecommendedProducts(limit: number = 8) {
    return this.request(`/api/trending/recommendations?limit=${limit}`);
  }

  // 분석 관련 API
  async startAnalysis(productId: string, productUrl: string, userId: string = 'anonymous') {
    return this.request('/api/analyze/airflow/single', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        productUrl,
        userId,
      }),
    });
  }

  // 실시간 분석 시작
  async startRealtimeAnalysis(data: any) {
    return this.request('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 범용 POST 메서드 추가
  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // 범용 GET 메서드 추가
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async getAnalysisStatus(taskId: string, dagRunId?: string) {
    const params = new URLSearchParams({ taskId });
    if (dagRunId) params.append('dagRunId', dagRunId);
    return this.request(`/api/analyze/status?${params.toString()}`);
  }

  async getAnalysisResult(productId: string) {
    return this.request(`/api/analysis/result/${productId}`);
  }

  // 관심 상품 관련 API
  async getInterestProducts() {
    return this.request('/api/interests');
  }

  async addInterestProduct(productId: string, productName: string) {
    return this.request('/api/interests', {
      method: 'POST',
      body: JSON.stringify({ productId, productName }),
    });
  }

  async removeInterestProduct(interestId: string) {
    return this.request(`/api/interests/${interestId}`, {
      method: 'DELETE',
    });
  }

  // 알림 설정 관련 API
  async getNotificationSettings() {
    return this.request('/api/notifications/settings');
  }

  async updateNotificationSettings(settings: any) {
    return this.request('/api/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export const apiService = apiClient;
export default apiClient;
