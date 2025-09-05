// API 관련 타입 정의
export interface AnalysisRequest {
  productId: string;
  url?: string;
  keywords?: string[];
}

export interface AnalysisResponse {
  success: boolean;
  message: string;
  taskId: string;
  estimatedTime?: number;
}

export interface AnalysisStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedTime?: number;
  error?: string;
  fromCache?: boolean;
}

export interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
}

export interface AnalysisResult {
  productId: string;
  sentiment: SentimentData;
  summary: string;
  keywords: string[];
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisResultResponse {
  success: boolean;
  status: string;
  result?: AnalysisResult;
  message?: string;
  error?: string;
  fromCache?: boolean;
}

// 상품 관련 타입 정의
export interface Product {
  id: string;
  name: string;
  brand?: string;
  price?: number;
  rating?: number;
  review_count?: number;
  image_url?: string;
  url?: string;
}

// WebSocket 이벤트 타입 정의
export interface WebSocketAnalysisEvent {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: AnalysisResult;
  error?: string;
  timestamp: string;
}

// 컴포넌트 Props 타입 정의
export interface ProductInfoProps {
  product: Product | null;
}

export interface SentimentPieChartProps {
  positive?: number;
  neutral?: number;
  negative?: number;
}

// 인증 관련 타입
export interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    tokenType: string;
    expiresIn: number;
  };
  message: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    tokenType: string;
    expiresIn: number;
  };
  message: string;
}

// API 에러 인터페이스 (서버 응답용)
export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
    value: any;
  }>;
}

// WebSocket 분석 데이터 타입 (별칭)
export type SocketAnalysisData = WebSocketAnalysisEvent;

// 실시간 분석 관련 타입
export interface RealtimeAnalysisEvent {
  type: 'status' | 'emotion' | 'chart' | 'complete' | 'error';
  productId: string;
  data: any;
  timestamp: string;
}

export interface EmotionCardData {
  id: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  content: string;
  keywords: string[];
  confidence: number;
  timestamp: string;
}

export interface AnalysisChartData {
  positive: number;
  negative: number;
  neutral: number;
  totalProcessed: number;
}

// 관심 상품 관련 타입
export interface InterestProduct {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productUrl: string;
  imageUrl?: string;
  currentPrice?: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastAnalyzedAt?: string;
}

export interface InterestProductRequest {
  productUrl: string;
  productName?: string;
}

export interface InterestProductResponse {
  success: boolean;
  data?: InterestProduct;
  message: string;
  error?: string;
}

// 관심 상품 분석 관련 타입
export interface InterestAnalysisData {
  id: string;
  interestId: string;
  productId: string;
  sentiment: SentimentData;
  summary: string;
  keywords: string[];
  totalReviews: number;
  ratingDistribution: {
    [key: string]: number; // "1": 10, "2": 20, etc.
  };
  sentimentTrend: {
    date: string;
    positive: number;
    negative: number;
    neutral: number;
  }[];
  priceHistory: {
    date: string;
    price: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface InterestAnalysisRequest {
  interestId: string;
}

export interface InterestAnalysisResponse {
  success: boolean;
  data?: InterestAnalysisData;
  message: string;
  error?: string;
}

export interface InterestAnalysisStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  estimatedTime?: number;
  error?: string;
}

// 검색 관련 타입
export interface SearchStatus {
  status: 'started' | 'completed' | 'error';
  message: string;
  jobId: string;
  keyword: string;
  products?: any[];
  productCount?: number;
  error?: string;
}

// 글로벌 Window 타입 확장
declare global {
  interface Window {
    searchStatusCallback?: (status: SearchStatus) => void;
  }
}