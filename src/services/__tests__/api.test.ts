import { apiService, ApiError } from '../api';
import { AnalysisRequest, AnalysisResponse, AnalysisStatus } from '../../types';

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('ApiService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('requestAnalysis', () => {
    it('should successfully request analysis', async () => {
      const mockResponse: AnalysisResponse = {
        success: true,
        message: '분석이 시작되었습니다.',
        taskId: 'task-123',
        estimatedTime: 120,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const request: AnalysisRequest = {
        productId: 'product-123',
        url: 'https://example.com/product',
        keywords: ['quality', 'price'],
      };

      const result = await apiService.requestAnalysis(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/analyze',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle API error response', async () => {
      const errorResponse = {
        message: '분석 요청에 실패했습니다.',
        code: 'ANALYSIS_REQUEST_FAILED',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => errorResponse,
      } as Response);

      const request: AnalysisRequest = {
        productId: 'invalid-product',
      };

      await expect(apiService.requestAnalysis(request)).rejects.toThrow(
        '분석 요청에 실패했습니다.'
      );
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request: AnalysisRequest = {
        productId: 'product-123',
      };

      await expect(apiService.requestAnalysis(request)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getAnalysisStatus', () => {
    it('should successfully get analysis status', async () => {
      const mockStatus: AnalysisStatus = {
        status: 'processing',
        progress: 50,
        estimatedTime: 60,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      } as Response);

      const result = await apiService.getAnalysisStatus('product-123');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/analyze/status/product-123',
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockStatus);
    });

    it('should handle 404 error for non-existent analysis', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: '분석 정보를 찾을 수 없습니다.' }),
      } as Response);

      await expect(apiService.getAnalysisStatus('non-existent')).rejects.toThrow(
        '분석 정보를 찾을 수 없습니다.'
      );
    });
  });

  describe('requestDummyAnalysis', () => {
    it('should successfully request dummy analysis', async () => {
      const mockResponse: AnalysisResponse = {
        success: true,
        message: '더미 분석이 시작되었습니다.',
        taskId: 'dummy-task-123',
        estimatedTime: 10,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await apiService.requestDummyAnalysis('dummy-product');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/analyze/dummy',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId: 'dummy-product' }),
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAnalysisResult', () => {
    it('should successfully get analysis result', async () => {
      const mockResult = {
        success: true,
        status: 'completed',
        result: {
          productId: 'product-123',
          sentiment: { positive: 70, negative: 20, neutral: 10 },
          summary: '전반적으로 긍정적인 평가',
          keywords: ['quality', 'price', 'delivery'],
          totalReviews: 150,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:05:00Z',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      } as Response);

      const result = await apiService.getAnalysisResult('product-123');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/analyze/result/product-123',
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getCacheHealth', () => {
    it('should successfully get cache health status', async () => {
      const mockHealth = {
        success: true,
        cache: { status: 'healthy', latency: 5 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHealth,
      } as Response);

      const result = await apiService.getCacheHealth();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/analyze/cache/health',
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockHealth);
    });
  });

  describe('invalidateCache', () => {
    it('should successfully invalidate cache', async () => {
      const mockResponse = {
        success: true,
        message: '상품 product-123의 캐시가 무효화되었습니다.',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await apiService.invalidateCache('product-123');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/analyze/cache/product-123',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });
});