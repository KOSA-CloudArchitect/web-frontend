import { useState, useEffect } from "react";   
import {
  Search,
  Menu,
  User,
  Share,
  MessageCircle,
  BookOpen,
  Camera,
  Package,  
  Monitor,
  Shirt,
  UtensilsCrossed,
  Home,
  Heart,
  Baby,
  Gamepad2,
  Car,
  Gift,
  ShoppingCart,
  Apple,
  PawPrint,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import React from "react";
import CategoryMenu from "./CategoryMenu";
import { motion } from "framer-motion";
import CategoryList from "./CategoryList";
import SubcategoryList from "./SubcategoryList";

// 카테고리 아이콘 클릭/탭 효과를 180ms 동안 유지하는 컴포넌트
function CategoryItem({ icon, label, onClick }) {
  const [active, setActive] = useState(false);
  const handleTap = () => {
    setActive(true);
    setTimeout(() => setActive(false), 180);
    if (onClick) onClick();
  };
  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      animate={active ? { scale: 0.95, boxShadow: '0 0 0 4px #bfdbfe' } : { scale: 1, boxShadow: 'none' }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onTap={handleTap}
      onClick={handleTap}
      className="flex flex-col items-center bg-white rounded-xl shadow p-2 cursor-pointer transition"
    >
      {icon}
      <span className="text-xs mt-1 font-semibold text-gray-700">{label}</span>
    </motion.div>
  );
}

export default function MainPage() {
  const [search, setSearch] = useState("");
  const [categoryPage, setCategoryPage] = useState(0);
  const [showAuthPopover, setShowAuthPopover] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();
  const [showDrawer, setShowDrawer] = useState(false);
  // 자동완성/추천/최근 검색 상태
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recentSearches")) || [];
    } catch {
      return [];
    }
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productUrl, setProductUrl] = useState("");
  const [urlAnalyzing, setUrlAnalyzing] = useState(false);

  // 추천 상품/키워드 예시 (실제 데이터 연동 시 확장)
  const allSuggestions = [
    { id: 1, name: "MacBook Air", keyword: "macbook air" },
    // ...추가 가능
  ];

  // 입력값에 따라 추천 목록 필터링
  const suggestions = search
    ? allSuggestions.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.keyword.includes(search.toLowerCase())).slice(0, 5)
    : [];

  // 최근 검색어 추가 함수
  const addRecentSearch = (keyword) => {
    if (!user) return;
    let updated = [keyword, ...recentSearches.filter(k => k !== keyword)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // 추천/최근 목록 클릭 시 이동
  const handleSuggestionClick = (item) => {
    addRecentSearch(item.name || item);
    setSearch("");
    setShowSuggestions(false);
    navigate("/result/1"); // 실제라면 id 등으로 동적 이동
  };

  // 검색창 포커스/입력 시 추천/최근 목록 노출
  const handleInputFocus = () => setShowSuggestions(true);
  const handleInputBlur = () => setTimeout(() => setShowSuggestions(false), 150); // blur 시 잠깐 딜레이

  // 드래그(스와이프) 지원
  let dragStartX = null;
  function handleDragStart(e) {
    dragStartX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
  }
  function handleDragEnd(e) {
    if (dragStartX === null) return;
    const endX = e.type === "touchend" ? e.changedTouches[0].clientX : e.clientX;
    const diff = endX - dragStartX;
    if (diff > 50 && categoryPage > 0) setCategoryPage(categoryPage - 1);
    if (diff < -50 && categoryPage < totalPages - 1) setCategoryPage(categoryPage + 1);
    dragStartX = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    setShowAuthPopover(false);
    setUser(null);
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  // 로그인/회원가입 후 user 상태 갱신을 위해 window 이벤트 리스너 추가
  // (다른 탭에서 로그인/로그아웃 시 동기화)
  useEffect(() => {
    const syncUser = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user")));
      } catch {
        setUser(null);
      }
    };
    syncUser(); // 마운트 시 한 번 실행
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://kosa-backend-315281980252.asia-northeast3.run.app/api/categories");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Ensure data is an array before setting it
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data && data.rows) {
          // Handle case where data is in { rows: [...] } format
          setCategories(data.rows);
        } else {
          // If data is not in expected format, log it for debugging
          console.error('Unexpected API response format:', data);
          setError('카테고리 데이터 형식이 올바르지 않습니다.');
        }
      } catch (err) {
        console.error('카테고리 불러오기 실패:', err);
        setError(`카테고리 불러오기 실패: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 메인 카테고리만 추출 (with null/undefined check)
  const mainCategories = Array.isArray(categories) 
    ? categories.filter(cat => cat && (cat.parent_id === null || cat.depth === 0))
    : [];

  // 서브카테고리 추출 함수
  function getSubcategories(parentId) {
    return categories.filter(cat => cat.parent_id === parentId);
  }

  // 카테고리 페이지네이션 계산 (카테고리 개수에 따라 자동)
  const pageSize = 8;
  const totalPages = Math.ceil(mainCategories.length / pageSize);
  const pagedCategories = Array.from({ length: totalPages }, (_, i) =>
    mainCategories.slice(i * pageSize, (i + 1) * pageSize)
  );

  function renderCategoryStep() {
    if (loading) return <div className="p-8 text-center text-gray-400">카테고리 불러오는 중...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    // 2단계: 하위 카테고리 선택
    if (selectedCategory) {
      const subcategories = getSubcategories(selectedCategory.id);
      return (
        <SubcategoryList
          category={selectedCategory}
          subcategories={subcategories}
          onBack={() => setSelectedCategory(null)}
        />
      );
    }
    // 1단계: 메인 카테고리만 보여주기
    return (
      <CategoryList
        categories={pagedCategories[categoryPage]}
        onSelect={cat => setSelectedCategory(cat)}
        variant="grid"
      />
    );
  }

  // 검색 실행
  const handleSearch = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await fetch('https://kosa-backend-315281980252.asia-northeast3.run.app/api/products/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: query })
      });
      navigate(`/search?query=${encodeURIComponent(query)}`);
    } catch (err) {
      setError('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // URL 분석 실행
  const handleUrlAnalysis = async (url) => {
    if (!url.trim()) return;
    
    // 쿠팡 URL 유효성 검사
    if (!url.includes('coupang.com')) {
      setError('쿠팡 상품 URL을 입력해주세요.');
      return;
    }

    setUrlAnalyzing(true);
    setError(null);
    
    try {
      // 임시 productId 생성 (실제로는 백엔드에서 처리)
      const productId = Date.now().toString();
      navigate(`/analysis-result/${productId}?url=${encodeURIComponent(url)}`);
    } catch (err) {
      setError('URL 분석 중 오류가 발생했습니다.');
    } finally {
      setUrlAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow">
        <Menu size={28} className="cursor-pointer text-blue-600" onClick={() => setShowDrawer(true)} />
        <span className="text-xl font-bold text-blue-600">KOSA</span>
        <div className="relative">
          <User
            size={28}
            className="cursor-pointer text-blue-600"
            onClick={() => setShowAuthPopover((v) => !v)}
          />
          {showAuthPopover && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded shadow p-4 z-20">
              {user ? (
                <>
                  <div className="mb-2 text-gray-800 font-semibold">{user.userId}님</div>
                  <button
                    className="w-full text-left py-1 px-2 hover:bg-gray-100 rounded"
                    onClick={() => { setShowAuthPopover(false); navigate('/mypage'); }}
                  >
                    마이페이지
                  </button>
                  <button
                    className="w-full text-left py-1 px-2 hover:bg-gray-100 rounded"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="w-full text-left py-1 px-2 hover:bg-gray-100 rounded"
                    onClick={() => { setShowAuthPopover(false); navigate('/login'); }}
                  >
                    로그인
                  </button>
                  <button
                    className="w-full text-left py-1 px-2 hover:bg-gray-100 rounded"
                    onClick={() => { setShowAuthPopover(false); navigate('/signup'); }}
                  >
                    회원가입
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 사이드 드로어 카테고리 메뉴 */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowDrawer(false)}>
          <div
            className="absolute left-0 w-72 bg-white shadow-xl p-0 rounded-r-2xl"
            style={{ top: '0px', height: 'calc(100vh - 64px)', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* 드래그바(상단 막대) */}
            <div className="flex justify-center items-center pt-2 pb-1" style={{ left: '50%', transform: 'translateX(-50%)' }}>
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>
            <div className="relative h-full overflow-y-scroll custom-scrollbar">
              <CategoryMenu />
            </div>
          </div>
        </div>
      )}

      {/* Search Section + 자동완성/추천/최근 목록 + 카테고리 flex-col로 묶기 */}
      <div className="bg-zinc-900 text-white text-center py-10 px-4">
        <div className="flex flex-col items-center justify-center mb-4">
          <Users size={64} className="text-blue-400 mb-2 drop-shadow-lg" />
        </div>
        <motion.h1
          className="text-3xl md:text-4xl font-extrabold mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1 }}
        >
          리뷰 속 진짜 <br></br>고객의 목소리를 발견하세요
        </motion.h1>

        <div className="flex flex-col items-center w-full max-w-md mx-auto">
          <div className="mt-6 flex items-center gap-2 bg-white rounded-full px-4 py-2 w-full">
            <Menu size={20} className="text-gray-500" />
            <input
              className="flex-1 outline-none text-black"
              type="text"
              placeholder="Search for a product"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={e => { if (e.key === 'Enter' && search.trim()) { handleSearch(search); } }}
            />
            <Search 
              size={20} 
              className="text-gray-500 cursor-pointer" 
              onClick={() => handleSearch(search)}
            />
          </div>
          {/* 추천/최근 목록 */}
          {showSuggestions && (
            <div className="w-full bg-white rounded-xl shadow mt-2 max-h-64 overflow-auto z-30">
              {search && suggestions.length > 0 ? (
                suggestions.map(item => (
                  <button
                    key={item.id}
                    className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-800"
                    onMouseDown={() => handleSuggestionClick(item)}
                  >
                    {item.name}
                  </button>
                ))
              ) : (!search && user && recentSearches.length > 0) ? (
                <>
                  <div className="px-4 py-2 text-xs text-gray-400">최근 검색어</div>
                  {recentSearches.map((item, i) => (
                    <button
                      key={i}
                      className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-800"
                      onMouseDown={() => handleSuggestionClick({ name: item })}
                    >
                      {item}
                    </button>
                  ))}
                </>
              ) : null}
            </div>
          )}

          {/* URL 분석 섹션 */}
          <div className="mt-8 w-full">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                상품 URL로 바로 분석하기
              </h3>
              <p className="text-sm text-gray-600">
                쿠팡 상품 URL을 입력하면 리뷰를 분석해드립니다
              </p>
            </div>
            
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 w-full">
              <Package size={20} className="text-gray-500" />
              <input
                className="flex-1 outline-none text-black"
                type="text"
                placeholder="쿠팡 상품 URL을 입력하세요"
                value={productUrl}
                onChange={e => setProductUrl(e.target.value)}
                onKeyDown={e => { 
                  if (e.key === 'Enter' && productUrl.trim()) { 
                    handleUrlAnalysis(productUrl); 
                  } 
                }}
              />
              <button
                onClick={() => handleUrlAnalysis(productUrl)}
                disabled={urlAnalyzing || !productUrl.trim()}
                className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {urlAnalyzing ? '분석중...' : '분석하기'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 카테고리 슬라이더/드래그바 복구 */}
      <div
        style={{ width: '100%' }}
        onClick={() => selectedCategory && setSelectedCategory(null)}
      >
        <div
          className="px-4 py-6"
          onClick={e => e.stopPropagation()}
        >
          <div className="mb-2 text-blue-700 font-bold text-lg">CATEGORIES</div>
          <div style={{ width: '100%' }} className="max-h-[320px] overflow-y-auto custom-scrollbar">
            {renderCategoryStep()}
          </div>
          <div className="flex items-center gap-2 mt-2 w-full justify-center">
            <button
              className="p-1 rounded-full bg-blue-100 text-blue-600 disabled:opacity-30"
              onClick={() => setCategoryPage((p) => Math.max(0, p - 1))}
              disabled={categoryPage === 0}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === categoryPage ? 'bg-blue-600' : 'bg-blue-200'}`}
                />
              ))}
            </div>
            <button
              className="p-1 rounded-full bg-blue-100 text-blue-600 disabled:opacity-30"
              onClick={() => setCategoryPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={categoryPage === totalPages - 1}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      

      {/* Spacer */}
      <div className="flex-1" />

      {/* 하단 네비게이션 바 - 동그라미 버튼 */}
      <div className="fixed bottom-0 left-0 w-full flex justify-center items-center gap-8 bg-gray-100 py-3 shadow z-40">
        <button className="p-4 rounded-full shadow-lg bg-white flex items-center justify-center">
          <Share size={24} className="text-blue-600" />
        </button>
        <button className="p-4 rounded-full shadow-lg bg-white flex items-center justify-center" onClick={() => navigate('/') }>
          <Home size={28} className="text-blue-600" />
        </button>
        <button className="p-4 rounded-full shadow-lg bg-white flex items-center justify-center">
          <MessageCircle size={24} className="text-blue-600" />
        </button>
      </div>
    </div>
  );
}
