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

// API 에러 인터페이스 (서버 응답용)
export interface ApiErrorResponse {
  message: string;
  code?: string;
  status?: number;
}

// WebSocket 분석 데이터 타입 (별칭)
export type SocketAnalysisData = WebSocketAnalysisEvent;