import { create } from 'zustand';

export interface EmotionCard {
  id: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  content: string;
  keywords: string[];
  confidence: number;
  timestamp: string;
  color: string;
}

export interface AnalysisChart {
  positive: number;
  negative: number;
  neutral: number;
  totalProcessed: number;
}

export interface AnalysisSummary {
  totalReviews: number;
  averageRating: number;
  topKeywords: Array<{ word: string; count: number; sentiment: 'positive' | 'negative' | 'neutral' }>;
  sentimentTrend: Array<{ time: string; positive: number; negative: number; neutral: number }>;
  summary: string;
  recommendations: string[];
}

export interface RealtimeAnalysisState {
  // 연결 상태
  isConnected: boolean;

  // 분석 진행 상태
  currentStage: string;
  progress: number;
  isCompleted: boolean;

  // 감정 카드 리스트
  emotionCards: EmotionCard[];

  // 실시간 차트 데이터
  analysisChart: AnalysisChart;

  // 최종 분석 요약
  analysisSummary: AnalysisSummary | null;

  // 오류 메시지
  error: string | null;

  // 액션들
  setConnectionStatus: (connected: boolean) => void;
  setCurrentStage: (stage: string) => void;
  setProgress: (progress: number) => void;
  setCompleted: (completed: boolean) => void;
  addEmotionCard: (card: EmotionCard) => void;
  updateAnalysisChart: (chart: AnalysisChart) => void;
  setAnalysisSummary: (summary: AnalysisSummary) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  isConnected: false,
  currentStage: '대기 중',
  progress: 0,
  isCompleted: false,
  emotionCards: [],
  analysisChart: {
    positive: 0,
    negative: 0,
    neutral: 0,
    totalProcessed: 0,
  },
  analysisSummary: null,
  error: null,
};

export const useRealtimeAnalysisStore = create<RealtimeAnalysisState>((set, get) => ({
  ...initialState,

  setConnectionStatus: (connected) => set({ isConnected: connected }),

  setCurrentStage: (stage) => set({ currentStage: stage }),

  setProgress: (progress) => set({ progress: Math.max(0, Math.min(100, progress)) }),

  setCompleted: (completed) => set({ isCompleted: completed }),

  addEmotionCard: (card) => set((state) => ({
    emotionCards: [card, ...state.emotionCards].slice(0, 50) // 최대 50개까지만 유지
  })),

  updateAnalysisChart: (chart) => set({ analysisChart: chart }),

  setAnalysisSummary: (summary) => set({ analysisSummary: summary }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));

// 성능 최적화를 위한 selector 함수들
export const useConnectionStatus = () => useRealtimeAnalysisStore((state) => state.isConnected);
export const useCurrentStage = () => useRealtimeAnalysisStore((state) => state.currentStage);
export const useProgress = () => useRealtimeAnalysisStore((state) => state.progress);
export const useIsCompleted = () => useRealtimeAnalysisStore((state) => state.isCompleted);
export const useEmotionCards = () => useRealtimeAnalysisStore((state) => state.emotionCards);
export const useAnalysisChart = () => useRealtimeAnalysisStore((state) => state.analysisChart);
export const useAnalysisSummary = () => useRealtimeAnalysisStore((state) => state.analysisSummary);
export const useRealtimeError = () => useRealtimeAnalysisStore((state) => state.error);
// 액션들을 개별적으로 export하여 무한 루프 방지
export const useRealtimeActions = () => {
  const setConnectionStatus = useRealtimeAnalysisStore((state) => state.setConnectionStatus);
  const setCurrentStage = useRealtimeAnalysisStore((state) => state.setCurrentStage);
  const setProgress = useRealtimeAnalysisStore((state) => state.setProgress);
  const setCompleted = useRealtimeAnalysisStore((state) => state.setCompleted);
  const addEmotionCard = useRealtimeAnalysisStore((state) => state.addEmotionCard);
  const updateAnalysisChart = useRealtimeAnalysisStore((state) => state.updateAnalysisChart);
  const setAnalysisSummary = useRealtimeAnalysisStore((state) => state.setAnalysisSummary);
  const setError = useRealtimeAnalysisStore((state) => state.setError);
  const clearError = useRealtimeAnalysisStore((state) => state.clearError);
  const reset = useRealtimeAnalysisStore((state) => state.reset);

  return {
    setConnectionStatus,
    setCurrentStage,
    setProgress,
    setCompleted,
    addEmotionCard,
    updateAnalysisChart,
    setAnalysisSummary,
    setError,
    clearError,
    reset,
  };
};