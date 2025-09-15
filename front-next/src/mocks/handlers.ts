import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth handlers
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as any;
    const { email, password } = body;

    // 간단한 로그인 검증 (테스트용)
    if (email && password) {
      return HttpResponse.json({
        success: true,
        message: '로그인 성공',
        data: {
          user: {
            id: 'test-user-id',
            email: email,
            role: 'user',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            isActive: true,
          },
          accessToken: 'mock-jwt-token',
          tokenType: 'Bearer',
          expiresIn: 3600,
        },
      });
    }

    return HttpResponse.json(
      {
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      },
      { status: 401 }
    );
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json() as any;
    const { email, password, confirmPassword } = body;

    if (!email || !password) {
      return HttpResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: '이메일과 비밀번호를 입력해주세요.',
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return HttpResponse.json(
        {
          success: false,
          error: 'PASSWORD_MISMATCH',
          message: '비밀번호가 일치하지 않습니다.',
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        user: {
          id: 'new-user-id',
          email: email,
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
        },
        accessToken: 'mock-jwt-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      },
    });
  }),

  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          error: '인증 토큰이 필요합니다.',
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          role: 'user',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          isActive: true,
        },
        accessToken: 'mock-jwt-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      },
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({
      success: true,
      message: '로그아웃되었습니다.',
    });
  }),

  http.post('/api/auth/logout-all', () => {
    return HttpResponse.json({
      success: true,
      message: '모든 세션에서 로그아웃되었습니다.',
    });
  }),

  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({
      success: true,
      token: 'new-mock-jwt-token',
      refreshToken: 'new-mock-refresh-token',
    });
  }),

  // Product search handlers
  http.get('/api/products/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    
    if (!query) {
      return HttpResponse.json(
        {
          success: false,
          error: '검색어를 입력해주세요.',
        },
        { status: 400 }
      );
    }

    // Mock search results
    const mockProducts = [
      {
        id: 'product-1',
        name: `${query} 상품 1`,
        price: 29900,
        rating: 4.5,
        reviewCount: 128,
        imageUrl: 'https://example.com/product1.jpg',
      },
      {
        id: 'product-2',
        name: `${query} 상품 2`,
        price: 15900,
        rating: 4.2,
        reviewCount: 89,
        imageUrl: 'https://example.com/product2.jpg',
      },
    ];

    return HttpResponse.json({
      success: true,
      products: mockProducts,
      total: mockProducts.length,
    });
  }),

  // Analysis handlers
  http.post('/api/analyze/airflow/single', () => {
    return HttpResponse.json({
      success: true,
      message: '분석이 시작되었습니다.',
      dagId: 'single_product_analysis',
      dagRunId: 'mock-run-id-123',
    });
  }),

  http.post('/api/analyze/airflow/multi', () => {
    return HttpResponse.json({
      success: true,
      message: '다중 상품 분석이 시작되었습니다.',
      dagId: 'multi_product_analysis',
      dagRunId: 'mock-run-id-456',
    });
  }),

  http.post('/api/analyze/airflow/watchlist', () => {
    return HttpResponse.json({
      success: true,
      message: '관심 상품 분석이 시작되었습니다.',
      dagId: 'watchlist_analysis',
      dagRunId: 'mock-run-id-789',
    });
  }),

  http.get('/api/analyze/airflow/status/:dagId/:dagRunId', ({ params }) => {
    const { dagId, dagRunId } = params;

    return HttpResponse.json({
      success: true,
      status: 'success',
      dagId,
      dagRunId,
      state: 'success',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-01-01T00:05:00Z',
      duration: 300,
    });
  }),

  http.get('/api/analyze/result/:productId', ({ params }) => {
    const { productId } = params;

    return HttpResponse.json({
      success: true,
      productId,
      analysis: {
        sentiment: {
          positive: 75,
          negative: 15,
          neutral: 10,
        },
        summary: '이 상품은 전반적으로 긍정적인 리뷰를 받고 있으며, 품질과 가격 대비 만족도가 높습니다.',
        keywords: [
          { word: '품질', count: 45 },
          { word: '가격', count: 32 },
          { word: '배송', count: 28 },
          { word: '디자인', count: 25 },
        ],
        totalReviews: 128,
        averageRating: 4.5,
      },
    });
  }),

  http.get('/api/analyze/airflow/active/:userId', ({ params }) => {
    const { userId } = params;

    return HttpResponse.json({
      success: true,
      activeRuns: [
        {
          dagId: 'single_product_analysis',
          dagRunId: 'mock-run-id-123',
          state: 'running',
          startDate: '2024-01-01T00:00:00Z',
        },
      ],
    });
  }),

  // Interest Product handlers
  http.get('/api/interests', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          error: '인증 토큰이 필요합니다.',
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'interest-1',
          userId: 'test-user-id',
          productId: 'product-1',
          productName: '아이폰 15 Pro 128GB',
          productUrl: 'https://www.coupang.com/vp/products/123456',
          imageUrl: 'https://example.com/iphone15.jpg',
          currentPrice: 1290000,
          originalPrice: 1390000,
          rating: 4.5,
          reviewCount: 1250,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          lastAnalyzedAt: '2024-01-01T12:00:00Z',
        },
        {
          id: 'interest-2',
          userId: 'test-user-id',
          productId: 'product-2',
          productName: '삼성 갤럭시 S24 Ultra 256GB',
          productUrl: 'https://www.coupang.com/vp/products/789012',
          imageUrl: 'https://example.com/galaxy-s24.jpg',
          currentPrice: 1450000,
          originalPrice: 1550000,
          rating: 4.3,
          reviewCount: 890,
          isActive: true,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
          lastAnalyzedAt: '2024-01-02T12:00:00Z',
        },
      ],
    });
  }),

  http.post('/api/interests', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          error: '인증 토큰이 필요합니다.',
        },
        { status: 401 }
      );
    }

    const body = await request.json() as any;
    const { productUrl, productName } = body;

    if (!productUrl) {
      return HttpResponse.json(
        {
          success: false,
          message: '상품 URL을 입력해주세요.',
        },
        { status: 400 }
      );
    }

    // 쿠팡 URL 유효성 검사
    const coupangUrlPattern = /^https?:\/\/(www\.)?coupang\.com\/(vp\/products\/\d+|products\/\d+)/;
    if (!coupangUrlPattern.test(productUrl)) {
      return HttpResponse.json(
        {
          success: false,
          message: '올바른 쿠팡 상품 URL을 입력해주세요.',
        },
        { status: 400 }
      );
    }

    // 새로운 관심 상품 생성
    const newInterest = {
      id: `interest-${Date.now()}`,
      userId: 'test-user-id',
      productId: `product-${Date.now()}`,
      productName: productName || '새로운 상품',
      productUrl,
      imageUrl: 'https://example.com/new-product.jpg',
      currentPrice: 99000,
      originalPrice: 120000,
      rating: 4.0,
      reviewCount: 50,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      data: newInterest,
      message: '관심 상품이 등록되었습니다.',
    });
  }),

  http.delete('/api/interests/:interestId', ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          error: '인증 토큰이 필요합니다.',
        },
        { status: 401 }
      );
    }

    const { interestId } = params;

    return HttpResponse.json({
      success: true,
      message: '관심 상품이 삭제되었습니다.',
    });
  }),

  http.get('/api/interests/:interestId', ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          error: '인증 토큰이 필요합니다.',
        },
        { status: 401 }
      );
    }

    const { interestId } = params;

    return HttpResponse.json({
      success: true,
      data: {
        id: interestId,
        userId: 'test-user-id',
        productId: 'product-1',
        productName: '테스트 상품',
        productUrl: 'https://www.coupang.com/vp/products/123456',
        imageUrl: 'https://example.com/test-product.jpg',
        currentPrice: 99000,
        originalPrice: 120000,
        rating: 4.0,
        reviewCount: 50,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    });
  }),

  // Legacy Watchlist handlers (for backward compatibility)
  http.get('/api/watchlist', () => {
    return HttpResponse.json({
      success: true,
      watchlist: [
        {
          id: 'watch-1',
          productId: 'product-1',
          productName: '테스트 상품 1',
          addedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'watch-2',
          productId: 'product-2',
          productName: '테스트 상품 2',
          addedAt: '2024-01-01T00:00:00Z',
        },
      ],
    });
  }),

  http.post('/api/watchlist', () => {
    return HttpResponse.json({
      success: true,
      message: '관심 상품에 추가되었습니다.',
    });
  }),

  // Error handlers for testing
  http.get('/api/error/500', () => {
    return HttpResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
      },
      { status: 500 }
    );
  }),

  http.get('/api/error/404', () => {
    return HttpResponse.json(
      {
        success: false,
        error: 'Not Found',
      },
      { status: 404 }
    );
  }),

  http.get('/api/error/network', () => {
    return HttpResponse.error();
  }),
];