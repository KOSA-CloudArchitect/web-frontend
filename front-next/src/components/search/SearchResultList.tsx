import React, { useState } from 'react';
import { Star, ShoppingCart, TrendingUp, ExternalLink, Loader2 } from 'lucide-react';
import { LoadingSpinner } from '../LoadingSpinner';
import { HeartButton } from '../HeartButton';
import { useRouter } from 'next/navigation';
import { apiService } from '../../services/api';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  category: string;
  isSponsored?: boolean;
  coupangUrl?: string;
}

interface SearchResultListProps {
  products: Product[];
  isLoading?: boolean;
  onProductClick: (product: Product) => void;
  onAnalyzeClick: (product: Product) => void;
  className?: string;
}

export const SearchResultList: React.FC<SearchResultListProps> = ({
  products,
  isLoading = false,
  onProductClick,
  onAnalyzeClick,
  className = ''
}) => {
  const router = useRouter();
  const [startingAnalysis, setStartingAnalysis] = useState<{ [key: string]: boolean }>({});
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getDiscountRate = (originalPrice: number, currentPrice: number): number => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  // 실시간 분석 시작 함수
  const handleStartRealtimeAnalysis = async (product: Product) => {
    if (startingAnalysis[product.id]) return;

    try {
      setStartingAnalysis(prev => ({ ...prev, [product.id]: true }));
      
      // job_id 생성 (현재 시간 기반)
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      // 분석 요청 API 호출
      const response = await apiService.post('/api/analyze', {
        product_id: product.id,
        url: product.coupangUrl || `https://www.coupang.com/vp/products/${product.id}`,
        job_id: jobId,
        review_cnt: 0, // 초기값
        source: 'search_list'
      });

      if (response.success) {
        // 성공하면 실시간 분석 페이지로 이동
        const productId = response.productId || response.taskId || product.id;
        router.push(`/analysis/${productId}/realtime`);
      } else {
        throw new Error(response.message || '분석 요청에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('❌ 실시간 분석 시작 실패:', error);
      // TODO: 토스트나 알림으로 에러 표시
    } finally {
      setStartingAnalysis(prev => ({ ...prev, [product.id]: false }));
    }
  };

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

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className}`}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">상품을 검색하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            검색 결과가 없습니다
          </h3>
          <p className="text-gray-600 mb-4">
            다른 검색어로 시도해보시거나 쿠팡에서 직접 찾아보세요.
          </p>
          <a
            href="https://www.coupang.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            쿠팡에서 찾아보기
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          검색 결과 ({products.length}개)
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4" />
          <span>인기순</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            {/* 상품 이미지 */}
            <div className="relative">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => onProductClick(product)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-product.png';
                }}
              />
              
              {product.isSponsored && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  광고
                </div>
              )}
              
              {/* 하트 버튼 */}
              <div className="absolute top-2 right-2 z-10">
                <HeartButton 
                  product={{
                    id: product.id,
                    name: product.name,
                    url: product.coupangUrl || `https://www.coupang.com/vp/products/${product.id}`,
                    image_url: product.imageUrl,
                    price: product.price,
                    rating: product.rating,
                    review_count: product.reviewCount
                  }} 
                  size="md" 
                />
              </div>
              
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="absolute top-2 right-12 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  {getDiscountRate(product.originalPrice, product.price)}% 할인
                </div>
              )}
            </div>

            {/* 상품 정보 */}
            <div className="p-4">
              <div className="mb-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {product.category}
                </span>
              </div>
              
              <h3
                className="font-medium text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => onProductClick(product)}
              >
                {product.name}
              </h3>

              {/* 가격 정보 */}
              <div className="mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(product.price)}원
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}원
                    </span>
                  )}
                </div>
              </div>

              {/* 평점 및 리뷰 */}
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-2">
                  {renderStars(product.rating)}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString()}개 리뷰)
                </span>
              </div>

              {/* 액션 버튼 */}
              <div className="flex space-x-2">
                <button
                  onClick={() => onAnalyzeClick(product)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  리뷰 분석
                </button>
                
                <button
                  onClick={() => handleStartRealtimeAnalysis(product)}
                  disabled={startingAnalysis[product.id]}
                  className={`flex items-center justify-center px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md transition-colors text-xs font-medium ${
                    startingAnalysis[product.id] 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:from-purple-600 hover:to-pink-600'
                  }`}
                  title="실시간 분석"
                >
                  {startingAnalysis[product.id] ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                </button>
                
                {product.coupangUrl && (
                  <a
                    href={product.coupangUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    title="쿠팡에서 보기"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-600" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 더 보기 버튼 (필요시) */}
      {products.length >= 20 && (
        <div className="text-center pt-8">
          <button className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            더 많은 상품 보기
          </button>
        </div>
      )}
    </div>
  );
};