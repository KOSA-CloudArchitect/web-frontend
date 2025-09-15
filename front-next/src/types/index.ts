// 공통 타입 정의

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'suggestion';
}

export interface TrendingKeyword {
  rank: number;
  keyword: string;
  trend: 'up' | 'down';
  change: number;
  score?: number;
}

export interface Product {
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
  price?: number; // 호환성을 위해 추가
  rating?: number; // 호환성을 위해 추가
}

// WatchList 기반 관심상품 타입
export interface WatchListItem {
  id: string;
  userId: string;
  productId: string;
  priceAlert: boolean;
  targetPrice: number | null;
  analysisFrequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastNotifiedAt?: string;
  product?: {
    productKey: string;
    title: string;
    url: string;
    imageUrl?: string;
    currentPrice?: number;
    originalPrice?: number;
    rating?: number;
    reviewCount?: number;
    source?: string;
    crawledAt: string;
  } | null;
}

// 관심상품 등록 요청 타입
export interface InterestProductRequest {
  productUrl: string;
  productName?: string;
  priceAlert?: boolean;
  targetPrice?: number;
  analysisFrequency?: 'daily' | 'weekly' | 'monthly';
}

// 관심상품 응답 타입
export interface InterestProductResponse {
  success: boolean;
  message: string;
  data?: WatchListItem;
  error?: any;
}

// 기존 InterestProduct 타입 (호환성을 위해 유지)
export interface InterestProduct {
  id: string;
  productId: string;
  productName: string;
  productUrl: string;
  imageUrl?: string;
  currentPrice?: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  isActive: boolean;
  lastAnalyzedAt?: string;
  createdAt: string;
  updatedAt: string;
}
