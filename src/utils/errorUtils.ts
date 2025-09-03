import { ErrorType } from '../components/ErrorMessage';

export interface ErrorInfo {
  message: string;
  type: ErrorType;
  stack?: string;
  url?: string;
  timestamp: number;
  userAgent: string;
  userId?: string;
}

/**
 * 에러 분류 함수
 */
export const classifyError = (error: Error | string): ErrorType => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? '' : error.stack || '';

  // 네트워크 오류
  if (
    errorMessage.includes('fetch') ||
    errorMessage.includes('network') ||
    errorMessage.includes('Failed to fetch') ||
    errorMessage.includes('NetworkError')
  ) {
    return 'network';
  }

  // 서버 오류 (HTTP 5xx)
  if (
    errorMessage.includes('HTTP 5') ||
    errorMessage.includes('Internal Server Error') ||
    errorMessage.includes('Service Unavailable')
  ) {
    return 'server';
  }

  // 유효성 검사 오류 (HTTP 4xx)
  if (
    errorMessage.includes('HTTP 4') ||
    errorMessage.includes('Bad Request') ||
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('Forbidden') ||
    errorMessage.includes('Not Found')
  ) {
    return 'validation';
  }

  // 타임아웃 오류
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('Timeout') ||
    errorStack.includes('timeout')
  ) {
    return 'timeout';
  }

  return 'unknown';
};

/**
 * 사용자 친화적 에러 메시지 생성
 */
export const getUserFriendlyMessage = (error: Error | string, type: ErrorType): string => {
  const originalMessage = typeof error === 'string' ? error : error.message;

  switch (type) {
    case 'network':
      return '인터넷 연결을 확인해주세요. 네트워크 상태가 불안정할 수 있습니다.';
    
    case 'server':
      return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    
    case 'validation':
      if (originalMessage.includes('URL')) {
        return '올바른 쿠팡 상품 URL을 입력해주세요.';
      }
      return '입력한 정보를 다시 확인해주세요.';
    
    case 'timeout':
      return '요청 처리 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.';
    
    default:
      // 원본 메시지가 사용자 친화적이면 그대로 사용
      if (originalMessage.length < 100 && !originalMessage.includes('Error:')) {
        return originalMessage;
      }
      return '예상치 못한 오류가 발생했습니다. 다시 시도해주세요.';
  }
};

/**
 * 에러 정보 수집
 */
export const collectErrorInfo = (error: Error | string, additionalInfo?: any): ErrorInfo => {
  const type = classifyError(error);
  const message = getUserFriendlyMessage(error, type);

  return {
    message,
    type,
    stack: typeof error === 'string' ? undefined : error.stack,
    url: window.location.href,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    userId: localStorage.getItem('userId') || undefined,
    ...additionalInfo,
  };
};

/**
 * 에러 리포팅 (실제 환경에서는 Sentry 등 사용)
 */
export const reportError = async (errorInfo: ErrorInfo): Promise<void> => {
  // 개발 환경에서는 콘솔에 로그
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Error Report');
    console.error('Message:', errorInfo.message);
    console.error('Type:', errorInfo.type);
    console.error('URL:', errorInfo.url);
    console.error('Timestamp:', new Date(errorInfo.timestamp).toISOString());
    if (errorInfo.stack) {
      console.error('Stack:', errorInfo.stack);
    }
    console.groupEnd();
  }

  // 프로덕션 환경에서는 실제 에러 리포팅 서비스로 전송
  try {
    // 예시: Sentry, LogRocket, 또는 자체 에러 수집 API
    await fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorInfo),
    }).catch(() => {
      // 에러 리포팅 실패는 무시 (무한 루프 방지)
    });
  } catch {
    // 에러 리포팅 실패 시 무시
  }
};

/**
 * 전역 에러 핸들러
 */
export const setupGlobalErrorHandler = (): void => {
  // 처리되지 않은 Promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    const errorInfo = collectErrorInfo(event.reason, {
      context: 'unhandledrejection',
    });
    reportError(errorInfo);
  });

  // 일반적인 JavaScript 에러
  window.addEventListener('error', (event) => {
    const errorInfo = collectErrorInfo(event.error || event.message, {
      context: 'global_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
    reportError(errorInfo);
  });
};

/**
 * React Error Boundary용 에러 핸들러
 */
export const handleReactError = (error: Error, errorInfo: any): void => {
  const errorData = collectErrorInfo(error, {
    context: 'react_error_boundary',
    componentStack: errorInfo.componentStack,
  });
  reportError(errorData);
};