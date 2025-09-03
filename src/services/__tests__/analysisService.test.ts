import { rest } from 'msw';
import { setupServer } from 'msw/node';
import analysisService from '../analysisService';

// Mock server setup
const server = setupServer(
  // Single product analysis
  rest.post('/api/analyze/airflow/single', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        message: '단일 상품 분석이 시작되었습니다.',
        dagRunId: 'single_test-product_123456',
        dagId: 'single_product_analysis',
        status: 'triggered'
      })
    );
  }),

  // Multi product analysis
  rest.post('/api/analyze/airflow/multi', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        message: '다중 상품 분석이 시작되었습니다.',
        dagRunId: 'multi_smartphone_123456',
        dagId: 'multi_product_analysis',
        status: 'triggered'
      })
    );
  }),

  // Watchlist analysis
  rest.post('/api/analyze/airflow/watchlist', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        message: '관심 상품 배치 분석이 시작되었습니다.',
        dagRunId: 'watchlist_user123_123456',
        dagId: 'watchlist_batch_analysis',
        status: 'triggered'
      })
    );
  }),

  // Analysis status
  rest.get('/api/analyze/airflow/status/:dagId/:dagRunId', (req, res, ctx) => {
    const { dagId, dagRunId } = req.params;
    return res(
      ctx.json({
        success: true,
        dagId,
        dagRunId,
        state: 'running',
        progress: {
          total: 5,
          completed: 2,
          failed: 0,
          running: 1,
          percentage: 40
        },
        tasks: [
          {
            taskId: 'start_task',
            state: 'success',
            startDate: '2025-01-01T00:01:00Z',
            endDate: '2025-01-01T00:02:00Z',
            duration: 60
          },
          {
            taskId: 'processing_task',
            state: 'running',
            startDate: '2025-01-01T00:02:00Z',
            endDate: null,
            duration: null
          }
        ]
      })
    );
  }),

  // Active analyses
  rest.get('/api/analyze/airflow/active/:userId', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        analyses: [
          {
            dagId: 'single_product_analysis',
            dagRunId: 'single_test_123',
            type: 'single',
            status: 'running',
            createdAt: '2025-01-01T00:00:00Z'
          }
        ],
        count: 1
      })
    );
  }),

  // Analysis result
  rest.get('/api/analyze/result/:productId', (req, res, ctx) => {
    const { productId } = req.params;
    return res(
      ctx.json({
        success: true,
        status: 'completed',
        result: {
          productId,
          sentiment: {
            positive: 0.6,
            negative: 0.2,
            neutral: 0.2
          },
          summary: '전반적으로 긍정적인 리뷰가 많습니다.',
          keywords: ['품질', '가격', '배송'],
          totalReviews: 150,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T01:00:00Z'
        }
      })
    );
  })
);

// Enable API mocking before tests
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests
afterEach(() => server.resetHandlers());

// Disable API mocking after the tests are done
afterAll(() => server.close());

