import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  onClick?: () => void;
  hoverable?: boolean;
  loading?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  onClick,
  hoverable = false,
  loading = false
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200';
  const hoverClasses = hoverable ? 'hover:shadow-md transition-shadow duration-200' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  const loadingClasses = loading ? 'opacity-50 pointer-events-none' : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${loadingClasses} ${className}`}
      onClick={onClick}
    >
      {/* 헤더 */}
      {(title || subtitle) && (
        <div className={`px-6 py-4 border-b border-gray-200 ${headerClassName}`}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* 본문 */}
      <div className={`px-6 py-4 ${bodyClassName}`}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

// 특수한 용도의 카드 컴포넌트들
export const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}> = ({ title, value, subtitle, icon, trend, trendValue, className = '' }) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <Card className={className} hoverable>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={`flex items-center mt-2 text-sm ${getTrendColor()}`}>
              <span className="mr-1">{getTrendIcon()}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4 text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export const SentimentCard: React.FC<{
  sentiment: 'positive' | 'negative' | 'neutral';
  text: string;
  keywords: string[];
  confidence: number;
  reviewCount?: number;
  className?: string;
}> = ({ sentiment, text, keywords, confidence, reviewCount, className = '' }) => {
  const getSentimentColor = () => {
    switch (sentiment) {
      case 'positive':
        return 'border-green-200 bg-green-50';
      case 'negative':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getSentimentIcon = () => {
    switch (sentiment) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😞';
      default:
        return '😐';
    }
  };

  const getSentimentLabel = () => {
    switch (sentiment) {
      case 'positive':
        return '긍정';
      case 'negative':
        return '부정';
      default:
        return '중립';
    }
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${getSentimentColor()} ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getSentimentIcon()}</span>
          <span className="font-medium text-gray-900">
            {getSentimentLabel()}
          </span>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-700">
            신뢰도: {Math.round(confidence * 100)}%
          </div>
          {reviewCount && (
            <div className="text-xs text-gray-500">
              {reviewCount}개 리뷰
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-800 mb-3 line-clamp-3">
        {text}
      </p>

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {keywords.slice(0, 5).map((keyword, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 text-xs bg-white bg-opacity-60 rounded-full text-gray-700"
            >
              #{keyword}
            </span>
          ))}
          {keywords.length > 5 && (
            <span className="inline-block px-2 py-1 text-xs bg-white bg-opacity-60 rounded-full text-gray-500">
              +{keywords.length - 5}개
            </span>
          )}
        </div>
      )}
    </div>
  );
};