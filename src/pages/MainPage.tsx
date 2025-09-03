import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, TrendingUp, Users, BarChart3, Zap, Shield, Clock,
  ChevronDown, ChevronUp, ShoppingCart, Star
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { SearchBar } from '../components/search/SearchBar';
import { Card, StatCard } from '../components/common/Card';
import { useIsAuthenticated } from '../stores/authStore';

// 타입 정의
interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'suggestion';
}

interface TrendingKeyword {
  rank: number;
  keyword: string;
  trend: 'up' | 'down';
  change: number;
  score?: number;
}

interface Product {
  id?: string;
  product_code?: string;
  title?: string;
  name?: string;
  original_price?: string | number;
  final_price?: string | number;
  origin_price?: string | number;
  review_rating?: string | number;
  review_count?: string | number;
  image_url?: string;
  url?: string;
}


// 별점 컴포넌트
const STAR_PATH = "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z";

const FullStar = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className="text-yellow-400" aria-hidden>
    <path d={STAR_PATH} fill="currentColor" />
  </svg>
);

const EmptyStar = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className="text-gray-300" aria-hidden>
    <path d={STAR_PATH} fill="currentColor" />
  </svg>
);

const HalfStar = ({ size = 12 }) => {
  const id = React.useId ? React.useId() : `half-${Math.random().toString(36).slice(2)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="text-yellow-400" aria-hidden>
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
      </defs>
      <path d={STAR_PATH} fill="currentColor" className="text-gray-300" />
      <g clipPath={`url(#${id})`}>
        <path d={STAR_PATH} fill="currentColor" />
      </g>
    </svg>
  );
};

const renderStars = (rating: number) => {
  const roundedRating = Math.round(rating * 2) / 2;
  const full = Math.floor(roundedRating);
  const hasHalf = roundedRating % 1 === 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  const stars = [];
  for (let i = 0; i < full; i++) stars.push(<FullStar key={`f-${i}`} />);
  if (hasHalf) stars.push(<HalfStar key="h" />);
  for (let i = 0; i < empty; i++) stars.push(<EmptyStar key={`e-${i}`} />);

  return <div className="flex gap-0.5">{stars}</div>;
};

