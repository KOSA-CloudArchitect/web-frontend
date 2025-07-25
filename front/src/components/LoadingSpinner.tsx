import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = '분석 중...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500 mb-4`} />
      <p className="text-gray-600 text-center">{message}</p>
      <div className="mt-2 text-sm text-gray-500">
        리뷰를 분석하고 있습니다. 잠시만 기다려주세요.
      </div>
    </div>
  );
};