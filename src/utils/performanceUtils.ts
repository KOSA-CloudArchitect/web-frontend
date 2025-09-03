/**
 * 성능 측정 유틸리티
 */

export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map();

  /**
   * 성능 측정 시작
   */
  static startMeasurement(name: string): void {
    this.measurements.set(name, performance.now());
  }

  /**
   * 성능 측정 종료 및 결과 반환
   */
  static endMeasurement(name: string): number {
    const startTime = this.measurements.get(name);
    if (!startTime) {
      console.warn(`Performance measurement '${name}' was not started`);
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this.measurements.delete(name);
    
    // 개발 환경에서만 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * 필터 변경 성능 측정
   */
  static measureFilterChange<T>(
    filterName: string,
    callback: () => T,
    threshold: number = 200
  ): T {
    this.startMeasurement(`filter-${filterName}`);
    const result = callback();
    const duration = this.endMeasurement(`filter-${filterName}`);

    // 임계값 초과 시 경고
    if (duration > threshold) {
      console.warn(`🐌 Filter '${filterName}' took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`);
    }

    return result;
  }

  /**
   * React 컴포넌트 렌더링 시간 측정
   */
  static measureRender(componentName: string): {
    start: () => void;
    end: () => void;
  } {
    return {
      start: () => this.startMeasurement(`render-${componentName}`),
      end: () => this.endMeasurement(`render-${componentName}`),
    };
  }
}

/**
 * 디바운스 함수 (검색 입력 최적화용)
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 스로틀 함수 (스크롤 이벤트 최적화용)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 메모리 사용량 모니터링 (개발 환경용)
 */
export const memoryMonitor = {
  log: () => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const memory = (performance as any).memory;
      console.log('🧠 Memory Usage:', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
      });
    }
  },
};