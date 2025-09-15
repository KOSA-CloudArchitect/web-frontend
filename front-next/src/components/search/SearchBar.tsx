import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { LoadingSpinner } from '../LoadingSpinner';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'suggestion';
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  isLoading?: boolean;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onSuggestionSelect,
  placeholder = '상품명을 검색하세요 (예: 아이폰 15)',
  isLoading = false,
  suggestions = [],
  recentSearches = [],
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isComposing, setIsComposing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 최근 검색어와 제안을 합친 목록 (중복 제거 간단 처리)
  const recentItems: SearchSuggestion[] = recentSearches.slice(0, 5).map((text) => ({
    id: `recent-${text}`,
    text,
    type: 'recent' as const,
  }));

  const combined = [...recentItems, ...suggestions.slice(0, 5)];
  const dedupMap = new Map<string, SearchSuggestion>();
  combined.forEach((s) => { if (!dedupMap.has(s.text)) dedupMap.set(s.text, s); });
  const allSuggestions = Array.from(dedupMap.values());

  const openDropdown = () => {
    setShowSuggestions((query.length > 0) || recentSearches.length > 0);
  };

  const closeDropdown = () => {
    setShowSuggestions(false);
    setFocusedIndex(-1);
  };

  const handleSubmit = (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.();
    const q = query.trim();
    if (!q) return;
    onSearch(q); // ✅ 엔터/제출에서만 검색 실행
    closeDropdown();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // ⛔ 한글/일본어 조합 중에는 드롭다운 토글도 하지 않음
    if (isComposing) return;

    setFocusedIndex(-1);
    openDropdown();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    onSuggestionSelect?.(suggestion);
    // ❌ 즉시 onSearch 호출 금지 (엔터/제출에서만 실행)
    closeDropdown();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // ✅ IME 조합 중엔 모든 키 처리 무시
    // @ts-ignore cross-browser
    if (e.isComposing || (e.nativeEvent && (e.nativeEvent as any).isComposing)) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (showSuggestions && focusedIndex >= 0 && focusedIndex < allSuggestions.length) {
        const s = allSuggestions[focusedIndex];
        setQuery(s.text); // 선택만
        closeDropdown();
      } else {
        handleSubmit(); // 제출만 검색
      }
      return;
    }

    if (!showSuggestions || allSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev < allSuggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : allSuggestions.length - 1));
        break;
      case 'Escape':
        closeDropdown();
        inputRef.current?.blur();
        break;
    }
  };

  // ✅ 조합 핸들러: 조합 시작~끝 사이에는 아무 액션 금지
  const handleCompositionStart = () => setIsComposing(true);
  const handleCompositionEnd = () => {
    setIsComposing(false);
    openDropdown();
  };

  // ✅ 바깥 클릭 감지(클릭-블러 레이스 방지)
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!inputRef.current || !suggestionsRef.current) return;
      const insideInput = inputRef.current.contains(t);
      const insideSuggs = suggestionsRef.current.contains(t);
      if (!insideInput && !insideSuggs) closeDropdown();
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  const clearQuery = () => {
    setQuery('');
    closeDropdown();
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'popular':
        return <TrendingUp className="w-4 h-4 text-orange-400" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Search className="h-5 w-5 text-gray-400" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={openDropdown}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="w-full pl-10 pr-12 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
            placeholder={placeholder}
          />

          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </form>

      {/* 검색 제안 드롭다운 */}
      {showSuggestions && allSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          id="search-suggestions"
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {allSuggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              id={`sugg-${suggestion.id}`}
              role="option"
              aria-selected={index === focusedIndex}
              type="button"
              onMouseDown={(e) => e.preventDefault()} // blur 전에 클릭 처리
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors ${
                index === focusedIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              {getSuggestionIcon(suggestion.type)}
              <span className="flex-1 text-gray-900">{suggestion.text}</span>
              {suggestion.type === 'recent' && (
                <span className="text-xs text-gray-500">최근 검색</span>
              )}
              {suggestion.type === 'popular' && (
                <span className="text-xs text-orange-500">인기 검색</span>
              )}
            </button>
          ))}

          {query && (
            <div className="border-t border-gray-100 p-2">
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="w-full px-2 py-2 text-left text-blue-600 hover:bg-blue-50 rounded flex items-center space-x-2 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>"{query}" 검색</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
