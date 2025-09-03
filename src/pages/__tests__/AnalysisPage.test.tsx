import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AnalysisPage from '../AnalysisPage';

// Mock services
jest.mock('../../services/api', () => {
  class MockApiError extends Error {
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
    status: number;
  }

  return {
    apiService: {
      getAnalysisStatus: jest.fn(),
      requestAnalysis: jest.fn(),
      requestDummyAnalysis: jest.fn(),
    },
    ApiError: MockApiError,
  };
});

// Mock hooks
jest.mock('../../hooks/useWebSocket', () => ({
  useWebSocket: jest.fn().mockReturnValue({
    socket: null,
    isConnected: false,
    connect: jest.fn(),
    disconnect: jest.fn(),
    reconnect: jest.fn(),
  }),
}));

// Mock stores
jest.mock('../../stores/realtimeAnalysisStore', () => ({
  useRealtimeActions: jest.fn(() => ({
    reset: jest.fn(),
  })),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
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

jest.mock('../../components/RealtimeProgressIndicator', () => {
  return function MockRealtimeProgressIndicator() {
    return <div data-testid="progress-indicator">Progress Indicator</div>;
  };
});

jest.mock('../../components/RealtimeEmotionCards', () => {
  return function MockRealtimeEmotionCards() {
    return <div data-testid="emotion-cards">Emotion Cards</div>;
  };
});

jest.mock('../../components/RealtimeAnalysisChart', () => {
  return function MockRealtimeAnalysisChart() {
    return <div data-testid="analysis-chart">Analysis Chart</div>;
  };
});

const mockApiService = require('../../services/api').apiService;

describe('AnalysisPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocation.mockReturnValue({
      search: '?productId=test-product-123',
    });
  });

  const renderAnalysisPage = () => {
    return render(
      <BrowserRouter>
        <AnalysisPage />
      </BrowserRouter>
    );
  };

  it('should render loading state initially', () => {
    mockApiService.getAnalysisStatus.mockImplementation(() => new Promise(() => {}));

    renderAnalysisPage();

    expect(screen.getByText('분석을 준비 중입니다...')).toBeInTheDocument();
  });

  it('should show analysis in progress', async () => {
    mockApiService.getAnalysisStatus.mockResolvedValueOnce({
      status: 'processing',
      progress: 50,
      estimatedTime: 60,
    });

    renderAnalysisPage();

    await waitFor(() => {
      expect(screen.getByText('실시간 리뷰 분석')).toBeInTheDocument();
    });
  });

  it('should navigate to result when analysis is completed', async () => {
    mockApiService.getAnalysisStatus.mockResolvedValueOnce({
      status: 'completed',
      progress: 100,
    });

    renderAnalysisPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/result/test-product-123');
    });
  });

  it('should show error when analysis fails', async () => {
    mockApiService.getAnalysisStatus.mockResolvedValueOnce({
      status: 'failed',
      progress: 0,
      error: '분석에 실패했습니다.',
    });

    renderAnalysisPage();

    await waitFor(() => {
      expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
    });
  });

  it('should handle API errors', async () => {
    mockApiService.getAnalysisStatus.mockRejectedValueOnce(
      new Error('네트워크 오류가 발생했습니다.')
    );

    renderAnalysisPage();

    await waitFor(() => {
      expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
    });
  });

  it('should handle dummy analysis', async () => {
    mockUseLocation.mockReturnValue({
      search: '?dummy=true',
    });

    mockApiService.requestDummyAnalysis.mockResolvedValueOnce({
      success: true,
      message: '더미 분석이 시작되었습니다.',
      taskId: 'dummy-task-123',
    });

    renderAnalysisPage();

    await waitFor(() => {
      expect(mockApiService.requestDummyAnalysis).toHaveBeenCalled();
    });
  });

  it('should navigate to home when no productId', () => {
    mockUseLocation.mockReturnValue({
      search: '',
    });

    renderAnalysisPage();

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});