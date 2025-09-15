import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Review } from '../stores/analysisStore';
import { ReviewItem } from './ReviewItem';

interface VirtualizedReviewListProps {
  reviews: Review[];
  keywords?: string[];
  searchKeyword?: string;
  itemHeight?: number;
  containerHeight?: number;
}

export const VirtualizedReviewList: React.FC<VirtualizedReviewListProps> = ({
  reviews,
  keywords = [],
  searchKeyword = '',
  itemHeight = 200,
  containerHeight = 600,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 보이는 아이템 범위 계산
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      reviews.length
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, reviews.length]);

  // 보이는 리뷰만 렌더링
  const visibleReviews = useMemo(() => {
    return reviews.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [reviews, visibleRange]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // 전체 높이 계산
  const totalHeight = reviews.length * itemHeight;

  // 상단 오프셋 계산
  const offsetY = visibleRange.startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <div className="space-y-4">
            {visibleReviews.map((review, index) => (
              <div
                key={review.id}
                style={{ minHeight: itemHeight }}
              >
                <ReviewItem
                  review={review}
                  keywords={keywords}
                  searchKeyword={searchKeyword}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};