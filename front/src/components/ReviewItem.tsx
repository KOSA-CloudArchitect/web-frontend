import React from 'react';
import { Star, ThumbsUp, Calendar, User } from 'lucide-react';
import { Review } from '../stores/analysisStore';
import { 
  getSentimentColor, 
  getSentimentLabel, 
  getStarRating,
  highlightKeywords,
  highlightSearchKeyword
} from '../utils/reviewUtils';

interface ReviewItemProps {
  review: Review;
  keywords?: string[];
  searchKeyword?: string;
}

export const ReviewItem: React.FC<ReviewItemProps> = React.memo(({
  review,
  keywords = [],
  searchKeyword = '',
}) => {
  const { filled, empty } = getStarRating(review.rating);
  const sentimentColorClass = getSentimentColor(review.sentiment);
  const sentimentLabel = getSentimentLabel(review.sentiment);

  // 키워드와 검색어 하이라이트 적용
  let highlightedContent = review.content;
  if (keywords.length > 0) {
    highlightedContent = highlightKeywords(highlightedContent, keywords);
  }
  if (searchKeyword.trim()) {
    highlightedContent = highlightSearchKeyword(highlightedContent, searchKeyword);
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* 평점 */}
          <div className="flex items-center gap-1">
            {Array.from({ length: filled }, (_, i) => (
              <Star key={`filled-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
            {Array.from({ length: empty }, (_, i) => (
              <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
            ))}
            <span className="text-sm font-medium text-gray-700 ml-1">
              {review.rating}.0
            </span>
          </div>

          {/* 감성 라벨 */}
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${sentimentColorClass}`}>
            {sentimentLabel}
          </span>
        </div>

        {/* 날짜 */}
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          {formatDate(review.date)}
        </div>
      </div>

      {/* 리뷰 내용 */}
      <div className="mb-3">
        <p 
          className="text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlightedContent }}
        />
      </div>

      {/* 푸터 */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <User className="w-4 h-4" />
          <span>{review.author || '익명'}</span>
        </div>

        {review.helpful !== undefined && review.helpful > 0 && (
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            <span>도움됨 {review.helpful}</span>
          </div>
        )}
      </div>
    </div>
  );
});