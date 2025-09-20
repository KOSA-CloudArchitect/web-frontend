"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, ChevronDown, ChevronUp, ShoppingCart } from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { SearchBar } from "../components/search/SearchBar";
import { Card } from "../components/common/Card";

// 타입 정의
interface SearchSuggestion {
  id: string;
  text: string;
  type: "recent" | "popular" | "suggestion";
}

interface TrendingKeyword {
  rank: number;
  keyword: string;
  trend: "up" | "down";
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
const STAR_PATH =
  "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z";

const FullStar: React.FC<{ size?: number }> = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className="text-yellow-400" aria-hidden>
    <path d={STAR_PATH} fill="currentColor" />
  </svg>
);

const EmptyStar: React.FC<{ size?: number }> = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className="text-gray-300" aria-hidden>
    <path d={STAR_PATH} fill="currentColor" />
  </svg>
);

const HalfStar: React.FC<{ size?: number }> = ({ size = 12 }) => {
  const id = `half-${Math.random().toString(36).slice(2)}`;
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

const Page: React.FC = () => {
  const router = useRouter();

  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState<SearchSuggestion[]>([
    { id: "1", text: "아이폰 15", type: "popular" },
    { id: "2", text: "갤럭시 S24", type: "popular" },
    { id: "3", text: "에어팟 프로", type: "popular" },
    { id: "4", text: "맥북 에어", type: "popular" },
    { id: "5", text: "다이슨 청소기", type: "popular" },
  ]);

  // 트렌딩 키워드 상태들
  const [trendingKeywords, setTrendingKeywords] = useState<TrendingKeyword[]>([]);
  const [keywordProducts, setKeywordProducts] = useState<{ [keyword: string]: Product[] }>({});
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [expandedKeywords, setExpandedKeywords] = useState<{ [key: number]: boolean }>({});

  // 최근 검색어 로드
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("recentSearches") : null;
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error("최근 검색어 로드 실패:", error);
      }
    }
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    console.log(`🔍 메인페이지에서 검색 시작: "${query}"`);

    // 최근 검색어에 추가
    const updatedRecent = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 10);
    setRecentSearches(updatedRecent);
    if (typeof window !== "undefined") {
      localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));
    }

    // 즉시 검색 페이지로 이동 (응답 대기하지 않음)
    console.log(`🚀 검색 페이지로 이동: /search?query=${encodeURIComponent(query)}`);
    router.push(`/search?query=${encodeURIComponent(query)}`);

    // 크롤링 요청을 백그라운드에서 비동기로 시작 (Fire & Forget)
    console.log(`📡 백그라운드 크롤링 요청 시작: "${query}"`);
    
    fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword: query,
        max_links: 10,
      }),
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        console.log(`✅ 백그라운드 크롤링 요청 성공: ${result.jobId}`);
      } else {
        console.warn(`⚠️ 백그라운드 크롤링 요청 실패: ${result.error}`);
      }
    })
    .catch(error => {
      console.warn(`⚠️ 백그라운드 크롤링 요청 오류:`, error);
    });
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.text);
  };

  // 포맷/계산 유틸
  const formatPrice = (priceInput: string | number | undefined): string => {
    if (!priceInput && priceInput !== 0) return "가격 정보 없음";
    const price =
      typeof priceInput === "string"
        ? parseFloat(priceInput.replace(/[^0-9.]/g, ""))
        : parseFloat(String(priceInput));
    if (isNaN(price)) return "가격 정보 없음";
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  const calculateDiscountRate = (
    originalPrice: string | number | undefined,
    finalPrice: string | number | undefined
  ): number | null => {
    if (!originalPrice || !finalPrice) return null;
    const original =
      typeof originalPrice === "string"
        ? parseFloat(originalPrice.replace(/[^0-9.]/g, ""))
        : parseFloat(String(originalPrice));
    const final =
      typeof finalPrice === "string"
        ? parseFloat(finalPrice.replace(/[^0-9.]/g, ""))
        : parseFloat(String(finalPrice));
    if (isNaN(original) || isNaN(final) || original <= final) return null;
    return Math.round(((original - final) / original) * 100);
  };

  // API
  const fetchTrendingKeywords = async () => {
    try {
      const response = await fetch("/api/trending/keywords");
      const data = await response.json();
      if (data.success) {
        console.log("📊 인기 키워드 데이터:", data.data);
        setTrendingKeywords(data.data || []);
      } else {
        console.error("인기 키워드 조회 실패:", data.message);
      }
    } catch (error) {
      console.error("인기 키워드 조회 오류:", error);
    }
  };

  const fetchKeywordProducts = async (keyword: string) => {
    if (keywordProducts[keyword]) return;
    try {
      console.log(`🛒 키워드 "${keyword}" 상품 로드 중...`);
      const response = await fetch(`/api/trending/products/${encodeURIComponent(keyword)}?limit=6`);
      const data = await response.json();
      if (data.success) {
        console.log(`✅ 키워드 "${keyword}" 상품 ${data.count}개 로드 완료`);
        setKeywordProducts((prev) => ({
          ...prev,
          [keyword]: data.data || [],
        }));
      } else {
        console.error(`키워드 "${keyword}" 상품 조회 실패:`, data.message);
        setKeywordProducts((prev) => ({ ...prev, [keyword]: [] }));
      }
    } catch (error) {
      console.error(`키워드 "${keyword}" 상품 조회 오류:`, error);
      setKeywordProducts((prev) => ({ ...prev, [keyword]: [] }));
    }
  };

  const fetchRecommendedProducts = async () => {
    try {
      const response = await fetch(`/api/trending/recommendations?limit=8`);
      const data = await response.json();
      if (data.success) {
        console.log("⭐ 추천 상품 데이터:", data.data);
        setRecommendedProducts(data.data || []);
      } else {
        console.error("추천 상품 조회 실패:", data.message);
      }
    } catch (error) {
      console.error("추천 상품 조회 오류:", error);
    }
  };

  const toggleKeywordExpansion = async (rank: number) => {
    const isExpanding = !expandedKeywords[rank];
    setExpandedKeywords((prev) => ({ ...prev, [rank]: !prev[rank] }));
    if (isExpanding && trendingKeywords[rank - 1]) {
      const keyword = trendingKeywords[rank - 1].keyword;
      await fetchKeywordProducts(keyword);
    }
  };

  const handleProductClick = async (product: Product) => {
    const productCode = product.product_code || product.id || "unknown";
    const productUrl = product.url || `https://www.coupang.com/products/${productCode}`;
    try {
      console.log(`🔄 Starting analysis for product: ${productCode}`);
      const response = await fetch("/api/analyze/airflow/single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: productCode,
          productUrl,
          userId: "anonymous",
        }),
      });
      const result = await response.json();
      if (result.success) {
        console.log(`✅ Analysis started successfully:`, result);
        const taskId = result.taskId || result.dagRunId;
        const params = new URLSearchParams({
          taskId,
          ...(result.dagRunId && { dagRunId: result.dagRunId }),
          ...(result.dagId && { dagId: result.dagId }),
          ...(result.status && { status: result.status }),
        });
        router.push(`/analysis/${encodeURIComponent(productCode)}?${params.toString()}`);
      } else {
        console.error("❌ Analysis request failed:", result.message);
        alert("분석 요청에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("❌ Error requesting analysis:", error);
      alert("분석 요청 중 오류가 발생했습니다.");
    }
  };

  const handleKeywordSearch = (keyword: string) => {
    handleSearch(keyword);
  };

  // 트렌딩 데이터 로드
  useEffect(() => {
    const loadTrendingData = async () => {
      setTrendingLoading(true);
      try {
        await Promise.all([fetchTrendingKeywords(), fetchRecommendedProducts()]);
      } catch (error) {
        console.error("트렌딩 데이터 로드 실패:", error);
      } finally {
        setTrendingLoading(false);
      }
    };
    loadTrendingData();
  }, []);

  // 상품 데이터 변환
  const getProductDisplayData = (product: Product) => {
    const originalPrice = product.original_price || product.origin_price;
    const finalPrice = product.final_price;
    const discountRate = calculateDiscountRate(originalPrice, finalPrice);

    let imageUrl = product.image_url as string | undefined;
    if (!imageUrl && (product as any).img) imageUrl = (product as any).img;
    if (!imageUrl && (product as any).image) imageUrl = (product as any).image;
    if (!imageUrl && (product as any).thumbnail) imageUrl = (product as any).thumbnail;

    if (imageUrl) {
      if (imageUrl.startsWith("//")) imageUrl = "https:" + imageUrl;
      else if (imageUrl.startsWith("/")) imageUrl = "https://www.coupang.com" + imageUrl;
      if (imageUrl.includes("coupang.com") || imageUrl.includes("coupangcdn.com")) {
        imageUrl = `/api/image/proxy?url=${encodeURIComponent(imageUrl)}`;
      }
    }

    if (Math.random() < 0.1) {
      console.log("🖼️ 이미지 URL 처리:", {
        원본: product.image_url,
        최종: imageUrl,
        제품명: product.title || product.name,
      });
    }

    return {
      id: product.product_code || product.id || Math.random().toString(),
      name: product.title || product.name || "상품명 없음",
      originalPrice,
      finalPrice,
      discount: discountRate,
      rating: parseFloat(String(product.review_rating || 0)) || 0,
      reviewCount:
        typeof product.review_count === "string"
          ? parseInt(product.review_count.replace(/[^0-9]/g, "")) || 0
          : parseInt(String(product.review_count || 0)) || 0,
      image:
        imageUrl ||
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiPuyCge2JhOydtOovuOyngDwvdGV4dD4KPHN2Zz4=",
      url: product.url,
    };
  };

  return (
    <Layout>
      {/* 히어로 섹션 */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(236, 253, 245, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(254, 242, 242, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(250, 245, 255, 0.6) 0%, transparent 50%),
            linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
          `,
          minHeight: "60vh",
        }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-16 pt-20">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-8 leading-tight">
              원하시는 상품에 대한 리뷰를
              <br />
              분석해 드립니다.
            </h1>
            <p className="text-xl text-gray-700 mb-16 max-w-2xl mx-auto">
              상품명을 검색하여 AI가 분석한 리뷰 요약을 확인하세요
            </p>
          </div>

          {/* 검색 바 */}
          <div className="max-w-2xl mx-auto mb-16">
            <SearchBar
              onSearch={handleSearch}
              onSuggestionSelect={handleSuggestionSelect}
              isLoading={false}
              suggestions={popularSearches}
              recentSearches={recentSearches}
              placeholder="상품명을 검색해보세요"
            />
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">예: 아이폰 15, 다이슨 청소거, 맥북 에어 등</p>
            </div>
          </div>

          {/* 리뷰 카드 마키 효과 */}
          <div className="overflow-hidden py-8 mb-16">
            <style>{`
              @keyframes scroll-left {
                from { transform: translateX(0); }
                to { transform: translateX(-50%); }
              }
              .reviews-slider {
                display: flex; gap: 1.5rem; width: max-content;
                animation: scroll-left 30s linear infinite;
              }
              .review-card {
                flex: 0 0 auto; background: white; border-radius: 16px;
                padding: 1.5rem 1.8rem; min-width: 320px; max-width: 320px;
                box-shadow: 0 4px 24px rgba(0,0,0,0.04), 0 1px 8px rgba(0,0,0,0.02);
                border: 1px solid rgba(0,0,0,0.03);
              }
            `}</style>

            <div className="reviews-slider">
              {/* 세트 1 */}
              <div className="review-card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400">⭐⭐⭐⭐</span>
                  <span className="text-sm font-medium text-gray-700">4.2</span>
                </div>
                <p className="text-gray-800 text-sm leading-relaxed mb-3 line-clamp-4">
                  "가성비는 좋은데 배송이 조금 늦었어요. 제품 자체는 만족합니다. 특히 무선이라 편리하고 충전도 오래가서 좋네요!"
                </p>
                <div className="text-xs text-gray-500">이○○ 님 · LG 코드제로</div>
              </div>

              <div className="review-card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                  <span className="text-sm font-medium text-gray-700">4.9</span>
                </div>
                <p className="text-gray-800 text-sm leading-relaxed mb-3 line-clamp-4">
                  "진짜 대박이에요! 반려동물 털까지 깨끗하게 흡입되고, 계단 청소할 때도 가볍고 편해요. 강추합니다!"
                </p>
                <div className="text-xs text-gray-500">박○○ 님 · 샤오미 무선청소기</div>
              </div>

              <div className="review-card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400">⭐⭐⭐</span>
                  <span className="text-sm font-medium text-gray-700">3.5</span>
                </div>
                <p className="text-gray-800 text-sm leading-relaxed mb-3 line-clamp-4">
                  "흡입력은 괜찮은데 소음이 좀 크네요. 그래도 가격 대비 나쁘지 않습니다. 필터 관리만 잘하면 오래 쓸 것 같아요."
                </p>
                <div className="text-xs text-gray-500">최○○ 님 · 일렉트로룩스</div>
              </div>

              <div className="review-card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                  <span className="text-sm font-medium text-gray-700">5.0</span>
                </div>
                <p className="text-gray-800 text-sm leading-relaxed mb-3 line-clamp-4">
                  "완전 만족해요! 디자인도 이쁘고 성능도 좋고, 무엇보다 A/S가 잘 되어 있어서 안심이에요. 재구매 의향 100%!"
                </p>
                <div className="text-xs text-gray-500">정○○ 님 · 다이슨 V12</div>
              </div>

              <div className="review-card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                  <span className="text-sm font-medium text-gray-700">4.8</span>
                </div>
                <p className="text-gray-800 text-sm leading-relaxed mb-3 line-clamp-4">
                  "청소기 정말 좋아요! 흡입력도 강하고 소음도 적당해서 밤에도 사용할 수 있어요. 필터 청소도 생각보다 간단하네요. 추천합니다."
                </p>
                <div className="text-xs text-gray-500">김○○ 님 · 다이슨 V15</div>
              </div>

              {/* 세트 2 (무한 루프용 반복) */}
              <div className="review-card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400">⭐⭐⭐⭐</span>
                  <span className="text-sm font-medium text-gray-700">4.2</span>
                </div>
                <p className="text-gray-800 text-sm leading-relaxed mb-3 line-clamp-4">
                  "가성비는 좋은데 배송이 조금 늦었어요. 제품 자체는 만족합니다. 특히 무선이라 편리하고 충전도 오래가서 좋네요!"
                </p>
                <div className="text-xs text-gray-500">이○○ 님 · LG 코드제로</div>
              </div>

              <div className="review-card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                  <span className="text-sm font-medium text-gray-700">4.9</span>
                </div>
                <p className="text-gray-800 text-sm leading-relaxed mb-3 line-clamp-4">
                  "진짜 대박이에요! 반려동물 털까지 깨끗하게 흡입되고, 계단 청소할 때도 가볍고 편해요. 강추합니다!"
                </p>
                <div className="text-xs text-gray-500">박○○ 님 · 샤오미 무선청소기</div>
              </div>

              <div className="review-card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400">⭐⭐⭐</span>
                  <span className="text-sm font-medium text-gray-700">3.5</span>
                </div>
                <p className="text-gray-800 text-sm leading-relaxed mb-3 line-clamp-4">
                  "흡입력은 괜찮은데 소음이 좀 크네요. 그래도 가격 대비 나쁘지 않습니다. 필터 관리만 잘하면 오래 쓸 것 같아요."
                </p>
                <div className="text-xs text-gray-500">최○○ 님 · 일렉트로룩스</div>
              </div>

              <div className="review-card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                  <span className="text-sm font-medium text-gray-700">5.0</span>
                </div>
                <p className="text-gray-800 text-sm leading-relaxed mb-3 line-clamp-4">
                  "완전 만족해요! 디자인도 이쁘고 성능도 좋고, 무엇보다 A/S가 잘 되어 있어서 안심이에요. 재구매 의향 100%!"
                </p>
                <div className="text-xs text-gray-500">정○○ 님 · 다이슨 V12</div>
              </div>

              <div className="review-card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                  <span className="text-sm font-medium text-gray-700">4.8</span>
                </div>
                <p className="text-gray-800 text-sm leading-relaxed mb-3 line-clamp-4">
                  "청소기 정말 좋아요! 흡입력도 강하고 소음도 적당해서 밤에도 사용할 수 있어요. 필터 청소도 생각보다 간단하네요. 추천합니다."
                </p>
                <div className="text-xs text-gray-500">김○○ 님 · 다이슨 V15</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 긴 리뷰 → AI 요약 섹션 (원본과 동일) */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 제목 */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">원래는 이런 긴 내용의 후기들...</h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">
              수백 개의 긴 리뷰를 하나하나 읽기 어려우셨나요?
              <br />
              AI가 핵심만 골라 한눈에 정리해드립니다.
            </p>
          </div>

          {/* 실제 긴 리뷰들 */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-12 max-h-96 overflow-y-auto shadow-inner">
            <div className="space-y-8">
              {/* 리뷰 1 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">김○○</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                        <span className="text-sm text-gray-500">5.0</span>
                      </div>
                      <span className="text-xs text-gray-400">다이슨 V15 무선청소기</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-800 leading-relaxed text-sm">
                  청소기 구매 후 3개월 사용기입니다. 처음에는 가격이 부담스러웠는데 막상 써보니 정말 만족스럽네요. 흡입력이 엄청 강하고 특히 카펫 청소할 때 효과가 뛰어납니다.
                  무선이라 계단 청소도 편하고 배터리도 생각보다 오래 가요. 다만 먼지통 비우는 것이 조금 번거롭긴 하지만 전체적으로는 매우 만족합니다. 특히 반려동물 털 제거에
                  탁월해요. 브러시 헤드가 여러 개 있어서 상황에 맞게 사용할 수 있고, 벽걸이 거치대도 설치가 간단했습니다. 소음도 생각보다 적당한 수준이고 밤에 사용해도 크게
                  부담스럽지 않아요. 필터 청소도 물로 간단히 할 수 있어서 관리가 편합니다. 가격은 비싸지만 성능을 생각하면 충분히 값어치 한다고 봅니다.
                </p>
              </div>

              {/* 리뷰 2 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-sm">박○○</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">⭐⭐⭐⭐</span>
                        <span className="text-sm text-gray-500">4.0</span>
                      </div>
                      <span className="text-xs text-gray-400">LG 코드제로 A9S</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-800 leading-relaxed text-sm">
                  LG 코드제로 구매한지 2달 정도 됐는데 전반적으로 만족하고 있습니다. 일단 무선청소기 중에서 가성비가 좋은 것 같아요. 흡입력도 나쁘지 않고 배터리 지속시간도
                  적당합니다. 다만 카펫 청소할 때는 다이슨만큼 강력하지는 않네요. 하지만 일반 바닥 청소에는 충분합니다. 먼지통이 투명해서 얼마나 먼지가 빨려들어가는지 눈으로
                  확인할 수 있어서 좋고, 비우기도 간단해요. 소음은 보통 수준이고, 충전 시간도 빠른 편입니다. 헤드 교체도 쉽고 틈새 청소용 브러시도 유용하게 사용하고 있어요.
                  가격 대비 성능은 만족스럽지만 프리미엄 제품들과 비교하면 약간의 아쉬움은 있습니다. 그래도 가정용으로는 충분히 괜찮은 제품이라고 생각해요.
                </p>
              </div>

              {/* 리뷰 3 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-sm">이○○</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">⭐⭐⭐</span>
                        <span className="text-sm text-gray-500">3.0</span>
                      </div>
                      <span className="text-xs text-gray-400">샤오미 무선청소기</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-800 leading-relaxed text-sm">
                  샤오미 무선청소기 한달 사용 후기입니다. 일단 가격이 정말 저렴해서 구매했는데, 가격만큼의 성능은 하는 것 같아요. 기본적인 청소는 잘 되지만 카펫이나 러그 청소에서는
                  한계가 느껴집니다. 흡입력이 강하지 않아서 큰 먼지나 머리카락 같은 건 여러 번 지나가야 해요. 배터리 지속시간도 짧은 편이라 넓은 집 청소하기에는 부족합니다. 하지만
                  원룸이나 작은 공간 청소용으로는 나쁘지 않아요. 무게도 가볍고 조작도 간단해서 사용하기 편합니다. 먼지통 용량은 작은 편이지만 자주 비우면 되니까 큰 문제는 아니에요.
                  소음도 적당하고 디자인도 깔끔한 편입니다. 가성비를 고려한다면 추천할 만하지만, 성능을 중시한다면 조금 더 투자하는 게 좋을 것 같습니다.
                </p>
              </div>

              {/* 더 있음 */}
              <div className="text-center py-6">
                <div className="bg-white rounded-xl p-4 border-2 border-dashed border-gray-300">
                  <span className="text-gray-400 text-sm">... 이런 긴 리뷰가 수백 개 더 있습니다 ...</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI 분석 프로세스 */}
          <div className="text-center mb-16">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* 단계 */}
                <div className="flex items-center justify-center mb-8">
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                        <span className="text-2xl">📝</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">긴 리뷰</span>
                    </div>

                    <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-200 to-green-200"></div>

                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                        <span className="text-2xl">🤖</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">AI 분석</span>
                    </div>

                    <div className="flex-1 h-0.5 bg-gradient-to-r from-green-200 to-green-400"></div>

                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                        <span className="text-2xl">✨</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">요약 카드</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 rounded-2xl p-8 mb-8">
                  <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">🧠 AI가 똑똑하게 분석해서</h3>
                  <p className="text-center text-gray-600 text-lg">복잡하고 긴 리뷰들을 읽기 쉬운 카드로 정리해드려요</p>
                </div>
              </div>
            </div>
          </div>

          {/* 요약 카드 마키 */}
          <div className="overflow-hidden py-8">
            <style>{`
              @keyframes scroll-cards {
                from { transform: translateX(0); }
                to { transform: translateX(-50%); }
              }
              .summary-slider { display: flex; gap: 2.5rem; width: max-content; animation: scroll-cards 35s linear infinite; }
              .summary-card {
                flex: 0 0 auto; background: #fff; border-radius: 20px; padding: 2.5rem;
                min-width: 360px; max-width: 360px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.06), 0 2px 16px rgba(0,0,0,0.03);
                border: 1px solid rgba(0,0,0,0.05);
                position: relative; overflow: hidden;
                transition: all .3s cubic-bezier(.4,0,.2,1);
              }
              .summary-card:hover { transform: translateY(-8px); box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5); }
              .summary-card::before { content:''; position:absolute; top:0; left:0; right:0; height:5px; background:linear-gradient(90deg, var(--gradient-from), var(--gradient-to)); box-shadow: 0 2px 8px rgba(var(--gradient-shadow), .3); }
              .summary-card::after { content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%; background:radial-gradient(circle, rgba(var(--gradient-glow), .02) 0%, transparent 70%); pointer-events:none; }
              .positive { --gradient-from:#059669; --gradient-to:#10b981; --gradient-shadow:5,150,105; --gradient-glow:16,185,129; }
              .negative { --gradient-from:#dc2626; --gradient-to:#ef4444; --gradient-shadow:239,68,68; --gradient-glow:248,113,113; }
              .neutral { --gradient-from:#4f46e5; --gradient-to:#7c3aed; --gradient-shadow:99,102,241; --gradient-glow:139,92,246; }
              .rating { --gradient-from:#d97706; --gradient-to:#f59e0b; --gradient-shadow:245,158,11; --gradient-glow:251,191,36; }
            `}</style>

            <div className="summary-slider">
              <div className="summary-card positive">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">😊</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">긍정 요소</h3>
                    <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full font-medium shadow-sm">
                      AI 요약
                    </span>
                  </div>
                </div>
                <ul className="text-sm text-gray-700 space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span>강력한 흡입력과 우수한 성능</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span>무선으로 편리한 사용성</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span>반려동물 털 제거에 탁월함</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span>배터리 지속시간 우수함</span>
                  </li>
                </ul>
              </div>

              <div className="summary-card negative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-100 to-rose-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">😔</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">개선점</h3>
                    <span className="text-xs bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 py-1 rounded-full font-medium shadow-sm">
                      AI 분석
                    </span>
                  </div>
                </div>
                <ul className="text-sm text-gray-700 space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                    <span>높은 가격 부담감</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                    <span>먼지통 비우기 번거로움</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                    <span>일부 제품 소음 발생</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                    <span>브랜드별 성능 차이 존재</span>
                  </li>
                </ul>
              </div>

              <div className="summary-card neutral">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">구매 가이드</h3>
                    <span className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full font-medium shadow-sm">
                      AI 추천
                    </span>
                  </div>
                </div>
                <ul className="text-sm text-gray-700 space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span>집 크기에 맞는 배터리 용량 선택</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span>반려동물 유무에 따른 브러시 선택</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span>정기 필터 교체 및 청소 필요</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span>가성비 vs 성능 우선순위 고려</span>
                  </li>
                </ul>
              </div>

              <div className="summary-card rating">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">종합 평가</h3>
                    <span className="text-xs bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-3 py-1 rounded-full font-medium shadow-sm">
                      4.2/5.0
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-600 font-semibold">추천도:</span>
                      <span className="text-green-700 font-bold">매우 높음</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      전반적으로 사용자 만족도가 높은 제품군입니다. 특히 다이슨과 LG가 성능과 가성비에서 우수한 평가를 받고 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="summary-card neutral">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-violet-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">브랜드 분석</h3>
                    <span className="text-xs bg-gradient-to-r from-purple-500 to-violet-500 text-white px-3 py-1 rounded-full font-medium shadow-sm">
                      시장 분석
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm font-medium">다이슨</span>
                    <span className="text-sm text-green-600 font-bold">4.8/5.0</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm font-medium">LG</span>
                    <span className="text-sm text-blue-600 font-bold">4.2/5.0</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm font-medium">샤오미</span>
                    <span className="text-sm text-orange-600 font-bold">3.8/5.0</span>
                  </div>
                </div>
              </div>

              <div className="summary-card positive">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">핵심 포인트</h3>
                    <span className="text-xs bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-1 rounded-full font-medium shadow-sm">
                      결론
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-xl border border-teal-100">
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    <strong>무선청소기는 편의성과 성능을 모두 갖춘 필수 가전</strong>
                  </p>
                  <p className="text-xs text-gray-600">예산과 사용 환경을 고려하여 브랜드를 선택하면 만족도 높은 구매가 가능합니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 급상승 키워드 랭킹 섹션 */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <TrendingUp className="w-6 h-6 text-orange-500" />
              급상승 키워드 랭킹
            </h2>
            <p className="text-gray-500 text-sm">실시간으로 급상승하는 인기 키워드를 확인하세요</p>
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
                      expandedKeywords[item.rank] ? "bg-purple-50 border-b border-purple-200" : "hover:bg-gray-50"
                    }`}
                    onClick={() => toggleKeywordExpansion(item.rank)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-gray-800 w-8">{item.rank}</span>
                      <div className="flex items-center gap-3">
                        {item.trend === "up" ? (
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
                      <span className={`text-sm font-medium ${item.trend === "up" ? "text-orange-500" : "text-blue-500"}`}>
                        {item.trend === "up" ? "+" : "-"}
                        {item.change}
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
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {keywordProducts[item.keyword].slice(0, 8).map((product) => {
                              const displayData = getProductDisplayData(product);
                              return (
                                <div
                                  key={displayData.id}
                                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-200"
                                  onClick={() => handleProductClick(product)}
                                >
                                  {/* 상품 이미지 */}
                                  <div className="relative">
                                    <div className="absolute top-2 right-2 z-10">
                                      <div className="bg-purple-600 text-white p-1 rounded-full shadow-sm">
                                        <ShoppingCart className="w-3 h-3" />
                                      </div>
                                    </div>

                                    <div className="aspect-square bg-gray-50 flex items-center justify-center p-3">
                                      <img
                                        src={displayData.image}
                                        alt={displayData.name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          const currentSrc = target.src;
                                          console.log("❌ 이미지 로드 실패:", currentSrc);
                                          if (currentSrc.includes("/api/image/proxy")) {
                                            const urlMatch = currentSrc.match(/url=([^&]+)/);
                                            if (urlMatch) {
                                              const originalUrl = decodeURIComponent(urlMatch[1]);
                                              console.log("🔄 원본 URL로 재시도:", originalUrl);
                                              target.src = originalUrl;
                                              return;
                                            }
                                          }
                                          if (!target.src.includes("data:image")) {
                                            target.src =
                                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiPuydtOovuOyngOyXhuydjDwvdGV4dD4KPHN2Zz4=";
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

                                    {/* 가격 */}
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

                                    {/* 별점 */}
                                    {displayData.rating > 0 && (
                                      <div className="flex items-center gap-1">
                                        {renderStars(displayData.rating)}
                                        <span className="text-xs text-gray-500">
                                          ({displayData.reviewCount.toLocaleString()})
                                        </span>
                                      </div>
                                    )}

                                    {/* 라벨 */}
                                    <div className="flex flex-wrap gap-1">
                                      <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded">
                                        {item.keyword}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            <span className="text-4xl mb-4 block">😭</span>
                            <p className="text-lg">"{item.keyword}" 관련 상품이 없습니다.</p>
                          </div>
                        )
                      ) : (
                        <div className="flex justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-4 border-yellow-400 border-t-transparent"></div>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-2">후기 많은 인기 상품</h2>
                <p className="text-gray-600">많은 사용자들이 관심을 갖고 있는 인기 상품들을 확인해보세요</p>
              </div>
              <button
                className="text-blue-600 font-medium hover:underline"
                onClick={() => router.push("/popular")}
              >
                더보기 →
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {recommendedProducts.slice(0, 8).map((product) => {
                const displayData = getProductDisplayData(product);
                return (
                  <div
                    key={displayData.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-200"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="aspect-square bg-gray-50 flex items-center justify-center p-3">
                      <img
                        src={displayData.image}
                        alt={displayData.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const currentSrc = target.src;
                          console.log("❌ 추천 상품 이미지 로드 실패:", currentSrc);
                          if (currentSrc.includes("/api/image/proxy")) {
                            const urlMatch = currentSrc.match(/url=([^&]+)/);
                            if (urlMatch) {
                              const originalUrl = decodeURIComponent(urlMatch[1]);
                              console.log("🔄 추천 상품 원본 URL로 재시도:", originalUrl);
                              target.src = originalUrl;
                              return;
                            }
                          }
                          if (!target.src.includes("data:image")) {
                            target.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj7snbTrr7jsp4DslYbsnYw8L3RleHQ+Cjwvc3ZnPg==";
                          }
                        }}
                      />
                    </div>
                    <div className="p-3 space-y-2">
                      <h4 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[2.5rem] leading-tight">
                        {displayData.name}
                      </h4>
                      {displayData.rating > 0 && (
                        <div className="flex items-center gap-1">
                          {renderStars(displayData.rating)}
                          <span className="text-xs text-gray-500">({displayData.reviewCount.toLocaleString()})</span>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">추천상품</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
    </div>
        </section>
      )}
    </Layout>
  );
};

export default Page;
