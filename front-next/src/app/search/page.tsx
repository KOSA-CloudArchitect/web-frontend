'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { SearchBar } from '@/components/search/SearchBar';
import { Card } from '@/components/common/Card';
import { SearchSuggestion, Product } from '@/types';
import { getProductDisplayData, formatPrice } from '@/utils/productUtils';
import { renderStars } from '@/components/common/StarRating';
import { HeartButton } from '@/components/HeartButton';
import { ShoppingCart, Search, Filter, SortAsc } from 'lucide-react';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState<SearchSuggestion[]>([
    { id: '1', text: '아이폰 15', type: 'popular' },
    { id: '2', text: '갤럭시 S24', type: 'popular' },
    { id: '3', text: '에어팟 프로', type: 'popular' },
    { id: '4', text: '맥북 에어', type: 'popular' },
    { id: '5', text: '다이슨 청소기', type: 'popular' }
  ]);

  // 최근 검색어 로드
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('최근 검색어 로드 실패:', error);
      }
    }
  }, []);

  // 검색 실행
  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
  }, [query]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setSearchQuery(searchQuery);

    // 최근 검색어에 추가
    const updatedRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));

    try {
      console.log(`🔍 검색 시작: "${searchQuery}"`);
      
      // 1단계: GET 요청으로 캐시된 결과 먼저 확인 (직접 백엔드로)
      console.log('💾 캐시된 결과 확인 중...');
      const cacheResponse = await fetch(`/api/products?q=${encodeURIComponent(searchQuery)}&page=1&page_size=20`);
      
      if (cacheResponse.ok) {
        const cacheResult = await cacheResponse.json();
        
        if (cacheResult.success && cacheResult.products && cacheResult.products.length > 0) {
          // 캐시된 결과가 있는 경우 즉시 표시
          console.log(`✅ 캐시된 검색 결과: ${cacheResult.products.length}개 상품`);
          setSearchResults(cacheResult.products);
          setIsLoading(false);
          return;
        }
      }
      
      // 2단계: 캐시에 없으면 크롤링 요청과 웹소켓 연결
      console.log('📡 캐시에 없음, 크롤링 요청 및 웹소켓 연결 시작');
      
      // 웹소켓 연결 먼저 설정
      const { webSocketService } = await import('@/services/websocket');
      const socket = webSocketService.connect();
      
      // 웹소켓 이벤트 리스너 설정
      const handleSearchCompleted = (data: any) => {
        console.log('🎉 search-completed 이벤트 수신:', data);
        
        if (data.status === 'completed' && data.products) {
          console.log(`✅ 크롤링 완료: ${data.products.length}개 상품`);
          setSearchResults(data.products || []);
          setIsLoading(false);
        } else if (data.status === 'error') {
          console.error('크롤링 실패:', data.message);
          setError(data.message || '검색에 실패했습니다.');
          setIsLoading(false);
        }
      };

      const handleSearchError = (data: any) => {
        console.error('❌ search-error 이벤트 수신:', data);
        setError(data.message || '검색에 실패했습니다.');
        setIsLoading(false);
      };

      const handleSearchStarted = (data: any) => {
        console.log('🚀 search-started 이벤트 수신:', data);
      };

      // WebSocket 이벤트 구독
      const unsubscribe = webSocketService.subscribeToSearch({
        onSearchCompleted: handleSearchCompleted,
        onSearchError: handleSearchError,
        onSearchStarted: handleSearchStarted
      });
      
      // 컴포넌트 언마운트 시 구독 해제
      const cleanup = () => {
        unsubscribe();
      };
      
      // 웹소켓 룸 참여
      const joinRoom = () => {
        console.log('✅ 웹소켓 연결됨, 키워드 룸 참여');
        socket.emit('join-keyword-room', { keyword: searchQuery });
      };
      
      if (!socket.connected) {
        console.log('⏳ 웹소켓 연결 대기 중...');
        socket.on('connect', joinRoom);
      } else {
        joinRoom();
      }

      // 페이지 이동 시 cleanup
      return cleanup;

      // 3단계: 크롤링 요청 전송 (백그라운드) - 직접 백엔드로
      console.log('🚀 크롤링 요청 전송...');
      fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: searchQuery,
          max_links: 20
        }),
      }).then(response => {
        console.log(`📡 크롤링 요청 응답: ${response.status}`);
      }).catch(error => {
        console.error('❌ 크롤링 요청 실패:', error);
      });
      
    } catch (error) {
      console.error('검색 오류:', error);
      setError('검색 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.text);
  };

  const handleProductClick = async (product: Product) => {
    const productCode = product.product_code || product.id || 'unknown';
    const productUrl = product.url || `https://www.coupang.com/products/${productCode}`;
    
    try {
      console.log(`🔄 Starting analysis for product: ${productCode}`);
      
      // Airflow 단일 상품 분석 요청
      const response = await fetch('/api/analyze/airflow/single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productCode,
          productUrl: productUrl,
          userId: 'anonymous',
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Analysis started successfully:`, result);
        
        // taskId를 사용하여 분석 페이지로 이동
        const taskId = result.taskId || result.dagRunId;
        const queryParams = new URLSearchParams({
          taskId,
          ...(result.dagRunId && { dagRunId: result.dagRunId }),
          ...(result.dagId && { dagId: result.dagId }),
          ...(result.status && { status: result.status }),
        });
        
        window.location.href = `/analysis/${encodeURIComponent(productCode)}?${queryParams.toString()}`;
      } else {
        console.error('❌ Analysis request failed:', result.message);
        alert('분석 요청에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('❌ Error requesting analysis:', error);
      alert('분석 요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* 검색 헤더 */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-2xl mx-auto">
              <SearchBar
                onSearch={handleSearch}
                onSuggestionSelect={handleSuggestionSelect}
                isLoading={isLoading}
                suggestions={popularSearches}
                recentSearches={recentSearches}
                placeholder="상품명을 검색해보세요"
              />
            </div>
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">검색 중입니다...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="text-red-500 text-lg mb-4">❌ {error}</div>
              <button
                onClick={() => handleSearch(searchQuery)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              {/* 검색 결과 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    "{searchQuery}" 검색 결과
                  </h1>
                  <p className="text-gray-600 mt-1">
                    총 {searchResults.length}개의 상품을 찾았습니다
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Filter className="w-4 h-4" />
                    필터
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <SortAsc className="w-4 h-4" />
                    정렬
                  </button>
                </div>
              </div>

              {/* 상품 그리드 */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {searchResults.map((product) => {
                  const displayData = getProductDisplayData(product);
                  return (
                    <Card
                      key={displayData.id}
                      hoverable
                      className="overflow-hidden cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      {/* 상품 이미지 */}
                      <div className="relative">
                        <div className="absolute top-2 right-2 z-10">
                          <HeartButton 
                            product={{
                              id: displayData.id,
                              name: displayData.name,
                              url: product.url || `https://www.coupang.com/vp/products/${displayData.id}`,
                              image_url: displayData.image,
                              price: displayData.finalPrice,
                              rating: displayData.rating,
                              review_count: displayData.reviewCount
                            }} 
                            size="sm" 
                          />
                        </div>

                        <div className="aspect-square bg-gray-50 flex items-center justify-center p-3">
                          <img
                            src={displayData.image}
                            alt={displayData.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const currentSrc = target.src;
                              
                              console.log('❌ 이미지 로드 실패:', currentSrc);
                              
                              // 프록시 URL이 실패한 경우 원본 URL 시도
                              if (currentSrc.includes('/api/image/proxy')) {
                                const urlMatch = currentSrc.match(/url=([^&]+)/);
                                if (urlMatch) {
                                  const originalUrl = decodeURIComponent(urlMatch[1]);
                                  console.log('🔄 원본 URL로 재시도:', originalUrl);
                                  target.src = originalUrl;
                                  return;
                                }
                              }
                              
                              // 최종 fallback
                              if (!target.src.includes('data:image')) {
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiPuydtOuvuOyngOyXhuydjDwvdGV4dD4KPHN2Zz4=';
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* 상품 정보 */}
                      <div className="p-3 space-y-2">
                        <h4 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[2.5rem] leading-tight">
                          {displayData.name}
                        </h4>

                        {/* 가격 정보 */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            {displayData.discount && (
                              <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                                {displayData.discount}%
                              </span>
                            )}
                            <span className="text-red-500 font-bold text-base">
                              {formatPrice(displayData.finalPrice)}
                            </span>
                          </div>
                          {displayData.discount && displayData.originalPrice && (
                            <div className="text-xs text-gray-400 line-through">
                              {formatPrice(displayData.originalPrice)}
                            </div>
                          )}
                        </div>

                        {/* 별점 및 리뷰 */}
                        {displayData.rating > 0 && (
                          <div className="flex items-center gap-1">
                            {renderStars(displayData.rating)}
                            <span className="text-xs text-gray-500">
                              ({displayData.reviewCount.toLocaleString()})
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : searchQuery ? (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                "{searchQuery}"에 대한 검색 결과가 없습니다
              </h3>
              <p className="text-gray-600 mb-6">
                다른 키워드로 검색해보세요
              </p>
              <button
                onClick={() => handleSearch(searchQuery)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                다시 검색
              </button>
            </div>
          ) : (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                상품을 검색해보세요
              </h3>
              <p className="text-gray-600">
                위의 검색창에 원하는 상품명을 입력하세요
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
