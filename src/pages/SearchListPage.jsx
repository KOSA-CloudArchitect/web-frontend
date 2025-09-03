import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import BottomBar from "../components/BottomBar";
import ProductList from "../components/ProductList";
import { HeartButton } from "../components/HeartButton";

// 추천 검색어 예시 (고정)
const RECOMMEND_SUGGESTIONS = [
  { id: 1, name: "청소기" },
  { id: 2, name: "노트북" },
  { id: 3, name: "에어컨" },
  { id: 4, name: "냉장고" },
  { id: 5, name: "선풍기" },
];

/* =========================
 * ⭐ 별 아이콘 (Full / Half / Empty)
 *  - HalfStar는 clipPath로 반쪽만 채운 "진짜 반별" 아이콘
 * ========================= */
const STAR_PATH =
  "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z";

const FullStar = ({ size = 16, className = "text-yellow-500" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <path d={STAR_PATH} fill="currentColor" />
  </svg>
);

const EmptyStar = ({ size = 16, className = "text-gray-300" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <path d={STAR_PATH} fill="currentColor" />
  </svg>
);

const HalfStar = ({ size = 16, className = "text-yellow-500" }) => {
  // 고유 clipPath ID (React 18 이상)
  const id = React.useId ? React.useId() : `half-${Math.random().toString(36).slice(2)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        {/* 왼쪽 절반만 채움 */}
        <clipPath id={id}>
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
      </defs>
      {/* 바닥: 빈 별 */}
      <path d={STAR_PATH} fill="currentColor" className="text-gray-300" />
      {/* 위: 노란색 절반 채움 */}
      <g clipPath={`url(#${id})`}>
        <path d={STAR_PATH} fill="currentColor" />
      </g>
    </svg>
  );
};

/** ⭐ 5개 별 렌더링 */
const renderStars = (rawRating) => {
  if (rawRating === undefined || rawRating === null || isNaN(rawRating)) {
    return null;
  }
  const rating = Math.round(parseFloat(rawRating) * 2) / 2; // 0.5 단위 반올림
  const full = Math.floor(rating);
  const hasHalf = rating % 1 === 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  const items = [];
  for (let i = 0; i < full; i++) items.push(<FullStar key={`f-${i}`} />);
  if (hasHalf) items.push(<HalfStar key="h" />);
  for (let i = 0; i < empty; i++) items.push(<EmptyStar key={`e-${i}`} />);

  return <div className="flex gap-0.5">{items}</div>;
};

export default function SearchListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(""); // 로딩 단계 표시
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [crawlId, setCrawlId] = useState(null);
  const [crawlStatus, setCrawlStatus] = useState(null);
  const [manualCrawling, setManualCrawling] = useState(false); // 수동 크롤링 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 (10개씩)
  const [hasMorePages, setHasMorePages] = useState(true); // 더 많은 페이지가 있는지
  const [inputValue, setInputValue] = useState(query); // 입력 필드 로컬 상태
  const pollingRef = useRef(null);

  // 가격 포맷팅
  const formatPrice = (priceString) => {
    if (!priceString && priceString !== 0) return null;
    const numericPrice =
      typeof priceString === "string"
        ? parseFloat(priceString.replace(/[^0-9.]/g, ""))
        : parseFloat(priceString);
    if (isNaN(numericPrice)) return null;
    return new Intl.NumberFormat("ko-KR").format(numericPrice) + "원";
  };

  // 할인율 계산
  const calculateDiscountRate = (originalPrice, finalPrice) => {
    if (!originalPrice || !finalPrice) return null;
    const original =
      typeof originalPrice === "string"
        ? parseFloat(originalPrice.replace(/[^0-9.]/g, ""))
        : parseFloat(originalPrice);
    const final =
      typeof finalPrice === "string"
        ? parseFloat(finalPrice.replace(/[^0-9.]/g, ""))
        : parseFloat(finalPrice);
    if (isNaN(original) || isNaN(final) || original <= final) return null;
    return Math.round(((original - final) / original) * 100);
  };

  // 디버깅용 API 테스트
  const testApiConnection = async () => {
    try {
      const apiBaseUrl = window.__RUNTIME_CONFIG__?.API_BASE_URL || "/api";
      const testUrl = `${apiBaseUrl}/products?q=테스트&max_links=1`;
      const response = await fetch(testUrl);
      const text = await response.text();
      if (response.ok) {
        try {
          JSON.parse(text);
          alert("✅ API 연결 성공!");
        } catch {
          alert(`❌ 성공했지만 JSON 아님: ${text.slice(0, 120)}...`);
        }
      } else {
        alert(`❌ API 실패: ${response.status} ${response.statusText}\n${text.slice(0, 120)}...`);
      }
    } catch (e) {
      alert(`❌ 테스트 중 에러: ${e.message}`);
    }
  };

  // 검색 실행 (POST → 필요 시 폴백 GET)
  const handleSearch = React.useCallback(async () => {
    if (!query || !query.trim()) return;

    setLoading(true);
    setError(null);
    setProducts([]);
    setCurrentPage(1);
    setHasMorePages(true);

    try {
      // 1) POST로 비동기 크롤링 시작
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const crawlResponse = await fetch(`/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: query, max_links: 10 }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (crawlResponse.ok) {
        const crawlData = await crawlResponse.json();
        if (crawlData.success) {
          if (crawlData.status === "completed" && crawlData.products && crawlData.products.length > 0) {
            setProducts(crawlData.products);
            setLoading(false);
            return;
          } else if (crawlData.jobId && crawlData.status !== "completed") {
            setCrawlId(crawlData.jobId);
            pollJobStatus(crawlData.jobId);
            return;
          }
        }
      }

      // 2) 실패/대기 시 GET 폴백
      console.log(`📡 GET 폴백으로 캐시된 데이터 조회 중: "${query}"`);
      const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`📊 GET API 응답 구조:`, data);
        
        // 다양한 응답 구조 처리
        let productList = null;
        if (data.products && Array.isArray(data.products)) {
          productList = data.products;
        } else if (data.data && Array.isArray(data.data)) {
          productList = data.data;
        } else if (Array.isArray(data)) {
          productList = data;
        }
        
        if (productList && productList.length > 0) {
          console.log(`✅ 캐시된 데이터 ${productList.length}개 상품 발견`);
          setProducts(productList);
        } else {
          console.log(`⚠️ 캐시된 데이터 없음 또는 빈 배열`);
          setError("검색 결과가 없습니다.");
        }
      } else {
        console.error(`❌ GET API 실패: ${res.status} ${res.statusText}`);
        setError("상품을 불러올 수 없습니다.");
      }
    } catch (error) {
      setError("검색 중 오류가 발생했습니다.");
    }

    setLoading(false);
  }, [query]);

  // 작업 상태 폴링
  const pollJobStatus = React.useCallback(
    async (jobId) => {
      let attempts = 0;
      const maxAttempts = 60;

      const poll = async () => {
        try {
          const res = await fetch(`/api/products/status/${jobId}`);
          if (res.ok) {
            const statusData = await res.json();

            if (statusData.status === "completed") {
              if (statusData.products && statusData.products.length > 0) {
                setProducts(statusData.products);
              } else {
                console.log(`📡 폴링 완료 후 GET으로 캐시된 데이터 조회: "${query}"`);
                const getRes = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
                if (getRes.ok) {
                  const getData = await getRes.json();
                  console.log(`📊 폴링 후 GET API 응답:`, getData);
                  
                  // 다양한 응답 구조 처리
                  let productList = null;
                  if (getData.products && Array.isArray(getData.products)) {
                    productList = getData.products;
                  } else if (getData.data && Array.isArray(getData.data)) {
                    productList = getData.data;
                  } else if (Array.isArray(getData)) {
                    productList = getData;
                  }
                  
                  if (productList && productList.length > 0) {
                    console.log(`✅ 폴링 후 캐시된 데이터 ${productList.length}개 상품 발견`);
                    setProducts(productList);
                  } else {
                    console.log(`⚠️ 폴링 후 캐시된 데이터 없음`);
                    setError("검색 결과가 없습니다.");
                  }
                }
              }
              setLoading(false);
              return;
            } else if (statusData.status === "failed") {
              console.log(`📡 폴링 실패 후 GET으로 캐시된 데이터 조회: "${query}"`);
              const getRes = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
              if (getRes.ok) {
                const getData = await getRes.json();
                console.log(`📊 폴링 실패 후 GET API 응답:`, getData);
                
                // 다양한 응답 구조 처리
                let productList = null;
                if (getData.products && Array.isArray(getData.products)) {
                  productList = getData.products;
                } else if (getData.data && Array.isArray(getData.data)) {
                  productList = getData.data;
                } else if (Array.isArray(getData)) {
                  productList = getData;
                }
                
                if (productList && productList.length > 0) {
                  console.log(`✅ 폴링 실패 후 캐시된 데이터 ${productList.length}개 상품 발견`);
                  setProducts(productList);
                } else {
                  console.log(`⚠️ 폴링 실패 후 캐시된 데이터 없음`);
                  setError("검색 결과가 없습니다.");
                }
              } else {
                console.error(`❌ 폴링 실패 후 GET API도 실패: ${getRes.status}`);
                setError("검색 중 오류가 발생했습니다.");
              }
              setLoading(false);
              return;
            }

            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(poll, 3000);
            } else {
              const getRes = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
              if (getRes.ok) {
                const getData = await getRes.json();
                if (getData.products && getData.products.length > 0) setProducts(getData.products);
                else setError("검색 시간이 초과되었습니다.");
              }
              setLoading(false);
            }
          }
        } catch (error) {
          setError("상태 확인 중 오류가 발생했습니다.");
          setLoading(false);
        }
      };

      poll();
    },
    [query]
  );

  // 다음 페이지 수동 크롤링
  const handleManualCrawl = React.useCallback(async () => {
    if (!query || !query.trim() || manualCrawling || !hasMorePages) return;

    const nextPage = currentPage + 1;
    setManualCrawling(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: query,
          page: nextPage,
          per_page: 10,
          force_crawl: true,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.products && data.products.length > 0) {
          const existingProductCodes = new Set(products.map((p) => p.product_code));
          const newProducts = data.products.filter((p) => !existingProductCodes.has(p.product_code));

          if (newProducts.length > 0) {
            setProducts((prev) => [...prev, ...newProducts]);
            setCurrentPage(nextPage);

            if (data.pagination && typeof data.pagination.hasMore === "boolean") {
              setHasMorePages(data.pagination.hasMore);
            } else {
              if (newProducts.length < 10) setHasMorePages(false);
            }

            setTimeout(() => {
              alert(`🎉 페이지 ${nextPage}에서 ${newProducts.length}개의 새로운 상품을 찾았습니다!`);
            }, 100);
          } else {
            setHasMorePages(false);
            alert("😊 이미 모든 가능한 상품을 찾았습니다.");
          }
        } else {
          setHasMorePages(false);
          alert("😔 추가 상품을 찾을 수 없었습니다.");
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      if (error.name === "AbortError") setError("요청 시간이 초과되었습니다.");
      else setError("추가 상품 검색 중 오류가 발생했습니다.");
    } finally {
      setManualCrawling(false);
    }
  }, [query, products, manualCrawling, currentPage, hasMorePages]);

  const handleInputFocus = () => setShowSuggestions(true);
  const handleInputBlur = () => setTimeout(() => setShowSuggestions(false), 150);
  const handleSuggestionClick = (item) => navigate(`/search?query=${encodeURIComponent(item.name)}`);
  
  // 입력 시 URL 변경하지 않음 (엔터키에서만 처리)
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value); // 로컬 상태만 업데이트
    console.log(`⌨️ 입력 변경: "${value}" (URL 변경 안함)`);
  };
  
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && inputValue && inputValue.trim()) {
      const newQuery = inputValue.trim();
      console.log(`🔍 엔터키로 검색 실행: "${newQuery}"`);
      // 엔터키 입력 시에만 URL 변경 및 검색 실행
      navigate(`/search?query=${encodeURIComponent(newQuery)}`, { replace: true });
    }
  };

  // 초기 로드 시 URL query 있으면 자동 검색 (입력 변경이 아닌 실제 URL 변경 시에만)
  useEffect(() => {
    if (!query || !query.trim()) {
      setLoading(false);
      setProducts([]);
      setError(null);
      return;
    }
    console.log(`🔍 SearchListPage URL 변경으로 검색 실행: query="${query}"`);
    setProducts([]);
    setError(null);
    setLoading(true);
    handleSearch();
    return () => {
      if (pollingRef.current) pollingRef.current();
    };
  }, [query]); // handleSearch 의존성 제거하여 불필요한 재실행 방지

  // query 바뀌면 상태 초기화 및 inputValue 동기화
  useEffect(() => {
    setInputValue(query); // URL query와 입력값 동기화
    if (!query || !query.trim()) {
      setProducts([]);
      setError(null);
      setLoading(false);
    }
  }, [query]);

  // 크롤링 상태 확인
  useEffect(() => {
    if (!crawlId) return;

    const checkCrawlStatus = async () => {
      try {
        const res = await fetch(`/api/products/crawl/${crawlId}`);
        const data = await res.json();
        setCrawlStatus(data);

        if (data.status === "processing") {
          setTimeout(checkCrawlStatus, 1000);
        } else if (data.status === "completed") {
          setProducts(data.products);
          setLoading(false);
        } else if (data.status === "failed") {
          setError(data.message);
          setLoading(false);
        }
      } catch (err) {
        setError("크롤링 상태를 확인하는 중 오류가 발생했습니다.");
        setLoading(false);
      }
    };

    checkCrawlStatus();
  }, [crawlId]);

  return (
    <>
      <NavBar title="KOSA" />

      <div className="max-w-2xl mx-auto p-4 bg-gray-100 min-h-screen pt-16 pb-24">
        {/* 디버깅 배지 */}
        <div className="bg-red-500 text-white p-2 text-center mb-4 rounded">
          🔍 SearchListPage 컴포넌트가 렌더링되었습니다 (v2.1)
        </div>

        {/* 검색창 */}
        <div className="flex flex-col items-center w-full max-w-md mx-auto mb-4">
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 w-full mt-2">
            <input
              className="flex-1 outline-none text-black"
              type="text"
              placeholder="Search for a product"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
            />
          </div>

          {showSuggestions && (
            <div className="w-full bg-white rounded-xl shadow mt-2 max-h-64 overflow-auto z-30">
              {RECOMMEND_SUGGESTIONS.map((item) => (
                <button
                  key={item.id}
                  className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-800"
                  onMouseDown={() => handleSuggestionClick(item)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}

          {/* 디버깅 버튼 */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={testApiConnection}
              className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
            >
              🧪 API 테스트
            </button>
            <button
              onClick={() => handleSearch()}
              className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              🔧 수동 검색
            </button>
            <button
              onClick={async () => {
                try {
                  const response = await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ keyword: query || "테스트", max_links: 5 }),
                  });
                  const data = await response.json();
                  if (data.success && data.products && data.products.length > 0) {
                    setProducts(data.products);
                    setLoading(false);
                    alert(`✅ 성공! ${data.products.length}개 상품 표시됨`);
                  } else {
                    alert(`POST 응답 상품 수: ${data.products?.length || 0}`);
                  }
                } catch (err) {
                  alert(`POST 에러: ${err.message}`);
                }
              }}
              className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
            >
              📡 POST 테스트
            </button>
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="mb-2 text-blue-700 font-bold text-lg">검색 결과 (SearchListPage v2.0)</div>

        {loading ? (
          <div className="flex flex-col items-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-lg text-blue-600 font-semibold mb-2">상품을 검색하고 있습니다</div>
            {loadingStep && <div className="text-sm text-gray-600 text-center">{loadingStep}</div>}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-400">검색 결과가 없습니다.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product, index) => {
              const productForHeart = {
                id: product.product_code || `product-${index}`,
                name: product.title || product.product_code || "상품명 없음",
                url: product.url,
                image_url: product.image_url,
                price: product.final_price
                  ? typeof product.final_price === "string"
                    ? parseFloat(product.final_price.replace(/[^0-9.]/g, ""))
                    : parseFloat(product.final_price)
                  : undefined,
                rating: product.review_rating ? parseFloat(product.review_rating) : undefined,
                review_count: product.review_count
                  ? typeof product.review_count === "string"
                    ? parseInt(product.review_count.replace(/[^0-9]/g, ""))
                    : parseInt(product.review_count)
                  : undefined,
              };

              return (
                <div
                  key={product.product_code || index}
                  className="bg-white rounded-lg shadow-md overflow-hidden p-4 relative cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={async () => {
                    const productCode = product.product_code;
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
                        console.log(`✅ Analysis started successfully: ${result.dagRunId}`);
                        
                        // 분석 페이지로 이동하면서 DAG Run 정보 전달
                        navigate(`/analysis/${encodeURIComponent(productCode)}?dagRunId=${result.dagRunId}&dagId=${result.dagId}`);
                      } else {
                        console.error('❌ Analysis request failed:', result.message);
                        alert('분석 요청에 실패했습니다. 다시 시도해주세요.');
                      }
                    } catch (error) {
                      console.error('❌ Error requesting analysis:', error);
                      alert('분석 요청 중 오류가 발생했습니다.');
                    }
                  }}
                >
                  {/* 하트 버튼 */}
                  <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
                    <HeartButton
                      product={productForHeart}
                      size="md"
                      className="bg-white bg-opacity-80 rounded-full p-1 shadow-sm hover:bg-opacity-100"
                    />
                  </div>

                  {/* 상품 이미지 */}
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.title || product.product_code}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                  )}

                  {/* 상품 정보 */}
                  <div>
                    <h3 className="font-semibold text-sm mb-2 pr-8">
                      {product.title || product.product_code || "상품명 없음"}
                    </h3>

                    {/* 가격 정보 */}
                    <div className="mb-2">
                      {product.final_price && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-blue-600 font-bold text-lg">
                            {formatPrice(product.final_price)}
                          </span>
                          {product.origin_price &&
                            product.origin_price !== product.final_price &&
                            (() => {
                              const discountRate = calculateDiscountRate(
                                product.origin_price,
                                product.final_price
                              );
                              return discountRate ? (
                                <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                  {discountRate}% 할인
                                </span>
                              ) : null;
                            })()}
                        </div>
                      )}

                      {product.origin_price && product.origin_price !== product.final_price && (
                        <p className="text-gray-500 line-through text-sm">
                          {formatPrice(product.origin_price)}
                        </p>
                      )}
                    </div>

                    {/* ⭐ 별점 (아이콘 5개) */}
                    {product.review_rating && (
                      <div className="flex items-center mb-2">
                        {renderStars(product.review_rating)}
                        {product.review_count && (
                          <span className="ml-2 text-sm text-gray-500">
                            ({product.review_count}개 리뷰)
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-3">
                      {product.url && (
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 text-xs hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          쿠팡에서 상품 보기 →
                        </a>
                      )}

                      <div className="text-xs text-gray-500">카드 클릭으로 분석하기</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 더 많은 상품 찾기 버튼 */}
        {!loading && products.length > 0 && hasMorePages && (
          <div className="mt-8 text-center">
            <div className="bg-white rounded-lg shadow-md p-6 mx-4">
              <p className="text-gray-600 mb-4">
                더 많은 상품을 보고 싶으신가요?
                <span className="text-sm text-blue-600 block mt-1">
                  현재 {products.length}개 상품 (페이지 {currentPage})
                </span>
              </p>
              <button
                onClick={handleManualCrawl}
                disabled={manualCrawling}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  manualCrawling
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg"
                }`}
              >
                {manualCrawling ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    페이지 {currentPage + 1} 검색 중...
                  </div>
                ) : (
                  `페이지 ${currentPage + 1} 더 보기`
                )}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                다음 페이지에서 최대 10개의 추가 상품을 검색합니다
              </p>
            </div>
          </div>
        )}

        {/* 모든 페이지 완료 */}
        {!loading && products.length > 0 && !hasMorePages && (
          <div className="mt-8 text-center">
            <div className="bg-gray-50 rounded-lg p-6 mx-4">
              <p className="text-gray-600">
                🎉 총 {products.length}개의 상품을 모두 찾았습니다!
                <span className="text-sm text-gray-500 block mt-1">
                  (페이지 {currentPage}까지 검색 완료)
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      <BottomBar />
    </>
  );
}
