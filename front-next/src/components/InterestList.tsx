import React, { useEffect, useState } from 'react';
import { useInterestStore } from '../stores/interestStore';
import { HeartButton } from './HeartButton';
import { LoadingSpinner } from './LoadingSpinner';
import { Product } from '../types';

interface InterestListProps {
  className?: string;
  showHeader?: boolean;
  maxItems?: number;
  enableSelection?: boolean;
  onCompare?: (selectedIds: string[]) => void;
}

export const InterestList: React.FC<InterestListProps> = ({
  className = '',
  showHeader = true,
  maxItems,
  enableSelection = false,
  onCompare,
}) => {
  const { interests, loading, error, fetchInterests, removeMultipleInterests, clearError } = useInterestStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchInterests();
  }, [fetchInterests]);

  // 표시할 관심 상품 목록 (maxItems가 설정된 경우 제한)
  const displayInterests = maxItems ? interests.slice(0, maxItems) : interests;

  // 선택 관련 핸들러
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(displayInterests.map(interest => interest.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (interestId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, interestId]);
    } else {
      setSelectedIds(prev => prev.filter(id => id !== interestId));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    
    const confirmMessage = `선택한 ${selectedIds.length}개의 관심 상품을 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) return;

    setIsDeleting(true);
    
    try {
      const success = await removeMultipleInterests(selectedIds);
      if (success) {
        setSelectedIds([]);
      }
    } catch (error) {
      console.error('삭제 중 오류 발생:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCompare = () => {
    if (selectedIds.length < 2) {
      alert('비교하려면 최소 2개의 상품을 선택해주세요.');
      return;
    }
    if (selectedIds.length > 5) {
      alert('비교는 최대 5개까지 가능합니다.');
      return;
    }
    onCompare?.(selectedIds);
  };

  const isAllSelected = displayInterests.length > 0 && selectedIds.length === displayInterests.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < displayInterests.length;

  if (loading && interests.length === 0) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => {
                clearError();
                fetchInterests();
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (interests.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">관심 상품이 없습니다</h3>
        <p className="text-gray-500">상품을 검색하고 하트 버튼을 눌러 관심 상품으로 등록해보세요.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              관심 상품 ({interests.length})
            </h2>
            {enableSelection && displayInterests.length > 0 && (
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isPartiallySelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>전체 선택</span>
                </label>
                {selectedIds.length > 0 && (
                  <span className="text-sm text-blue-600">
                    {selectedIds.length}개 선택됨
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {enableSelection && selectedIds.length > 0 && (
              <>
                <button
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-1" />
                      삭제 중...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      삭제 ({selectedIds.length})
                    </>
                  )}
                </button>
                {onCompare && (
                  <button
                    onClick={handleCompare}
                    className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    비교 ({selectedIds.length})
                  </button>
                )}
              </>
            )}
            {maxItems && interests.length > maxItems && (
              <button className="text-sm text-blue-600 hover:text-blue-500">
                전체 보기
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayInterests.map((interest) => {
          // InterestProduct를 Product 형태로 변환
          const product: Product = {
            id: interest.productId,
            name: interest.productName,
            price: interest.currentPrice,
            rating: interest.rating,
            review_count: interest.reviewCount,
            image_url: interest.imageUrl,
            url: interest.productUrl,
          };

          return (
            <div
              key={interest.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 ${
                enableSelection && selectedIds.includes(interest.id) 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : ''
              }`}
            >
              {/* 체크박스 (선택 모드일 때만) */}
              {enableSelection && (
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(interest.id)}
                    onChange={(e) => handleSelectItem(interest.id, e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white shadow-sm"
                  />
                </div>
              )}
              
              {/* 상품 이미지 */}
              <div className="relative aspect-square bg-gray-100">
                {interest.imageUrl ? (
                  <img
                    src={interest.imageUrl}
                    alt={interest.productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* 하트 버튼 */}
                <div className={`absolute top-2 right-2 ${enableSelection ? 'z-10' : ''}`}>
                  <HeartButton product={product} size="md" />
                </div>
              </div>

              {/* 상품 정보 */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
                  {interest.productName}
                </h3>
                
                <div className="space-y-1">
                  {interest.currentPrice && (
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        {interest.currentPrice.toLocaleString()}원
                      </span>
                      {interest.originalPrice && interest.originalPrice > interest.currentPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {interest.originalPrice.toLocaleString()}원
                        </span>
                      )}
                    </div>
                  )}
                  
                  {interest.rating && (
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(interest.rating!) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {interest.rating.toFixed(1)}
                      </span>
                      {interest.reviewCount && (
                        <span className="text-sm text-gray-500">
                          ({interest.reviewCount.toLocaleString()})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 등록일 */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    등록일: {new Date(interest.createdAt).toLocaleDateString()}
                  </p>
                  {interest.lastAnalyzedAt && (
                    <p className="text-xs text-gray-500">
                      마지막 분석: {new Date(interest.lastAnalyzedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* 분석 버튼 */}
                <div className="mt-3">
                  <button
                    onClick={() => window.location.href = `/interests/${interest.id}/analysis`}
                    className="w-full inline-flex items-center justify-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    분석 보기
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};