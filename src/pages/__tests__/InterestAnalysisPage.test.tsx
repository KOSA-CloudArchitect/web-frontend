import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { InterestAnalysisPage } from '../InterestAnalysisPage';
import { useInterestStore } from '../../stores/interestStore';
import { useInterestAnalysisStore } from '../../stores/interestAnalysisStore';
import { InterestProduct, InterestAnalysisData } from '../../types';

// Mock the stores
jest.mock('../../stores/interestStore');
jest.mock('../../stores/interestAnalysisStore');

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'test-interest-id' }),
  useNavigate: () => mockNavigate,
}));

// Mock chart components
jest.mock('../../components/charts/SentimentPieChart', () => ({
  SentimentPieChart: ({ data }: any) => (
    <div data-testid="sentiment-pie-chart">
      Sentiment Chart: {data.positive}/{data.negative}/{data.neutral}
    </div>
  ),
}));

jest.mock('../../components/charts/RatingDistributionChart', () => ({
  RatingDistributionChart: ({ data }: any) => (
    <div data-testid="rating-distribution-chart">
      Rating Chart: {JSON.stringify(data)}
    </div>
  ),
}));

jest.mock('../../components/charts/SentimentTrendChart', () => ({
  SentimentTrendChart: ({ data }: any) => (
    <div data-testid="sentiment-trend-chart">
      Trend Chart: {data.length} items
    </div>
  ),
}));

jest.mock('../../components/charts/PriceHistoryChart', () => ({
  PriceHistoryChart: ({ data }: any) => (
    <div data-testid="price-history-chart">
      Price Chart: {data.length} items
    </div>
  ),
}));

jest.mock('../../components/KeywordCloud', () => ({
  KeywordCloud: ({ keywords }: any) => (
    <div data-testid="keyword-cloud">
      Keywords: {keywords.join(', ')}
    </div>
  ),
}));

const mockInterest: InterestProduct = {
  id: 'test-interest-id',
  userId: 'user1',
  productId: 'product1',
  productName: '테스트 상품',
  productUrl: 'https://example.com/product1',
  imageUrl: 'https://example.com/image1.jpg',
  currentPrice: 10000,
  originalPrice: 12000,
  rating: 4.5,
  reviewCount: 100,
  isActive: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  lastAnalyzedAt: '2023-01-01T00:00:00Z',
};

const mockAnalysisData: InterestAnalysisData = {
  id: 'analysis1',
  interestId: 'test-interest-id',
  productId: 'product1',
  sentiment: {
    positive: 60,
    negative: 20,
    neutral: 20,
  },
  summary: '전반적으로 긍정적인 리뷰가 많습니다.',
  keywords: ['좋음', '품질', '배송'],
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
      date: '2023-01-01',
      positive: 20,
      negative: 5,
      neutral: 5,
    },
    {
      date: '2023-01-02',
      positive: 40,
      negative: 15,
      neutral: 15,
    },
  ],
  priceHistory: [
    {
      date: '2023-01-01',
      price: 12000,
    },
    {
      date: '2023-01-02',
      price: 10000,
    },
  ],
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