export const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState<SearchSuggestion[]>([
    { id: '1', text: '아이폰 15', type: 'popular' },
    { id: '2', text: '갤럭시 S24', type: 'popular' },
    { id: '3', text: '에어팟 프로', type: 'popular' },
    { id: '4', text: '맥북 에어', type: 'popular' },
    { id: '5', text: '다이슨 청소기', type: 'popular' }
  ]);

  // 트렌딩 키워드 상태들
  const [trendingKeywords, setTrendingKeywords] = useState<TrendingKeyword[]>([]);
  const [keywordProducts, setKeywordProducts] = useState<{ [keyword: string]: Product[] }>({});
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [expandedKeywords, setExpandedKeywords] = useState<{ [key: number]: boolean }>({});

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

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    console.log(`🔍 메인페이지에서 검색 시작: "${query}"`);
    
    // 최근 검색어에 추가
    const updatedRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));

    // 즉시 검색 페이지로 이동 (API 호출 없이)
    console.log(`🚀 즉시 검색 페이지로 이동: /search?q=${encodeURIComponent(query)}`);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    
    // 검색 페이지에서 모든 로딩과 폴링 처리를 담당하도록 함
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.text);
  };

  // 트렌딩 키워드 관련 함수들
  const formatPrice = (priceInput: string | number | undefined): string => {
    if (!priceInput && priceInput !== 0) return '가격 정보 없음';
    
    const price = typeof priceInput === 'string' 
      ? parseFloat(priceInput.replace(/[^0-9.]/g, '')) 
      : parseFloat(String(priceInput));
    
    if (isNaN(price)) return '가격 정보 없음';
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const calculateDiscountRate = (originalPrice: string | number | undefined, finalPrice: string | number | undefined): number | null => {
    if (!originalPrice || !finalPrice) return null;
    
    const original = typeof originalPrice === 'string' 
      ? parseFloat(originalPrice.replace(/[^0-9.]/g, '')) 
      : parseFloat(String(originalPrice));
    const final = typeof finalPrice === 'string' 
      ? parseFloat(finalPrice.replace(/[^0-9.]/g, '')) 
      : parseFloat(String(finalPrice));
    
    if (isNaN(original) || isNaN(final) || original <= final) return null;
    return Math.round(((original - final) / original) * 100);
  };

  // API 데이터 가져오기
  const fetchTrendingKeywords = async () => {
    try {
      const response = await fetch('/api/trending/keywords');
      const data = await response.json();
      
      if (data.success) {
        console.log('📊 인기 키워드 데이터:', data.data);
        setTrendingKeywords(data.data || []);
      } else {
        console.error('인기 키워드 조회 실패:', data.message);
      }
    } catch (error) {
      console.error('인기 키워드 조회 오류:', error);
    }
  };

  const fetchKeywordProducts = async (keyword: string) => {
    if (keywordProducts[keyword]) {
      return; // 이미 로드된 경우 스킵
    }

    try {
      console.log(`🛒 키워드 "${keyword}" 상품 로드 중...`);
      const response = await fetch(`/api/trending/products/${encodeURIComponent(keyword)}?limit=6`);
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ 키워드 "${keyword}" 상품 ${data.count}개 로드 완료`);
        setKeywordProducts(prev => ({
          ...prev,
          [keyword]: data.data || []
        }));
      } else {
        console.error(`키워드 "${keyword}" 상품 조회 실패:`, data.message);
        setKeywordProducts(prev => ({
          ...prev,
          [keyword]: []
        }));
      }
    } catch (error) {
      console.error(`키워드 "${keyword}" 상품 조회 오류:`, error);
      setKeywordProducts(prev => ({
        ...prev,
        [keyword]: []
      }));
    }
  };

  const fetchRecommendedProducts = async () => {
    try {
      const response = await fetch('/api/trending/recommendations?limit=8');
      const data = await response.json();
      
      if (data.success) {
        console.log('⭐ 추천 상품 데이터:', data.data);
        setRecommendedProducts(data.data || []);
      } else {
        console.error('추천 상품 조회 실패:', data.message);
      }
    } catch (error) {
      console.error('추천 상품 조회 오류:', error);
    }
  };

  const toggleKeywordExpansion = async (rank: number) => {
    const isExpanding = !expandedKeywords[rank];
    
    setExpandedKeywords(prev => ({
      ...prev,
      [rank]: !prev[rank]
    }));

    // 확장하는 경우 해당 키워드의 상품 데이터 로드
    if (isExpanding && trendingKeywords[rank - 1]) {
      const keyword = trendingKeywords[rank - 1].keyword;
      await fetchKeywordProducts(keyword);
    }
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
          userId: 'anonymous', // 현재는 익명 사용자
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
        
        navigate(`/analysis/${encodeURIComponent(productCode)}?${queryParams.toString()}`);
      } else {
        console.error('❌ Analysis request failed:', result.message);
        alert('분석 요청에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('❌ Error requesting analysis:', error);
      alert('분석 요청 중 오류가 발생했습니다.');
    }
  };

  const handleKeywordSearch = (keyword: string) => {
    // handleSearch 함수를 재사용하여 크롤링도 함께 수행
    handleSearch(keyword);
  };

  // 트렌딩 데이터 로드
  useEffect(() => {
    const loadTrendingData = async () => {
      setTrendingLoading(true);
      try {
        // 동시에 인기 키워드와 추천 상품 로드
        await Promise.all([
          fetchTrendingKeywords(),
          fetchRecommendedProducts()
        ]);
      } catch (error) {
        console.error('트렌딩 데이터 로드 실패:', error);
      } finally {
        setTrendingLoading(false);
      }
    };

    loadTrendingData();
  }, []);

  // 상품 데이터 변환 함수
  const getProductDisplayData = (product: Product) => {
    const originalPrice = product.original_price || product.origin_price;
    const finalPrice = product.final_price;
    const discountRate = calculateDiscountRate(originalPrice, finalPrice);
    
    // 이미지 URL 처리 - 여러 가능한 필드 확인
    let imageUrl = product.image_url;
    if (!imageUrl && (product as any).img) {
      imageUrl = (product as any).img;
    }
    if (!imageUrl && (product as any).image) {
      imageUrl = (product as any).image;
    }
    if (!imageUrl && (product as any).thumbnail) {
      imageUrl = (product as any).thumbnail;
    }
    
    // 이미지 URL 처리
    if (imageUrl) {
      // 상대 경로인 경우 절대 경로로 변환
      if (imageUrl.startsWith('//')) {
        imageUrl = 'https:' + imageUrl;
      } else if (imageUrl.startsWith('/')) {
        imageUrl = 'https://www.coupang.com' + imageUrl;
      }
      
      // 쿠팡 이미지인 경우 프록시 사용
      if (imageUrl.includes('coupang.com') || imageUrl.includes('coupangcdn.com')) {
        imageUrl = `/api/image/proxy?url=${encodeURIComponent(imageUrl)}`;
      }
    }
    
    // 디버그 로그
    if (Math.random() < 0.1) {
      console.log('🖼️ 이미지 URL 처리:', {
        원본: product.image_url,
        최종: imageUrl,
        제품명: product.title || product.name
      });
    }
    
    return {
      id: product.product_code || product.id || Math.random().toString(),
      name: product.title || product.name || '상품명 없음',
      originalPrice: originalPrice,
      finalPrice: finalPrice,
      discount: discountRate,
      rating: parseFloat(String(product.review_rating || 0)) || 0,
      reviewCount: typeof product.review_count === 'string' 
        ? parseInt(product.review_count.replace(/[^0-9]/g, '')) || 0
        : parseInt(String(product.review_count || 0)) || 0,
      image: imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiPuyCge2JhOydtOuvuOyngDwvdGV4dD4KPHN2Zz4=',
      url: product.url
    };
  };

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      title: '실시간 분석',
      description: '상품 리뷰를 실시간으로 분석하여 즉시 결과를 제공합니다.'
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-green-600" />,
      title: '감정 분석',
      description: 'AI 기반 감정 분석으로 긍정, 부정, 중립 의견을 정확히 분류합니다.'
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
      title: '트렌드 분석',
      description: '시간별 리뷰 변화 추이를 분석하여 상품의 인기도 변화를 파악합니다.'
    },
    {
      icon: <Shield className="w-8 h-8 text-orange-600" />,
      title: '신뢰할 수 있는 결과',
      description: '대량의 리뷰 데이터를 종합 분석하여 객관적인 인사이트를 제공합니다.'
    }
  ];

  const stats = [
    { title: '분석된 상품', value: '12,847', trend: 'up' as const, trendValue: '+23%' },
    { title: '처리된 리뷰', value: '2.4M', trend: 'up' as const, trendValue: '+15%' },
    { title: '활성 사용자', value: '8,392', trend: 'up' as const, trendValue: '+8%' },
    { title: '평균 분석 시간', value: '2.3분', trend: 'down' as const, trendValue: '-12%' }
  ];

  return (
    <Layout>
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              리뷰 분석의 새로운 기준
              <span className="block text-blue-600">KOSA</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI 기반 실시간 리뷰 분석으로 더 나은 구매 결정을 내리세요. 
              수천 개의 리뷰를 몇 분 만에 분석하여 핵심 인사이트를 제공합니다.
            </p>
          </div>

          {/* 검색 바 */}
          <div className="max-w-4xl mx-auto mb-12">
            <SearchBar
              onSearch={handleSearch}
              onSuggestionSelect={handleSuggestionSelect}
              isLoading={false}
              suggestions={popularSearches}
              recentSearches={recentSearches}
              className="mb-6"
            />
            
            {/* 인기 검색어 */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">인기 검색어</p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularSearches.slice(0, 5).map((search) => (
                  <button
                    key={search.id}
                    onClick={() => handleSearch(search.text)}
                    className="px-3 py-1 bg-white bg-opacity-80 text-gray-700 rounded-full text-sm hover:bg-opacity-100 transition-all duration-200 border border-gray-200"
                  >
                    {search.text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CTA 버튼 */}
          <div className="text-center">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/search')}
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search className="w-5 h-5 mr-2" />
                상품 검색하기
              </button>
            ) : (
              <div className="space-x-4">
                <button
                  onClick={() => navigate('/signup')}
                  className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  무료로 시작하기
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  로그인
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              실시간 서비스 현황
            </h2>
            <p className="text-gray-600">
              KOSA가 제공하는 분석 서비스의 실시간 통계입니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                trend={stat.trend}
                trendValue={stat.trendValue}
                icon={index === 0 ? <BarChart3 className="w-6 h-6" /> : 
                      index === 1 ? <Users className="w-6 h-6" /> :
                      index === 2 ? <TrendingUp className="w-6 h-6" /> :
                      <Clock className="w-6 h-6" />}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 급상승 키워드 랭킹 섹션 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
              <TrendingUp className="w-8 h-8 text-orange-500" />
              급상승 키워드 랭킹
            </h2>
            <p className="text-gray-600">
              실시간으로 급상승하는 인기 키워드와 관련 상품을 확인하세요
            </p>
          </div>
          
          {trendingLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {trendingKeywords.slice(0, 5).map((item) => (
                <Card key={item.rank} hoverable className="overflow-hidden">
                  {/* 키워드 헤더 */}
                  <div
                    className={`flex items-center justify-between p-6 cursor-pointer transition-colors ${
                      expandedKeywords[item.rank] 
                        ? 'bg-purple-50 border-b border-purple-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleKeywordExpansion(item.rank)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-gray-800 w-8">
                        {item.rank}
                      </span>
                      <div className="flex items-center gap-3">
                        {item.trend === 'up' ? (
                          <div className="w-0 h-0 border-l-4 border-r-4 border-b-6 border-transparent border-b-orange-500"></div>
                        ) : (
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-blue-500"></div>
                        )}
                        <span 
                          className="text-lg font-semibold cursor-pointer hover:text-purple-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleKeywordSearch(item.keyword);
                          }}
                        >
                          {item.keyword}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${
                        item.trend === 'up' ? 'text-orange-500' : 'text-blue-500'
                      }`}>
                        {item.trend === 'up' ? '+' : '-'}{item.change}
                      </span>
                      {expandedKeywords[item.rank] ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* 상품 목록 (확장 시) */}
                  {expandedKeywords[item.rank] && (
                    <div className="p-6 bg-white">
                      {keywordProducts[item.keyword] ? (
                        keywordProducts[item.keyword].length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {keywordProducts[item.keyword].slice(0, 8).map((product) => {
                              const displayData = getProductDisplayData(product);
                              return (
                                <div
                                  key={displayData.id}
                                  className="bg-gray-50 border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow relative"
                                  onClick={() => handleProductClick(product)}
                                >
                                  {/* 장바구니 아이콘 */}
                                  <div className="absolute top-2 right-2 z-10">
                                    <div className="bg-purple-600 text-white p-1.5 rounded-full shadow-sm">
                                      <ShoppingCart className="w-4 h-4" />
                                    </div>
                                  </div>

                                  {/* 상품 이미지 */}
                                  <div className="relative">
                                    <img
                                      src={displayData.image}
                                      alt={displayData.name}
                                      className="w-full h-32 object-cover"
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

                                  {/* 상품 정보 */}
                                  <div className="p-3">
                                    <h4 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 leading-tight">
                                      {displayData.name}
                                    </h4>

                                    {/* 가격 정보 */}
                                    <div className="mb-2">
                                      <div className="flex items-center gap-1 mb-1">
                                        {displayData.discount && (
                                          <span className="text-sm text-orange-500 font-bold">
                                            {displayData.discount}%
                                          </span>
                                        )}
                                        <span className="text-base font-bold text-gray-900">
                                          {formatPrice(displayData.finalPrice)}
                                        </span>
                                      </div>
                                      {displayData.discount && displayData.originalPrice && (
                                        <div className="text-sm text-gray-500 line-through">
                                          {formatPrice(displayData.originalPrice)}
                                        </div>
                                      )}
                                    </div>

                                    {/* 별점 및 리뷰 */}
                                    {displayData.rating > 0 && (
                                      <div className="flex items-center gap-1">
                                        {renderStars(displayData.rating)}
                                        <span className="text-sm text-gray-500">
                                          ({displayData.reviewCount.toLocaleString()})
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            "{item.keyword}" 관련 상품이 없습니다.
                          </div>
                        )
                      ) : (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 후기 많은 상품 섹션 */}
      {recommendedProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  후기 많은 인기 상품
                </h2>
                <p className="text-gray-600">
                  많은 사용자들이 관심을 갖고 있는 인기 상품들을 확인해보세요
                </p>
              </div>
              <button className="text-blue-600 font-medium hover:underline">
                더보기 →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendedProducts.slice(0, 8).map((product) => {
                const displayData = getProductDisplayData(product);
                return (
                  <Card
                    key={displayData.id}
                    className="overflow-hidden cursor-pointer"
                    hoverable
                    onClick={() => handleProductClick(product)}
                  >
                    <img
                      src={displayData.image}
                      alt={displayData.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const currentSrc = target.src;
                        
                        console.log('❌ 추천 상품 이미지 로드 실패:', currentSrc);
                        
                        // 프록시 URL이 실패한 경우 원본 URL 시도
                        if (currentSrc.includes('/api/image/proxy')) {
                          const urlMatch = currentSrc.match(/url=([^&]+)/);
                          if (urlMatch) {
                            const originalUrl = decodeURIComponent(urlMatch[1]);
                            console.log('🔄 추천 상품 원본 URL로 재시도:', originalUrl);
                            target.src = originalUrl;
                            return;
                          }
                        }
                        
                        // 최종 fallback
                        if (!target.src.includes('data:image')) {
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj7snbTrr7jsp4DslYbsnYw8L3RleHQ+Cjwvc3ZnPg==';
                        }
                      }}
                    />
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
                        {displayData.name}
                      </h4>
                      {displayData.rating > 0 && (
                        <div className="flex items-center gap-2">
                          {renderStars(displayData.rating)}
                          <span className="text-sm text-gray-500">
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
        </section>
      )}

      {/* 기능 소개 섹션 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              왜 KOSA를 선택해야 할까요?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              최신 AI 기술과 빅데이터 분석을 통해 정확하고 신뢰할 수 있는 
              리뷰 분석 결과를 제공합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center" hoverable>
                <div className="flex flex-col items-center">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 시작하기 섹션 */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            지금 바로 시작해보세요
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            몇 분 만에 수천 개의 리뷰를 분석하고 
            데이터 기반의 현명한 구매 결정을 내려보세요.
          </p>
          
          {!isAuthenticated && (
            <div className="space-x-4">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                무료 회원가입
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center px-8 py-3 border border-blue-400 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                로그인
              </button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default MainPage;