describe('AnalysisService', () => {
  describe('requestSingleProductAnalysis', () => {
    it('should request single product analysis successfully', async () => {
      const params = {
        productId: 'test-product-123',
        productUrl: 'https://www.coupang.com/vp/products/123456',
        userId: 'user-123'
      };

      const result = await analysisService.requestSingleProductAnalysis(params);

      expect(result).toEqual({
        success: true,
        message: '단일 상품 분석이 시작되었습니다.',
        dagRunId: 'single_test-product_123456',
        dagId: 'single_product_analysis',
        status: 'triggered'
      });
    });

    it('should handle API errors', async () => {
      server.use(
        rest.post('/api/analyze/airflow/single', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              success: false,
              error: '서버 오류가 발생했습니다.'
            })
          );
        })
      );

      const params = {
        productId: 'error-product',
        productUrl: 'https://www.coupang.com/vp/products/123456',
        userId: 'user-123'
      };

      await expect(analysisService.requestSingleProductAnalysis(params))
        .rejects.toThrow('서버 오류가 발생했습니다.');
    });

    it('should handle network errors', async () => {
      server.use(
        rest.post('/api/analyze/airflow/single', (req, res, ctx) => {
          return res.networkError('Network connection failed');
        })
      );

      const params = {
        productId: 'network-error-product',
        productUrl: 'https://www.coupang.com/vp/products/123456',
        userId: 'user-123'
      };

      await expect(analysisService.requestSingleProductAnalysis(params))
        .rejects.toThrow('네트워크 오류가 발생했습니다.');
    });

    it('should validate required parameters', async () => {
      await expect(analysisService.requestSingleProductAnalysis({}))
        .rejects.toThrow('필수 파라미터가 누락되었습니다.');
    });
  });

  describe('requestMultiProductAnalysis', () => {
    it('should request multi product analysis successfully', async () => {
      const params = {
        searchQuery: 'smartphone',
        userId: 'user-123',
        maxProducts: 10
      };

      const result = await analysisService.requestMultiProductAnalysis(params);

      expect(result).toEqual({
        success: true,
        message: '다중 상품 분석이 시작되었습니다.',
        dagRunId: 'multi_smartphone_123456',
        dagId: 'multi_product_analysis',
        status: 'triggered'
      });
    });

    it('should use default maxProducts when not provided', async () => {
      const params = {
        searchQuery: 'laptop',
        userId: 'user-123'
      };

      const result = await analysisService.requestMultiProductAnalysis(params);

      expect(result.success).toBe(true);
    });

    it('should validate search query', async () => {
      const params = {
        searchQuery: '',
        userId: 'user-123'
      };

      await expect(analysisService.requestMultiProductAnalysis(params))
        .rejects.toThrow('검색어를 입력해주세요.');
    });
  });

  describe('requestWatchlistAnalysis', () => {
    it('should request watchlist analysis successfully', async () => {
      const params = {
        userId: 'user-123',
        productIds: ['product-1', 'product-2', 'product-3']
      };

      const result = await analysisService.requestWatchlistAnalysis(params);

      expect(result).toEqual({
        success: true,
        message: '관심 상품 배치 분석이 시작되었습니다.',
        dagRunId: 'watchlist_user123_123456',
        dagId: 'watchlist_batch_analysis',
        status: 'triggered'
      });
    });

    it('should validate productIds array', async () => {
      const params = {
        userId: 'user-123',
        productIds: []
      };

      await expect(analysisService.requestWatchlistAnalysis(params))
        .rejects.toThrow('관심 상품 목록이 비어있습니다.');
    });

    it('should validate maximum productIds limit', async () => {
      const params = {
        userId: 'user-123',
        productIds: Array(101).fill().map((_, i) => `product-${i}`)
      };

      await expect(analysisService.requestWatchlistAnalysis(params))
        .rejects.toThrow('관심 상품은 최대 100개까지 등록할 수 있습니다.');
    });
  });

  describe('getAnalysisStatus', () => {
    it('should get analysis status successfully', async () => {
      const result = await analysisService.getAnalysisStatus('test-dag', 'test-run-123');

      expect(result).toEqual({
        success: true,
        dagId: 'test-dag',
        dagRunId: 'test-run-123',
        state: 'running',
        progress: {
          total: 5,
          completed: 2,
          failed: 0,
          running: 1,
          percentage: 40
        },
        tasks: expect.arrayContaining([
          expect.objectContaining({
            taskId: 'start_task',
            state: 'success'
          })
        ])
      });
    });

    it('should handle DAG not found error', async () => {
      server.use(
        rest.get('/api/analyze/airflow/status/:dagId/:dagRunId', (req, res, ctx) => {
          return res(
            ctx.status(404),
            ctx.json({
              success: false,
              error: 'DAG Run을 찾을 수 없습니다.'
            })
          );
        })
      );

      await expect(analysisService.getAnalysisStatus('nonexistent-dag', 'nonexistent-run'))
        .rejects.toThrow('DAG Run을 찾을 수 없습니다.');
    });
  });

  describe('getActiveAnalyses', () => {
    it('should get active analyses for user', async () => {
      const result = await analysisService.getActiveAnalyses('user-123');

      expect(result).toEqual({
        success: true,
        analyses: [
          {
            dagId: 'single_product_analysis',
            dagRunId: 'single_test_123',
            type: 'single',
            status: 'running',
            createdAt: '2025-01-01T00:00:00Z'
          }
        ],
        count: 1
      });
    });

    it('should handle empty analyses list', async () => {
      server.use(
        rest.get('/api/analyze/airflow/active/:userId', (req, res, ctx) => {
          return res(
            ctx.json({
              success: true,
              analyses: [],
              count: 0
            })
          );
        })
      );

      const result = await analysisService.getActiveAnalyses('user-with-no-analyses');

      expect(result).toEqual({
        success: true,
        analyses: [],
        count: 0
      });
    });
  });

  describe('getAnalysisResult', () => {
    it('should get analysis result successfully', async () => {
      const result = await analysisService.getAnalysisResult('test-product-123');

      expect(result).toEqual({
        success: true,
        status: 'completed',
        result: {
          productId: 'test-product-123',
          sentiment: {
            positive: 0.6,
            negative: 0.2,
            neutral: 0.2
          },
          summary: '전반적으로 긍정적인 리뷰가 많습니다.',
          keywords: ['품질', '가격', '배송'],
          totalReviews: 150,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T01:00:00Z'
        }
      });
    });

    it('should handle analysis not found', async () => {
      server.use(
        rest.get('/api/analyze/result/:productId', (req, res, ctx) => {
          return res(
            ctx.status(404),
            ctx.json({
              success: false,
              error: '분석 결과를 찾을 수 없습니다.'
            })
          );
        })
      );

      await expect(analysisService.getAnalysisResult('nonexistent-product'))
        .rejects.toThrow('분석 결과를 찾을 수 없습니다.');
    });

    it('should handle incomplete analysis', async () => {
      server.use(
        rest.get('/api/analyze/result/:productId', (req, res, ctx) => {
          return res(
            ctx.json({
              success: false,
              status: 'processing',
              message: '분석이 아직 완료되지 않았습니다.'
            })
          );
        })
      );

      const result = await analysisService.getAnalysisResult('processing-product');

      expect(result).toEqual({
        success: false,
        status: 'processing',
        message: '분석이 아직 완료되지 않았습니다.'
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle timeout errors', async () => {
      server.use(
        rest.post('/api/analyze/airflow/single', (req, res, ctx) => {
          return res(
            ctx.delay(10000), // Simulate timeout
            ctx.json({ success: true })
          );
        })
      );

      const params = {
        productId: 'timeout-product',
        productUrl: 'https://www.coupang.com/vp/products/123456',
        userId: 'user-123'
      };

      // Set a short timeout for testing
      const originalTimeout = analysisService.timeout;
      analysisService.timeout = 100;

      await expect(analysisService.requestSingleProductAnalysis(params))
        .rejects.toThrow('요청 시간이 초과되었습니다.');

      // Restore original timeout
      analysisService.timeout = originalTimeout;
    });

    it('should handle malformed JSON responses', async () => {
      server.use(
        rest.post('/api/analyze/airflow/single', (req, res, ctx) => {
          return res(
            ctx.text('Invalid JSON response')
          );
        })
      );

      const params = {
        productId: 'malformed-response-product',
        productUrl: 'https://www.coupang.com/vp/products/123456',
        userId: 'user-123'
      };

      await expect(analysisService.requestSingleProductAnalysis(params))
        .rejects.toThrow('응답 형식이 올바르지 않습니다.');
    });
  });

  describe('Request Validation', () => {
    it('should validate URL format', async () => {
      const params = {
        productId: 'test-product',
        productUrl: 'invalid-url',
        userId: 'user-123'
      };

      await expect(analysisService.requestSingleProductAnalysis(params))
        .rejects.toThrow('올바른 URL 형식이 아닙니다.');
    });

    it('should validate user ID format', async () => {
      const params = {
        productId: 'test-product',
        productUrl: 'https://www.coupang.com/vp/products/123456',
        userId: ''
      };

      await expect(analysisService.requestSingleProductAnalysis(params))
        .rejects.toThrow('사용자 ID가 필요합니다.');
    });
  });

  describe('Caching', () => {
    it('should cache successful responses', async () => {
      const params = {
        productId: 'cached-product',
        productUrl: 'https://www.coupang.com/vp/products/123456',
        userId: 'user-123'
      };

      // First request
      const result1 = await analysisService.requestSingleProductAnalysis(params);
      
      // Second request should use cache
      const result2 = await analysisService.requestSingleProductAnalysis(params);

      expect(result1).toEqual(result2);
    });

    it('should invalidate cache on error', async () => {
      const params = {
        productId: 'error-then-success-product',
        productUrl: 'https://www.coupang.com/vp/products/123456',
        userId: 'user-123'
      };

      // First request fails
      server.use(
        rest.post('/api/analyze/airflow/single', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ success: false, error: 'Server error' })
          );
        })
      );

      await expect(analysisService.requestSingleProductAnalysis(params))
        .rejects.toThrow();

      // Second request succeeds
      server.use(
        rest.post('/api/analyze/airflow/single', (req, res, ctx) => {
          return res(
            ctx.json({
              success: true,
              message: '분석이 시작되었습니다.',
              dagRunId: 'recovery-dag-run'
            })
          );
        })
      );

      const result = await analysisService.requestSingleProductAnalysis(params);
      expect(result.success).toBe(true);
    });
  });
});