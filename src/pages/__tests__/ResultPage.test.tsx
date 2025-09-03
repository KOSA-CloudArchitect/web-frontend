import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResultPage from '../ResultPage';

// Mock services
jest.mock('../../services/api', () => ({
  apiService: {
    getProduct: jest.fn(),
    getAnalysisResult: jest.fn(),
  },
}));

// Mock react-router-dom
const mockUseParams = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
}));

// Mock components
jest.mock('../../components/NavBar', () => {
  return function MockNavBar({ title }: { title: string }) {
    return <div data-testid="navbar">{title}</div>;
  };
});

jest.mock('../../components/BottomBar', () => {
  return function MockBottomBar() {
    return <div data-testid="bottombar">BottomBar</div>;
  };
});

// Mock recharts
jest.mock('recharts', () => ({
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

const mockApiService = require('../../services/api').apiService;

describe('ResultPage', () => {
  const mockProduct = {
    id: 'test-product-123',
    name: '테스트 상품',
    brand: '테스트 브랜드',
    price: 50000,
    rating: 4.5,
    review_count: 150,
    image_url: 'https://example.com/image.jpg',
  };

  const mockAnalysisResult = {
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ id: 'test-product-123' });
  });

  const renderResultPage = () => {
    return render(
      <BrowserRouter>
        <ResultPage />
      </BrowserRouter>
    );
  };

  it('should render loading state initially', () => {
    mockApiService.getProduct.mockImplementation(() => new Promise(() => {}));
    mockApiService.getAnalysisResult.mockImplementation(() => new Promise(() => {}));

    renderResultPage();

    expect(screen.getByText('분석 결과를 불러오는 중입니다')).toBeInTheDocument();
  });

  it('should display product info and analysis results', async () => {
    mockApiService.getProduct.mockResolvedValueOnce(mockProduct);
    mockApiService.getAnalysisResult.mockResolvedValueOnce(mockAnalysisResult);

    renderResultPage();

    await waitFor(() => {
      expect(screen.getByText('테스트 상품')).toBeInTheDocument();
    });

    expect(screen.getByText('테스트 브랜드')).toBeInTheDocument();
    expect(screen.getByText('50,000원')).toBeInTheDocument();
    expect(screen.getByText('감정 분석')).toBeInTheDocument();
  });

  it('should handle summary filter changes', async () => {
    mockApiService.getProduct.mockResolvedValueOnce(mockProduct);
    mockApiService.getAnalysisResult.mockResolvedValueOnce(mockAnalysisResult);

    renderResultPage();

    await waitFor(() => {
      expect(screen.getByText('리뷰 전체 요약')).toBeInTheDocument();
    });

    const positiveButton = screen.getByText('긍정');
    fireEvent.click(positiveButton);

    await waitFor(() => {
      expect(screen.getByText('긍정 분석')).toBeInTheDocument();
    });
  });

  it('should show error when analysis failed', async () => {
    mockApiService.getProduct.mockResolvedValueOnce(mockProduct);
    mockApiService.getAnalysisResult.mockResolvedValueOnce({
      success: false,
      status: 'failed',
      message: '분석에 실패했습니다.',
    });

    renderResultPage();

    await waitFor(() => {
      expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
    });
  });

  it('should handle API errors', async () => {
    mockApiService.getProduct.mockRejectedValueOnce(new Error('상품 정보를 불러올 수 없습니다.'));
    mockApiService.getAnalysisResult.mockRejectedValueOnce(new Error('분석 결과를 불러올 수 없습니다.'));

    renderResultPage();

    await waitFor(() => {
      expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
    });
  });

  it('should handle missing product ID', async () => {
    mockUseParams.mockReturnValue({ id: undefined });

    renderResultPage();

    await waitFor(() => {
      expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
    });
  });
});