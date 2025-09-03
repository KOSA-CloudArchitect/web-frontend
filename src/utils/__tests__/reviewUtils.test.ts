import {
  filterReviews,
  highlightKeywords,
  highlightSearchKeyword,
  getSentimentColor,
  getSentimentLabel,
  getStarRating,
} from '../reviewUtils';
import { Review, ReviewFilters } from '../../stores/analysisStore';

describe('reviewUtils', () => {
  const mockReviews: Review[] = [
    {
      id: '1',
      content: '정말 좋은 상품입니다. 품질이 우수해요.',
      rating: 5,
      sentiment: 'positive',
      date: '2024-01-15',
      author: '사용자1',
    },
    {
      id: '2',
      content: '배송이 느리고 포장이 별로였습니다.',
      rating: 2,
      sentiment: 'negative',
      date: '2024-01-10',
      author: '사용자2',
    },
    {
      id: '3',
      content: '그냥 보통입니다. 가격 대비 괜찮아요.',
      rating: 3,
      sentiment: 'neutral',
      date: '2024-01-20',
      author: '사용자3',
    },
  ];

  describe('filterReviews', () => {
    it('감성 필터가 올바르게 작동한다', () => {
      const filters: ReviewFilters = {
        sentiment: 'positive',
        rating: 'all',
        dateRange: 'all',
        searchKeyword: '',
      };

      const result = filterReviews(mockReviews, filters);
      expect(result).toHaveLength(1);
      expect(result[0].sentiment).toBe('positive');
    });

    it('평점 필터가 올바르게 작동한다', () => {
      const filters: ReviewFilters = {
        sentiment: 'all',
        rating: '5',
        dateRange: 'all',
        searchKeyword: '',
      };

      const result = filterReviews(mockReviews, filters);
      expect(result).toHaveLength(1);
      expect(result[0].rating).toBe(5);
    });

    it('키워드 검색이 올바르게 작동한다', () => {
      const filters: ReviewFilters = {
        sentiment: 'all',
        rating: 'all',
        dateRange: 'all',
        searchKeyword: '배송',
      };

      const result = filterReviews(mockReviews, filters);
      expect(result).toHaveLength(1);
      expect(result[0].content).toContain('배송');
    });

    it('모든 필터가 함께 작동한다', () => {
      const filters: ReviewFilters = {
        sentiment: 'negative',
        rating: '2',
        dateRange: 'all',
        searchKeyword: '배송',
      };

      const result = filterReviews(mockReviews, filters);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });
  });

  describe('highlightKeywords', () => {
    it('키워드를 올바르게 하이라이트한다', () => {
      const text = '이 상품의 품질이 정말 좋습니다.';
      const keywords = ['품질', '좋습니다'];

      const result = highlightKeywords(text, keywords);
      expect(result).toContain('<mark class="bg-yellow-200 px-1 rounded">품질</mark>');
      expect(result).toContain('<mark class="bg-yellow-200 px-1 rounded">좋습니다</mark>');
    });

    it('빈 키워드 배열을 처리한다', () => {
      const text = '테스트 텍스트입니다.';
      const result = highlightKeywords(text, []);
      expect(result).toBe(text);
    });
  });

  describe('highlightSearchKeyword', () => {
    it('검색 키워드를 올바르게 하이라이트한다', () => {
      const text = '배송이 빠르고 좋았습니다.';
      const keyword = '배송';

      const result = highlightSearchKeyword(text, keyword);
      expect(result).toContain('<mark class="bg-blue-200 px-1 rounded font-medium">배송</mark>');
    });

    it('빈 검색 키워드를 처리한다', () => {
      const text = '테스트 텍스트입니다.';
      const result = highlightSearchKeyword(text, '');
      expect(result).toBe(text);
    });
  });

  describe('getSentimentColor', () => {
    it('감성에 따른 올바른 색상 클래스를 반환한다', () => {
      expect(getSentimentColor('positive')).toContain('text-green-600');
      expect(getSentimentColor('negative')).toContain('text-red-600');
      expect(getSentimentColor('neutral')).toContain('text-gray-600');
    });
  });

  describe('getSentimentLabel', () => {
    it('감성에 따른 올바른 라벨을 반환한다', () => {
      expect(getSentimentLabel('positive')).toBe('긍정');
      expect(getSentimentLabel('negative')).toBe('부정');
      expect(getSentimentLabel('neutral')).toBe('중립');
    });
  });

  describe('getStarRating', () => {
    it('평점에 따른 별점 데이터를 반환한다', () => {
      expect(getStarRating(5)).toEqual({ filled: 5, empty: 0 });
      expect(getStarRating(3)).toEqual({ filled: 3, empty: 2 });
      expect(getStarRating(1)).toEqual({ filled: 1, empty: 4 });
    });
  });
});