const mockUseInterestStore = useInterestStore as jest.MockedFunction<typeof useInterestStore>;
const mockUseInterestAnalysisStore = useInterestAnalysisStore as jest.MockedFunction<typeof useInterestAnalysisStore>;

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('InterestAnalysisPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseInterestStore.mockReturnValue({
      interests: [mockInterest],
      loading: false,
      error: null,
      fetchInterests: jest.fn(),
      addInterest: jest.fn(),
      removeInterest: jest.fn(),
      removeMultipleInterests: jest.fn(),
      clearError: jest.fn(),
    });

    mockUseInterestAnalysisStore.mockReturnValue({
      analysisData: null,
      analysisStatus: null,
      loading: false,
      error: null,
      currentTaskId: null,
      fetchAnalysis: jest.fn(),
      requestAnalysis: jest.fn(),
      updateAnalysisStatus: jest.fn(),
      clearAnalysis: jest.fn(),
      clearError: jest.fn(),
    });
  });

  it('관심 상품 정보를 표시한다', () => {
    renderWithRouter(<InterestAnalysisPage />);
    
    expect(screen.getByText('테스트 상품')).toBeInTheDocument();
    expect(screen.getByText('10,000원')).toBeInTheDocument();
    expect(screen.getByText('4.5점')).toBeInTheDocument();
    expect(screen.getByText('100개')).toBeInTheDocument();
  });

  it('분석 데이터가 없을 때 분석 시작 버튼을 표시한다', () => {
    renderWithRouter(<InterestAnalysisPage />);
    
    expect(screen.getByText('분석 데이터가 없습니다')).toBeInTheDocument();
    expect(screen.getByText('분석 시작')).toBeInTheDocument();
  });

  it('분석 시작 버튼을 클릭하면 분석을 요청한다', async () => {
    const mockRequestAnalysis = jest.fn().mockResolvedValue(true);
    
    mockUseInterestAnalysisStore.mockReturnValue({
      analysisData: null,
      analysisStatus: null,
      loading: false,
      error: null,
      currentTaskId: null,
      fetchAnalysis: jest.fn(),
      requestAnalysis: mockRequestAnalysis,
      updateAnalysisStatus: jest.fn(),
      clearAnalysis: jest.fn(),
      clearError: jest.fn(),
    });

    renderWithRouter(<InterestAnalysisPage />);
    
    const startButton = screen.getByText('분석 시작');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(mockRequestAnalysis).toHaveBeenCalledWith('test-interest-id');
    });
  });

  it('분석 데이터가 있을 때 탭과 차트를 표시한다', () => {
    mockUseInterestAnalysisStore.mockReturnValue({
      analysisData: mockAnalysisData,
      analysisStatus: null,
      loading: false,
      error: null,
      currentTaskId: null,
      fetchAnalysis: jest.fn(),
      requestAnalysis: jest.fn(),
      updateAnalysisStatus: jest.fn(),
      clearAnalysis: jest.fn(),
      clearError: jest.fn(),
    });

    renderWithRouter(<InterestAnalysisPage />);
    
    // 탭 확인
    expect(screen.getByText('📊 개요')).toBeInTheDocument();
    expect(screen.getByText('😊 감정 분석')).toBeInTheDocument();
    expect(screen.getByText('⭐ 별점 분포')).toBeInTheDocument();
    expect(screen.getByText('📈 감정 추이')).toBeInTheDocument();
    expect(screen.getByText('💰 가격 변화')).toBeInTheDocument();
    
    // 차트 확인
    expect(screen.getByTestId('sentiment-pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('keyword-cloud')).toBeInTheDocument();
    
    // 요약 텍스트 확인
    expect(screen.getByText('전반적으로 긍정적인 리뷰가 많습니다.')).toBeInTheDocument();
  });

  it('탭을 클릭하면 해당 차트를 표시한다', () => {
    mockUseInterestAnalysisStore.mockReturnValue({
      analysisData: mockAnalysisData,
      analysisStatus: null,
      loading: false,
      error: null,
      currentTaskId: null,
      fetchAnalysis: jest.fn(),
      requestAnalysis: jest.fn(),
      updateAnalysisStatus: jest.fn(),
      clearAnalysis: jest.fn(),
      clearError: jest.fn(),
    });

    renderWithRouter(<InterestAnalysisPage />);
    
    // 별점 분포 탭 클릭
    const ratingTab = screen.getByText('⭐ 별점 분포');
    fireEvent.click(ratingTab);
    
    expect(screen.getByTestId('rating-distribution-chart')).toBeInTheDocument();
    
    // 감정 추이 탭 클릭
    const trendTab = screen.getByText('📈 감정 추이');
    fireEvent.click(trendTab);
    
    expect(screen.getByTestId('sentiment-trend-chart')).toBeInTheDocument();
    
    // 가격 변화 탭 클릭
    const priceTab = screen.getByText('💰 가격 변화');
    fireEvent.click(priceTab);
    
    expect(screen.getByTestId('price-history-chart')).toBeInTheDocument();
  });

  it('에러가 발생했을 때 에러 메시지를 표시한다', () => {
    mockUseInterestAnalysisStore.mockReturnValue({
      analysisData: null,
      analysisStatus: null,
      loading: false,
      error: '분석 요청에 실패했습니다.',
      currentTaskId: null,
      fetchAnalysis: jest.fn(),
      requestAnalysis: jest.fn(),
      updateAnalysisStatus: jest.fn(),
      clearAnalysis: jest.fn(),
      clearError: jest.fn(),
    });

    renderWithRouter(<InterestAnalysisPage />);
    
    expect(screen.getByText('분석 요청에 실패했습니다.')).toBeInTheDocument();
    expect(screen.getByText('다시 시도')).toBeInTheDocument();
  });

  it('관심 상품이 없을 때 에러 페이지를 표시한다', () => {
    mockUseInterestStore.mockReturnValue({
      interests: [],
      loading: false,
      error: null,
      fetchInterests: jest.fn(),
      addInterest: jest.fn(),
      removeInterest: jest.fn(),
      removeMultipleInterests: jest.fn(),
      clearError: jest.fn(),
    });

    renderWithRouter(<InterestAnalysisPage />);
    
    expect(screen.getByText('관심 상품을 찾을 수 없습니다')).toBeInTheDocument();
    expect(screen.getByText('관심 상품 목록으로 돌아가기')).toBeInTheDocument();
  });
});