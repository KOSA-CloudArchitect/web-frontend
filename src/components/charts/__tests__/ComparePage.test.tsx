import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ComparePage } from '../../../pages/ComparePage';
import { useInterestStore } from '../../../stores/interestStore';
import { interestAnalysisService } from '../../../services/interestAnalysisService';

// Mock dependencies
jest.mock('../../../stores/interestStore');
jest.mock('../../../services/interestAnalysisService');

const mockUseInterestStore = useInterestStore as jest.MockedFunction<typeof useInterestStore>;
const mockInterestAnalysisService = interestAnalysisService as jest.Mocked<typeof interestAnalysisService>;

const mockInterests = [
  {
    id: '1',
    userId: 'user1',
    productId: 'product1',
    productName: '테스트 상품 1',
    productUrl: 'https://example.com/product1',
    imageUrl: 'https://example.com/image1.jpg',
    currentPrice: 100000,
    originalPrice: 120000,
    rating: 4.5,
    reviewCount: 100,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastAnalyzedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    userId: 'user1',
    productId: 'product2',
    productName: '테스트 상품 2',
    productUrl: 'https://example.com/product2',
    imageUrl: 'https://example.com/image2.jpg',
    currentPrice: 200000,
    originalPrice: 220000,
    rating: 4.0,
    reviewCount: 200,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastAnalyzedAt: '2024-01-01T00:00:00Z',
  },
];

const mockAnalysisData = {
  id: 'analysis1',
  interestId: '1',
  productId: 'product1',
  sentiment: {
    positive: 60,
    negative: 20,
    neutral: 20,
  },
  summary: '전반적으로 좋은 상품입니다.',
  keywords: ['좋음', '품질', '만족'],
  totalReviews: 100,
  ratingDistribution: {
    '1': 5,
    '2': 10,
    '3': 15,
    '4': 30,
    '5': 40,
  },
  sentimentTrend: [
    {
      date: '2024-01-01',
      positive: 30,
      negative: 10,
      neutral: 10,
    },
    {
      date: '2024-01-02',
      positive: 30,
      negative: 10,
      neutral: 10,
    },
  ],
  priceHistory: [
    {
      date: '2024-01-01',
      price: 120000,
    },
    {
      date: '2024-01-02',
      price: 100000,
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const renderWithRouter = (component: React.ReactElement, searchParams = '') => {
  const url = `/compare${searchParams}`;
  window.history.pushState({}, 'Test page', url);
  
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ComparePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseInterestStore.mockReturnValue({
      interests: mockInterests,
      loading: false,
      error: null,
      fetchInterests: jest.fn(),
      addInterest: jest.fn(),
      removeInterest: jest.fn(),
      removeMultipleInterests: jest.fn(),
      updateInterest: jest.fn(),
      clearError: jest.fn(),
    });

    mockInterestAnalysisService.getAnalysis.mockResolvedValue(mockAnalysisData);
  });

  it('선택된 상품이 없을 때 안내 메시지를 표시한다', async () => {
    renderWithRouter(<ComparePage />);

    await waitFor(() => {
      expect(screen.getByText('비교할 상품이 선택되지 않았습니다.')).toBeInTheDocument();
      expect(screen.getByText('관심 상품으로 돌아가기')).toBeInTheDocument();
    });
  });

  it('선택된 상품들을 비교 테이블에 표시한다', async () => {
    renderWithRouter(<ComparePage />, '?id=1&id=2');

    await waitFor(() => {
      expect(screen.getByText('상품 비교')).toBeInTheDocument();
      expect(screen.getByText('선택한 2개 상품을 비교해보세요.')).toBeInTheDocument();
    });

    // 상품 정보가 테이블에 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText('테스트 상품 1')).toBeInTheDocument();
      expect(screen.getByText('테스트 상품 2')).toBeInTheDocument();
      expect(screen.getByText('100,000원')).toBeInTheDocument();
      expect(screen.getByText('200,000원')).toBeInTheDocument();
    });
  });

  it('탭 네비게이션이 올바르게 작동한다', async () => {
    renderWithRouter(<ComparePage />, '?id=1&id=2');

    await waitFor(() => {
      expect(screen.getByText('개요')).toBeInTheDocument();
      expect(screen.getByText('감정 분석')).toBeInTheDocument();
      expect(screen.getByText('별점 분포')).toBeInTheDocument();
      expect(screen.getByText('감정 추이')).toBeInTheDocument();
      expect(screen.getByText('가격 변화')).toBeInTheDocument();
    });
  });

  it('분석 데이터를 로드한다', async () => {
    renderWithRouter(<ComparePage />, '?id=1&id=2');

    await waitFor(() => {
      expect(mockInterestAnalysisService.getAnalysis).toHaveBeenCalledWith('1');
      expect(mockInterestAnalysisService.getAnalysis).toHaveBeenCalledWith('2');
    });
  });

  it('로딩 상태를 표시한다', () => {
    mockUseInterestStore.mockReturnValue({
      interests: [],
      loading: true,
      error: null,
      fetchInterests: jest.fn(),
      addInterest: jest.fn(),
      removeInterest: jest.fn(),
      removeMultipleInterests: jest.fn(),
      updateInterest: jest.fn(),
      clearError: jest.fn(),
    });

    renderWithRouter(<ComparePage />);

    expect(screen.getByRole('status')).toBeInTheDocument(); // LoadingSpinner
  });
});