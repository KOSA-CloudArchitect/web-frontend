import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AnalysisPage from '../pages/AnalysisPage';
import ResultPage from '../pages/ResultPage';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    search: '?productId=test-product-123',
  }),
  useParams: () => ({ id: 'test-product-123' }),
}));

// Mock components
jest.mock('../components/NavBar', () => {
  return function MockNavBar({ title }: { title: string }) {
    return <div data-testid="navbar">{title}</div>;
  };
});

jest.mock('../components/BottomBar', () => {
  return function MockBottomBar() {
    return <div data-testid="bottombar">BottomBar</div>;
  };
});

// Mock services
jest.mock('../services/api');
jest.mock('../services/websocket', () => ({
  webSocketService: {
    subscribeToAnalysis: jest.fn(() => jest.fn()),
    connect: jest.fn(),
    disconnect: jest.fn(),
    isConnected: jest.fn().mockReturnValue(true),
  },
}));

// Mock recharts
jest.mock('recharts', () => ({
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

const mockApiService = require('../services/api').apiService as jest.Mocked<typeof import('../services/api').apiService>;

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock 사용하지 않도록 설정
    process.env.REACT_APP_USE_MOCK_WS = 'false';
    
    // Setup default API mocks
    mockApiService.getAnalysisStatus.mockResolvedValue({
      status: 'processing',
      progress: 50,
      estimatedTime: 60,
    });
    
    mockApiService.requestAnalysis.mockResolvedValue({
      success: true,
      message: '분석이 시작되었습니다.',
      taskId: 'task-123',
      estimatedTime: 120,
    });
    
    mockApiService.getProduct.mockResolvedValue({
      id: 'test-product-123',
      name: '테스트 상품',
      brand: '테스트 브랜드',
      price: 50000,
      rating: 4.5,
      review_count: 150,
      image_url: 'https://example.com/image.jpg',
    });
    
    mockApiService.getAnalysisResult.mockResolvedValue({
      success: true,
      status: 'completed',
      result: {
        productId: 'test-product-123',
        sentiment: { positive: 70, negative: 20, neutral: 10 },
        summary: '전반적으로 긍정적인 평가를 받고 있는 상품입니다.',
        keywords: ['quality', 'price', 'delivery'],
        totalReviews: 150,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:05:00Z',
      },
    });
  });

  describe('Analysis Flow', () => {
    it('should render analysis page with loading state', async () => {
      render(
        <BrowserRouter>
          <AnalysisPage />
        </BrowserRouter>
      );

      // Should show loading initially
      expect(screen.getByText('분석을 준비 중입니다...')).toBeInTheDocument();
    });

    it('should show analysis in progress', async () => {
      await act(async () => {
        render(
          <BrowserRouter>
            <AnalysisPage />
          </BrowserRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('실시간 리뷰 분석')).toBeInTheDocument();
      });
    });
  });

  describe('Result Display', () => {
    it('should render result page', async () => {
      render(
        <BrowserRouter>
          <ResultPage />
        </BrowserRouter>
      );

      // Should show loading initially
      expect(screen.getByText('분석 결과를 불러오는 중입니다')).toBeInTheDocument();
    });

    it('should display analysis results', async () => {
      await act(async () => {
        render(
          <BrowserRouter>
            <ResultPage />
          </BrowserRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('테스트 상품')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle analysis errors', async () => {
      mockApiService.getAnalysisStatus.mockRejectedValueOnce(
        new Error('네트워크 오류가 발생했습니다.')
      );

      render(
        <BrowserRouter>
          <AnalysisPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
      });
    });

    it('should handle result page errors', async () => {
      mockApiService.getProduct.mockRejectedValueOnce(
        new Error('상품 정보를 불러올 수 없습니다.')
      );
      mockApiService.getAnalysisResult.mockRejectedValueOnce(
        new Error('분석 결과를 불러올 수 없습니다.')
      );

      render(
        <BrowserRouter>
          <ResultPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
      });
    });
  });
});