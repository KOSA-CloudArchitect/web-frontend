import { Review, ReviewFilters } from '../stores/analysisStore';

/**
 * 리뷰 필터링 함수
 */
export const filterReviews = (reviews: Review[], filters: ReviewFilters): Review[] => {
  return reviews.filter(review => {
    // 감성 필터
    if (filters.sentiment !== 'all' && review.sentiment !== filters.sentiment) {
      return false;
    }

    // 평점 필터
    if (filters.rating !== 'all' && review.rating !== parseInt(filters.rating)) {
      return false;
    }

    // 날짜 필터
    if (filters.dateRange !== 'all') {
      const reviewDate = new Date(review.date);
      const now = new Date();
      const diffTime = now.getTime() - reviewDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (filters.dateRange) {
        case 'recent':
          if (diffDays > 7) return false;
          break;
        case 'month':
          if (diffDays > 30) return false;
          break;
        case 'year':
          if (diffDays > 365) return false;
          break;
      }
    }

    // 키워드 검색
    if (filters.searchKeyword.trim()) {
      const keyword = filters.searchKeyword.toLowerCase();
      if (!review.content.toLowerCase().includes(keyword)) {
        return false;
      }
    }

    return true;
  });
};

/**
 * 리뷰 텍스트에서 키워드 하이라이트
 */
export const highlightKeywords = (text: string, keywords: string[]): string => {
  if (!keywords.length) return text;

  let highlightedText = text;
  
  keywords.forEach(keyword => {
    if (keyword.trim()) {
      const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    }
  });

  return highlightedText;
};

/**
 * 검색 키워드 하이라이트
 */
export const highlightSearchKeyword = (text: string, searchKeyword: string): string => {
  if (!searchKeyword.trim()) return text;

  const regex = new RegExp(`(${searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-blue-200 px-1 rounded font-medium">$1</mark>');
};

/**
 * 감성에 따른 색상 클래스 반환
 */
export const getSentimentColor = (sentiment: Review['sentiment']): string => {
  switch (sentiment) {
    case 'positive':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'negative':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'neutral':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

/**
 * 감성 라벨 반환
 */
export const getSentimentLabel = (sentiment: Review['sentiment']): string => {
  switch (sentiment) {
    case 'positive':
      return '긍정';
    case 'negative':
      return '부정';
    case 'neutral':
      return '중립';
    default:
      return '알 수 없음';
  }
};

/**
 * 평점에 따른 별점 렌더링 데이터
 */
export const getStarRating = (rating: number): { filled: number; empty: number } => {
  const filled = Math.floor(rating);
  const empty = 5 - filled;
  return { filled, empty };
};