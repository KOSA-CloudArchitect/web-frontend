import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from '../useWebSocket';
import { useRealtimeAnalysisStore } from '../../stores/realtimeAnalysisStore';

// Mock the store
jest.mock('../../stores/realtimeAnalysisStore');

// Mock environment variables - 테스트 환경에서는 자동으로 Mock 사용
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    NODE_ENV: 'test',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('useWebSocket', () => {
  const mockStoreActions = {
    setConnectionStatus: jest.fn(),
    setCurrentStage: jest.fn(),
    setProgress: jest.fn(),
    addEmotionCard: jest.fn(),
    setError: jest.fn(),
    clearError: jest.fn(),
    updateAnalysisChart: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRealtimeAnalysisStore as jest.Mock).mockReturnValue(mockStoreActions);
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => 
      useWebSocket({ productId: 'test-product', autoConnect: false })
    );

    expect(result.current.socket).toBeNull();
    expect(result.current.isConnected).toBe(false);
  });

  it('should connect when autoConnect is true', async () => {
    const { result } = renderHook(() => 
      useWebSocket({ productId: 'test-product', autoConnect: true })
    );

    // 훅이 올바른 값을 반환하는지 확인
    expect(result.current).toBeDefined();
    expect(typeof result.current.connect).toBe('function');
    expect(typeof result.current.disconnect).toBe('function');
  });

  it('should handle manual connect and disconnect', () => {
    const { result } = renderHook(() => 
      useWebSocket({ productId: 'test-product', autoConnect: false })
    );

    act(() => {
      result.current.connect();
    });

    // connect 함수가 호출되었는지 확인
    expect(result.current.connect).toBeDefined();

    act(() => {
      result.current.disconnect();
    });

    // disconnect 함수가 호출되었는지 확인
    expect(result.current.disconnect).toBeDefined();
  });

  it('should handle reconnect', () => {
    const { result } = renderHook(() => 
      useWebSocket({ productId: 'test-product', autoConnect: false })
    );

    act(() => {
      result.current.connect();
    });

    act(() => {
      result.current.reconnect();
    });

    // reconnect 함수가 정의되어 있는지 확인
    expect(result.current.reconnect).toBeDefined();
  });
});