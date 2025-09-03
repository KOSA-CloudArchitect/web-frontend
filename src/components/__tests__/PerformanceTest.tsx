import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ReviewList } from '../ReviewList';
import { Review } from '../../stores/analysisStore';
import { PerformanceMonitor } from '../../utils/performanceUtils';

// Mock Zustand store
jest.mock('../../stores/analysisStore', () => ({
  useAnalysisFilters: () => ({
    sentiment: 'all',
    rating: 'all',
    dateRange: 'all',
    searchKeyword: '',
  }),
  useAnalysisActions: () => ({
    setFilters: jest.fn(),
  }),
}));

describe('Performance Tests', () => {
  // 대량의 테스트 데이터 생성
  const generateMockReviews = (count: number): Review[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `review-${i}`,
      content: `테스트 리뷰 내용 ${i}. 이것은 성능 테스트를 위한 샘플 리뷰입니다.`,
      rating: Math.floor(Math.random() * 5) + 1,
      sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as any,
      date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      author: `사용자${i}`,
    }));
  };

  it('대량 리뷰 렌더링 성능 테스트 (1000개)', async () => {
    const reviews = generateMockReviews(1000);
    
    const startTime = performance.now();
    const { container } = render(<ReviewList reviews={reviews} />);
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    console.log(`🚀 1000개 리뷰 렌더링 시간: ${renderTime.toFixed(2)}ms`);
    
    // 렌더링 시간이 500ms 이하여야 함
    expect(renderTime).toBeLessThan(500);
    expect(container).toBeInTheDocument();
  });

  it('필터 변경 성능 테스트', async () => {
    const reviews = generateMockReviews(500);
    const mockSetFilters = jest.fn();
    
    // Mock 업데이트
    jest.doMock('../../stores/analysisStore', () => ({
      useAnalysisFilters: () => ({
        sentiment: 'all',
        rating: 'all',
        dateRange: 'all',
        searchKeyword: '',
      }),
      useAnalysisActions: () => ({
        setFilters: mockSetFilters,
      }),
    }));

    const { getByDisplayValue } = render(<ReviewList reviews={reviews} />);
    
    // 감성 필터 변경 성능 측정
    PerformanceMonitor.startMeasurement('filter-change');
    
    const sentimentSelect = getByDisplayValue('전체');
    fireEvent.change(sentimentSelect, { target: { value: 'positive' } });
    
    const filterTime = PerformanceMonitor.endMeasurement('filter-change');
    
    // 필터 변경이 200ms 이하여야 함
    expect(filterTime).toBeLessThan(200);
  });

  it('메모리 사용량 테스트', () => {
    const reviews = generateMockReviews(100);
    
    // 초기 메모리 측정
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    const { unmount } = render(<ReviewList reviews={reviews} />);
    
    // 컴포넌트 언마운트
    unmount();
    
    // 가비지 컬렉션 강제 실행 (테스트 환경에서만)
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryDiff = finalMemory - initialMemory;
    
    console.log(`💾 메모리 사용량 변화: ${(memoryDiff / 1024 / 1024).toFixed(2)} MB`);
    
    // 메모리 누수가 없어야 함 (10MB 이하)
    expect(memoryDiff).toBeLessThan(10 * 1024 * 1024);
  });
});