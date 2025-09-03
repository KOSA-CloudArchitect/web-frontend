import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewList } from '../ReviewList';
import { Review } from '../../stores/analysisStore';

// Zustand store mock
jest.mock('../../stores/analysisStore', () => ({
  useAnalysisStore: () => ({
    filters: {
      sentiment: 'all',
      rating: 'all',
      dateRange: 'all',
      searchKeyword: '',
    },
    setFilters: jest.fn(),
  }),
}));

describe('ReviewList', () => {
  const mockReviews: Review[] = [
    {
      id: '1',
      content: '정말 좋은 상품입니다.',
      rating: 5,
      sentiment: 'positive',
      date: '2024-01-15',
      author: '사용자1',
    },
    {
      id: '2',
      content: '배송이 느렸습니다.',
      rating: 2,
      sentiment: 'negative',
      date: '2024-01-10',
      author: '사용자2',
    },
  ];

  it('리뷰 목록이 올바르게 렌더링된다', () => {
    render(<ReviewList reviews={mockReviews} />);
    
    expect(screen.getByText('리뷰 목록')).toBeInTheDocument();
    expect(screen.getByText('정말 좋은 상품입니다.')).toBeInTheDocument();
    expect(screen.getByText('배송이 느렸습니다.')).toBeInTheDocument();
  });

  it('빈 리뷰 배열을 처리한다', () => {
    render(<ReviewList reviews={[]} />);
    
    expect(screen.getByText('리뷰가 없습니다')).toBeInTheDocument();
    expect(screen.getByText('아직 분석된 리뷰 데이터가 없습니다.')).toBeInTheDocument();
  });

  it('통계 정보가 올바르게 표시된다', () => {
    render(<ReviewList reviews={mockReviews} />);
    
    expect(screen.getByText('총 2개 리뷰')).toBeInTheDocument();
  });

  it('필터 컴포넌트가 포함된다', () => {
    render(<ReviewList reviews={mockReviews} />);
    
    expect(screen.getByText('리뷰 필터')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('리뷰 내용 검색...')).toBeInTheDocument();
  });
});