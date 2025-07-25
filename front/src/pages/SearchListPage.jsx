import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import BottomBar from "../components/BottomBar";
import ProductList from "../components/ProductList";
import { Star } from "lucide-react";

// 추천 검색어 예시 (고정)
const RECOMMEND_SUGGESTIONS = [
  { id: 1, name: "청소기" },
  { id: 2, name: "노트북" },
  { id: 3, name: "에어컨" },
  { id: 4, name: "냉장고" },
  { id: 5, name: "선풍기" },
];

export default function SearchListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [crawlId, setCrawlId] = useState(null);
  const [crawlStatus, setCrawlStatus] = useState(null);
  const pollingRef = useRef(null);

  // 검색 실행 시 polling 시작
  const handleSearch = React.useCallback(() => {
    if (!query || !query.trim()) return;
    setLoading(true);
    setError(null);
    setProducts([]);
    let polling = true;
    let elapsed = 0;
    let afterFoundElapsed = 0;
    let found = false;

    const poll = async () => {
      let lastProducts = [];
      while (polling && elapsed < 30000) { // 최대 30초
        try {
          // q 파라미터로 검색어 전송
          const res = await fetch(`https://kosa-backend-315281980252.asia-northeast3.run.app/api/products?q=${encodeURIComponent(query)}`);
          const data = await res.json();
      
          if (data.products && data.products.length > 0) {
            if (!found) {
              setProducts(data.products);
              lastProducts = data.products;
              setLoading(false);
              found = true;
            } else {
              // 상품이 이미 있고, 새로 받아온 products와 기존 products가 다를 때만 setProducts 호출
              if (JSON.stringify(lastProducts) !== JSON.stringify(data.products)) {
                setProducts(data.products);
                lastProducts = data.products;
              }
            }
            // 상품이 보인 후 최소 10초 동안 3초 간격 polling 유지
            if (afterFoundElapsed < 10000) {
              await new Promise(r => setTimeout(r, 3000));
              afterFoundElapsed += 3000;
              elapsed += 3000;
              continue;
            } else {
              break;
            }
          }
        } catch (err) {
          setError("상품을 불러오는 중 오류가 발생했습니다.");
          setLoading(false);
          return;
        }
        await new Promise(r => setTimeout(r, 3000));
        elapsed += 3000;
      }
      if (!found) {
        setLoading(false);
        setError("상품이 없습니다.");
      }
      pollingRef.current = null;
    };
    poll();
    pollingRef.current = () => { polling = false; };
  }, [query]);

  const handleInputFocus = () => setShowSuggestions(true);
  const handleInputBlur = () => setTimeout(() => setShowSuggestions(false), 150);

  const handleSuggestionClick = (item) => {
    navigate(`/search?query=${encodeURIComponent(item.name)}`);
  };

  const handleInputChange = (e) => {
    navigate(`/search?query=${encodeURIComponent(e.target.value)}`);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && query && query.trim()) {
      handleSearch();
    }
  };

  // query가 바뀔 때마다 products 초기화 및 검색 실행
  useEffect(() => {
    setProducts([]);
    setError(null);
    setLoading(true);
    handleSearch();
    return () => {
      if (pollingRef.current) pollingRef.current();
    };
  }, [query, handleSearch]);

  // 크롤링 상태 확인
  useEffect(() => {
    if (!crawlId) return;

    const checkCrawlStatus = async () => {
      try {
        const res = await fetch(`https://kosa-backend-315281980252.asia-northeast3.run.app/api/products/crawl/${crawlId}`);
        const data = await res.json();
        setCrawlStatus(data);

        if (data.status === "processing") {
          // 아직 진행 중이면 1초 후 다시 확인
          setTimeout(checkCrawlStatus, 1000);
        } else if (data.status === "completed") {
          setProducts(data.products);
          setLoading(false);
        } else if (data.status === "failed") {
          setError(data.message);
          setLoading(false);
        }
      } catch (err) {
        console.error("크롤링 상태 확인 에러:", err);
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
        {/* 검색창+추천 검색어 */}
        <div className="flex flex-col items-center w-full max-w-md mx-auto mb-4">
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 w-full mt-2">
            <input
              className="flex-1 outline-none text-black"
              type="text"
              placeholder="Search for a product"
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
            />
          </div>
          {showSuggestions && (
            <div className="w-full bg-white rounded-xl shadow mt-2 max-h-64 overflow-auto z-30">
              {RECOMMEND_SUGGESTIONS.map(item => (
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
        </div>
        {/* 검색 결과 */}
        <div className="mb-2 text-blue-700 font-bold text-lg">검색 결과</div>
        {loading ? (
          <div className="flex flex-col items-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-lg text-blue-600 font-semibold">상품을 검색하고 있습니다</div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-400">검색 결과가 없습니다.</div>
        ) : (
          <ProductList products={products} />
        )}
      </div>
      <BottomBar />
    </>
  );
} 