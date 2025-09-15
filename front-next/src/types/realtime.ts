// WebSocket inbound messages
export type WSMessage =
  | { type: 'analysis_started'; productId: string }
  | { type: 'emotion_card'; card: RawEmotionCard }
  | { type: 'progress'; value: number } // 0~100
  | { type: 'final_summary'; payload: FinalSummary }
  | { type: 'error'; message: string };

// WebSocket에서 받는 원본 감정 카드
export type RawEmotionCard = {
  id: string;
  timestamp: string;        // ISO
  sentiment: 'pos' | 'neg' | 'neu';
  score: number;            // 0~1
  summary: string;          // 한 줄 요약
  refs?: { reviewId?: string; index?: number };
  keywords?: Array<{ key: string; count: number }>;
};

// UI에서 사용하는 변환된 감정 카드
export type EmotionCard = {
  id: string;
  sentiment: string;        // 'positive' | 'negative' | 'neutral'
  content: string;
  keywords: string[];
  confidence: number;
  timestamp: string;
  color: string;
};

export type FinalSummary = {
  productId: string;
  overall: { pos: number; neg: number; neu: number }; // %
  topKeywords: Array<{ key: string; count: number }>;
  highlights: string[];  // 핵심 요약 bullet
  insights?: string;     // 자유 텍스트
  charts?: {
    timeline?: Array<{ t: string; pos: number; neg: number; neu: number }>;
  };
  rawCount?: number;
  generatedAt: string;
};

export type ConnectionStatus = 'connecting' | 'open' | 'closed' | 'error';

export type ChartPoint = {
  timestamp: string;
  positive: number;
  negative: number;
  neutral: number;
};

export type RealtimeAnalysisState = {
  connection: ConnectionStatus;
  progress: number; // 0~100
  emotionCards: EmotionCard[]; // 실시간 누적
  chartData: ChartPoint[];     // 선택 (있으면 업데이트)
  finalSummary?: FinalSummary;  // 도착 시 세트
  error?: string;
};