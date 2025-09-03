import { create } from 'zustand';

export interface Review {
  id: string;
  content: string;
  rating: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  date: string;
  author?: string;
  helpful?: number;
}

export interface AnalysisResult {
  productId: string;
  productName: string;
  totalReviews: number;
  positiveRatio: number;
  negativeRatio: number;
  summary: string;
  keywords: string[];
  keywordData?: Array<{ keyword: string; count: number; weight: number }>;
  averageRating: number;
  reviews?: Review[];
}

export interface ReviewFilters {
  sentiment: 'all' | 'positive' | 'negative' | 'neutral';
  rating: 'all' | '1' | '2' | '3' | '4' | '5';
  dateRange: 'all' | 'recent' | 'month' | 'year';
  searchKeyword: string;
}

interface AnalysisState {
  loading: boolean;
  data: AnalysisResult | null;
  error: string | null;
  filters: ReviewFilters;
  setLoading: (loading: boolean) => void;
  setData: (data: AnalysisResult) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ReviewFilters>) => void;
  reset: () => void;
}

const defaultFilters: ReviewFilters = {
  sentiment: 'all',
  rating: 'all',
  dateRange: 'all',
  searchKeyword: '',
};

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  loading: false,
  data: null,
  error: null,
  filters: defaultFilters,
  setLoading: (loading) => set({ loading }),
  setData: (data) => set({ data, error: null, loading: false }),
  setError: (error) => set({ error, loading: false }),
  setFilters: (newFilters) => set({ filters: { ...get().filters, ...newFilters } }),
  reset: () => set({ loading: false, data: null, error: null, filters: defaultFilters }),
}));

// 성능 최적화를 위한 selector 함수들
export const useAnalysisData = () => useAnalysisStore((state) => state.data);
export const useAnalysisLoading = () => useAnalysisStore((state) => state.loading);
export const useAnalysisError = () => useAnalysisStore((state) => state.error);
export const useAnalysisFilters = () => useAnalysisStore((state) => state.filters);
export const useAnalysisActions = () => useAnalysisStore((state) => ({
  setLoading: state.setLoading,
  setData: state.setData,
  setError: state.setError,
  setFilters: state.setFilters,
  reset: state.reset,
}));