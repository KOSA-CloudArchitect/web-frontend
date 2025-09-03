import React from 'react';
import { render, screen } from '@testing-library/react';
import { RealtimeEmotionCards } from '../RealtimeEmotionCards';
import { useEmotionCards } from '../../stores/realtimeAnalysisStore';

// Mock the store hook
jest.mock('../../stores/realtimeAnalysisStore');

describe('RealtimeEmotionCards', () => {
  const mockUseEmotionCards = useEmotionCards as jest.MockedFunction<typeof useEmotionCards>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render empty state when no cards', () => {
    mockUseEmotionCards.mockReturnValue([]);
    
    render(<RealtimeEmotionCards />);
    
    expect(screen.getByText('실시간 감정 분석')).toBeInTheDocument();
    expect(screen.getByText('분석 결과를 기다리는 중...')).toBeInTheDocument();
  });

  it('should render emotion cards when available', () => {
    const mockCards = [
      {
        id: '1',
        sentiment: 'positive' as const,
        content: '정말 좋은 제품이에요!',
        keywords: ['좋은', '제품'],
        confidence: 0.9,
        timestamp: '2024-01-01T12:00:00Z',
        color: 'bg-green-100 border-green-300 text-green-800',
      },
      {
        id: '2',
        sentiment: 'negative' as const,
        content: '배송이 늦었어요.',
        keywords: ['배송', '늦음'],
        confidence: 0.8,
        timestamp: '2024-01-01T12:01:00Z',
        color: 'bg-red-100 border-red-300 text-red-800',
      },
    ];

    mockUseEmotionCards.mockReturnValue(mockCards);
    
    render(<RealtimeEmotionCards />);
    
    expect(screen.getByText('실시간 감정 분석')).toBeInTheDocument();
    expect(screen.getByText('(2개 분석됨)')).toBeInTheDocument();
    expect(screen.getByText('정말 좋은 제품이에요!')).toBeInTheDocument();
    expect(screen.getByText('배송이 늦었어요.')).toBeInTheDocument();
    expect(screen.getByText('긍정')).toBeInTheDocument();
    expect(screen.getByText('부정')).toBeInTheDocument();
  });

  it('should display keywords correctly', () => {
    const mockCards = [
      {
        id: '1',
        sentiment: 'positive' as const,
        content: '테스트 내용',
        keywords: ['키워드1', '키워드2', '키워드3', '키워드4', '키워드5', '키워드6'],
        confidence: 0.9,
        timestamp: '2024-01-01T12:00:00Z',
        color: 'bg-green-100 border-green-300 text-green-800',
      },
    ];

    mockUseEmotionCards.mockReturnValue(mockCards);
    
    render(<RealtimeEmotionCards />);
    
    // 처음 5개 키워드만 표시되고 나머지는 +1로 표시
    expect(screen.getByText('#키워드1')).toBeInTheDocument();
    expect(screen.getByText('#키워드5')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('should format timestamp correctly', () => {
    const mockCards = [
      {
        id: '1',
        sentiment: 'neutral' as const,
        content: '테스트 내용',
        keywords: [],
        confidence: 0.7,
        timestamp: '2024-01-01T15:30:45Z',
        color: 'bg-gray-100 border-gray-300 text-gray-800',
      },
    ];

    mockUseEmotionCards.mockReturnValue(mockCards);
    
    render(<RealtimeEmotionCards />);
    
    // 시간 형식이 올바르게 표시되는지 확인 (로케일에 따라 다를 수 있음)
    expect(screen.getByText(/\d{1,2}:\d{2}:\d{2}/)).toBeInTheDocument();
  });
});