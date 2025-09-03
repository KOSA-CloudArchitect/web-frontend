import React from 'react';
import { FileText, Star, MessageSquare } from 'lucide-react';

interface SummaryCardProps {
  summary: string;
  keywords: string[];
  averageRating: number;
  productName: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  summary,
  keywords,
  averageRating,
  productName,
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-4 h-4 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          리뷰 요약
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium truncate max-w-xs" title={productName}>
            {productName}
          </span>
          <div className="flex items-center gap-1">
            {renderStars(averageRating)}
            <span className="ml-1 font-medium">{averageRating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-start gap-2 mb-3">
          <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-gray-900 mb-2">AI 요약</h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {summary}
            </p>
          </div>
        </div>
      </div>

      {keywords.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">주요 키워드</h4>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
              >
                #{keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};