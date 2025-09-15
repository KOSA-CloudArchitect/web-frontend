import React, { useCallback } from 'react';
import { Search, Filter, Calendar, Star, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { useAnalysisFilters, useAnalysisActions, ReviewFilters } from '../stores/analysisStore';
import { debounce } from '../utils/performanceUtils';

export const ReviewFiltersComponent: React.FC = React.memo(() => {
  const filters = useAnalysisFilters();
  const { setFilters } = useAnalysisActions();

  const handleFilterChange = useCallback((key: keyof ReviewFilters, value: string) => {
    setFilters({ [key]: value });
  }, [setFilters]);

  // 검색 키워드는 디바운스 적용 (300ms)
  const debouncedSearchChange = useCallback(
    debounce((value: string) => {
      setFilters({ searchKeyword: value });
    }, 300),
    [setFilters]
  );

  const clearFilters = useCallback(() => {
    setFilters({
      sentiment: 'all',
      rating: 'all',
      dateRange: 'all',
      searchKeyword: '',
    });
  }, [setFilters]);

  const hasActiveFilters = 
    filters.sentiment !== 'all' || 
    filters.rating !== 'all' || 
    filters.dateRange !== 'all' || 
    filters.searchKeyword.trim() !== '';

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">리뷰 필터</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            필터 초기화
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 검색 키워드 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            키워드 검색
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              defaultValue={filters.searchKeyword}
              onChange={(e) => debouncedSearchChange(e.target.value)}
              placeholder="리뷰 내용 검색..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 감성 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            감성 분류
          </label>
          <select
            value={filters.sentiment}
            onChange={(e) => handleFilterChange('sentiment', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체</option>
            <option value="positive">긍정</option>
            <option value="negative">부정</option>
            <option value="neutral">중립</option>
          </select>
        </div>

        {/* 평점 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            평점
          </label>
          <select
            value={filters.rating}
            onChange={(e) => handleFilterChange('rating', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체</option>
            <option value="5">⭐⭐⭐⭐⭐ (5점)</option>
            <option value="4">⭐⭐⭐⭐ (4점)</option>
            <option value="3">⭐⭐⭐ (3점)</option>
            <option value="2">⭐⭐ (2점)</option>
            <option value="1">⭐ (1점)</option>
          </select>
        </div>

        {/* 날짜 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            작성 기간
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체</option>
            <option value="recent">최근 1주일</option>
            <option value="month">최근 1개월</option>
            <option value="year">최근 1년</option>
          </select>
        </div>
      </div>

      {/* 활성 필터 표시 */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.sentiment !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {filters.sentiment === 'positive' && <ThumbsUp className="w-3 h-3" />}
                {filters.sentiment === 'negative' && <ThumbsDown className="w-3 h-3" />}
                {filters.sentiment === 'neutral' && <Minus className="w-3 h-3" />}
                {filters.sentiment === 'positive' ? '긍정' : 
                 filters.sentiment === 'negative' ? '부정' : '중립'}
              </span>
            )}
            {filters.rating !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                <Star className="w-3 h-3" />
                {filters.rating}점
              </span>
            )}
            {filters.dateRange !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                <Calendar className="w-3 h-3" />
                {filters.dateRange === 'recent' ? '최근 1주일' :
                 filters.dateRange === 'month' ? '최근 1개월' : '최근 1년'}
              </span>
            )}
            {filters.searchKeyword.trim() && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                <Search className="w-3 h-3" />
                "{filters.searchKeyword}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
});