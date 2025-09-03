import { act, renderHook } from '@testing-library/react';
import { useRealtimeAnalysisStore, EmotionCard } from '../realtimeAnalysisStore';

describe('realtimeAnalysisStore', () => {
  beforeEach(() => {
    // 각 테스트 전에 스토어 초기화
    const { result } = renderHook(() => useRealtimeAnalysisStore());
    act(() => {
      result.current.reset();
    });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useRealtimeAnalysisStore());
    
    expect(result.current.isConnected).toBe(false);
    expect(result.current.currentStage).toBe('대기 중');
    expect(result.current.progress).toBe(0);
    expect(result.current.emotionCards).toEqual([]);
    expect(result.current.analysisChart).toEqual({
      positive: 0,
      negative: 0,
      neutral: 0,
      totalProcessed: 0,
    });
    expect(result.current.error).toBeNull();
  });

  it('should update connection status', () => {
    const { result } = renderHook(() => useRealtimeAnalysisStore());
    
    act(() => {
      result.current.setConnectionStatus(true);
    });
    
    expect(result.current.isConnected).toBe(true);
  });

  it('should update current stage', () => {
    const { result } = renderHook(() => useRealtimeAnalysisStore());
    
    act(() => {
      result.current.setCurrentStage('감성 분석 중');
    });
    
    expect(result.current.currentStage).toBe('감성 분석 중');
  });

  it('should update progress with bounds checking', () => {
    const { result } = renderHook(() => useRealtimeAnalysisStore());
    
    // 정상 범위
    act(() => {
      result.current.setProgress(50);
    });
    expect(result.current.progress).toBe(50);
    
    // 최대값 초과
    act(() => {
      result.current.setProgress(150);
    });
    expect(result.current.progress).toBe(100);
    
    // 최소값 미만
    act(() => {
      result.current.setProgress(-10);
    });
    expect(result.current.progress).toBe(0);
  });

  it('should add emotion cards and maintain limit', () => {
    const { result } = renderHook(() => useRealtimeAnalysisStore());
    
    const mockCard: EmotionCard = {
      id: 'test-1',
      sentiment: 'positive',
      content: 'Test content',
      keywords: ['test'],
      confidence: 0.8,
      timestamp: new Date().toISOString(),
      color: 'bg-green-100',
    };
    
    act(() => {
      result.current.addEmotionCard(mockCard);
    });
    
    expect(result.current.emotionCards).toHaveLength(1);
    expect(result.current.emotionCards[0]).toEqual(mockCard);
    
    // 50개 제한 테스트 (실제로는 시간이 오래 걸리므로 몇 개만 테스트)
    for (let i = 2; i <= 52; i++) {
      act(() => {
        result.current.addEmotionCard({
          ...mockCard,
          id: `test-${i}`,
        });
      });
    }
    
    expect(result.current.emotionCards).toHaveLength(50);
  });

  it('should update analysis chart', () => {
    const { result } = renderHook(() => useRealtimeAnalysisStore());
    
    const chartData = {
      positive: 10,
      negative: 5,
      neutral: 3,
      totalProcessed: 18,
    };
    
    act(() => {
      result.current.updateAnalysisChart(chartData);
    });
    
    expect(result.current.analysisChart).toEqual(chartData);
  });

  it('should handle error management', () => {
    const { result } = renderHook(() => useRealtimeAnalysisStore());
    
    const errorMessage = 'Test error';
    
    act(() => {
      result.current.setError(errorMessage);
    });
    
    expect(result.current.error).toBe(errorMessage);
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });

  it('should reset to initial state', () => {
    const { result } = renderHook(() => useRealtimeAnalysisStore());
    
    // 상태 변경
    act(() => {
      result.current.setConnectionStatus(true);
      result.current.setCurrentStage('분석 중');
      result.current.setProgress(75);
      result.current.setError('Test error');
    });
    
    // 리셋
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.isConnected).toBe(false);
    expect(result.current.currentStage).toBe('대기 중');
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
  });
});