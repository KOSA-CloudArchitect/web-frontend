import React, { Component, ReactNode } from 'react';
import { ErrorMessage } from './ErrorMessage';
import { handleReactError, collectErrorInfo } from '../utils/errorUtils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      error,
      errorInfo,
    });

    // 에러 리포팅
    handleReactError(error, errorInfo);
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorInfo = this.state.error 
        ? collectErrorInfo(this.state.error)
        : { message: '알 수 없는 오류가 발생했습니다.', type: 'unknown' as const };

      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <ErrorMessage
              message={errorInfo.message}
              type={errorInfo.type}
              onRetry={this.handleRetry}
              showHomeButton={true}
              showSupportButton={true}
            />
            
            {/* 개발 환경에서만 상세 에러 정보 표시 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-gray-900 text-white rounded-lg overflow-auto">
                <h3 className="text-lg font-semibold mb-2">개발자 정보</h3>
                <pre className="text-sm whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
                {this.state.errorInfo && (
                  <pre className="text-sm whitespace-pre-wrap mt-4">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // retryCount를 key로 사용하여 자식 컴포넌트를 강제로 다시 마운트
    return (
      <div key={this.state.retryCount}>
        {this.props.children}
      </div>
    );
  }
}