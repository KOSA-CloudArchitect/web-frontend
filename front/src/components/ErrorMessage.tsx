import React from 'react';
import { AlertCircle, RefreshCw, Home, MessageCircle, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type ErrorType = 'network' | 'server' | 'validation' | 'timeout' | 'unknown';

interface ErrorMessageProps {
  message: string;
  type?: ErrorType;
  onRetry?: () => void;
  showHomeButton?: boolean;
  showSupportButton?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = 'unknown',
  onRetry,
  showHomeButton = true,
  showSupportButton = false,
}) => {
  const navigate = useNavigate();

  const getErrorIcon = () => {
    switch (type) {
      case 'network':
        return <WifiOff className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />;
      case 'server':
        return <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />;
      case 'timeout':
        return <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />;
      default:
        return <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />;
    }
  };

  const getErrorTitle = () => {
    switch (type) {
      case 'network':
        return '네트워크 연결 오류';
      case 'server':
        return '서버 오류';
      case 'validation':
        return '입력 오류';
      case 'timeout':
        return '요청 시간 초과';
      default:
        return '분석 중 오류가 발생했습니다';
    }
  };

  const getErrorSuggestion = () => {
    switch (type) {
      case 'network':
        return '인터넷 연결을 확인하고 다시 시도해주세요.';
      case 'server':
        return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
      case 'validation':
        return '입력한 정보를 확인하고 다시 시도해주세요.';
      case 'timeout':
        return '요청 처리 시간이 초과되었습니다. 다시 시도해주세요.';
      default:
        return '문제가 지속되면 고객 지원팀에 문의해주세요.';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'timeout':
        return 'bg-orange-50 border-orange-200';
      case 'validation':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'timeout':
        return 'text-orange-900';
      case 'validation':
        return 'text-yellow-900';
      default:
        return 'text-red-900';
    }
  };

  const getMessageColor = () => {
    switch (type) {
      case 'timeout':
        return 'text-orange-700';
      case 'validation':
        return 'text-yellow-700';
      default:
        return 'text-red-700';
    }
  };

  return (
    <div className={`${getBgColor()} border rounded-lg p-6`}>
      <div className="flex items-start gap-3">
        {getErrorIcon()}
        <div className="flex-1">
          <h3 className={`text-lg font-medium ${getTextColor()} mb-2`}>
            {getErrorTitle()}
          </h3>
          <p className={`${getMessageColor()} mb-2`}>{message}</p>
          <p className={`text-sm ${getMessageColor()} mb-4`}>
            {getErrorSuggestion()}
          </p>
          
          <div className="flex flex-wrap gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <RefreshCw className="w-4 h-4" />
                다시 시도
              </button>
            )}
            
            {showHomeButton && (
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <Home className="w-4 h-4" />
                홈으로 이동
              </button>
            )}
            
            {showSupportButton && (
              <button
                onClick={() => {
                  // 실제로는 고객 지원 페이지나 채팅으로 연결
                  alert('고객 지원팀에 문의해주세요: support@example.com');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <MessageCircle className="w-4 h-4" />
                고객 지원
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};