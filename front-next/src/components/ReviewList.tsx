import React, { useMemo, useCallback } from 'react';
import { MessageSquare, Filter as FilterIcon } from 'lucide-react';
import { useAnalysisFilters, Review } from '../stores/analysisStore';
import { ReviewItem } from './ReviewItem';
import { VirtualizedReviewList } from './VirtualizedReviewList';
import { ReviewFiltersComponent } from './ReviewFilters';
import { filterReviews } from '../utils/reviewUtils';

interface ReviewListProps {
  reviews: Review[];
  keywords?: string[];
}

export const ReviewList: React.FC<ReviewListProps> = React.memo(({
  reviews,
  keywords = [],
}) => {
  const filters = useAnalysisFilters();

  // 필터링된 리뷰 계산 (useMemo로 최적화)
  const filteredReviews = useMemo(() => {
    return filterReviews(reviews, filters);
  }, [reviews, filters]);

  // ReviewItem 렌더링 최적화
  const renderReviewItem = useCallback((review: Review) => (
    <ReviewItem
      key={review.id}
      review={review}
      keywords={keywords}
      searchKeyword={filters.searchKeyword}
    />
  ), [keywords, filters.searchKeyword]);

  // 통계 계산
  const stats = useMemo(() => {
    const total = filteredReviews.length;
    const positive = filteredReviews.filter(r => r.sentiment === 'positive').length;
    const negative = filteredReviews.filter(r => r.sentiment === 'negative').length;
    const neutral = filteredReviews.filter(r => r.sentiment === 'neutral').length;
    
    return { total, positive, negative, neutral };
  }, [filteredReviews]);

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">리뷰가 없습니다</h3>
        <p className="text-gray-600">아직 분석된 리뷰 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 필터 컴포넌트 */}
      <ReviewFiltersComponent />

      {/* 통계 정보 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">리뷰 목록</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FilterIcon className="w-4 h-4" />
            <span>총 {stats.total}개 리뷰</span>
          </div>
        </div>

        {/* 필터링 결과 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">전체</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-semibold text-green-600">{stats.positive}</div>
            <div className="text-sm text-green-700">긍정</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-semibold text-red-600">{stats.negative}</div>
            <div className="text-sm text-red-700">부정</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-600">{stats.neutral}</div>
            <div className="text-sm text-gray-700">중립</div>
          </div>
        </div>
      </div>

      {/* 리뷰 목록 */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
          <FilterIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">필터 조건에 맞는 리뷰가 없습니다</h3>
          <p className="text-gray-600">다른 필터 조건을 시도해보세요.</p>
        </div>
      ) : filteredReviews.length > 50 ? (
        // 리뷰가 50개 이상일 때 가상화 사용
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <VirtualizedReviewList
            reviews={filteredReviews}
            keywords={keywords}
            searchKeyword={filters.searchKeyword}
            itemHeight={180}
            containerHeight={800}
          />
        </div>
      ) : (
        // 리뷰가 적을 때는 일반 렌더링
        <div className="space-y-4">
          {filteredReviews.map(renderReviewItem)}
        </div>
      )}

      {/* 더 보기 버튼 (페이지네이션 대신) */}
      {filteredReviews.length > 0 && filteredReviews.length >= 20 && (
        <div className="text-center">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            더 많은 리뷰 보기
          </button>
        </div>
      )}
    </div>
  );
});