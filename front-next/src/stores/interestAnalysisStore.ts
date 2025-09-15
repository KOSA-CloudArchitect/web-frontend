import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { InterestAnalysisData, InterestAnalysisStatus } from '../types';
import { interestAnalysisService } from '../services/interestAnalysisService';

interface InterestAnalysisState {
  analysisData: InterestAnalysisData | null;
  analysisStatus: InterestAnalysisStatus | null;
  loading: boolean;
  error: string | null;
  currentTaskId: string | null;
  
  // Actions
  fetchAnalysis: (interestId: string) => Promise<void>;
  requestAnalysis: (interestId: string) => Promise<boolean>;
  updateAnalysisStatus: (status: InterestAnalysisStatus) => void;
  clearAnalysis: () => void;
  clearError: () => void;
}

export const useInterestAnalysisStore = create<InterestAnalysisState>()(
  devtools(
    (set, get) => ({
      analysisData: null,
      analysisStatus: null,
      loading: false,
      error: null,
      currentTaskId: null,

      fetchAnalysis: async (interestId: string) => {
        set({ loading: true, error: null });
        
        try {
          const data = await interestAnalysisService.getAnalysis(interestId);
          set({ 
            analysisData: data,
            loading: false 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '분석 데이터를 불러오는데 실패했습니다.';
          set({ 
            error: errorMessage,
            loading: false 
          });
        }
      },

      requestAnalysis: async (interestId: string) => {
        set({ loading: true, error: null, analysisStatus: null });
        
        try {
          const result = await interestAnalysisService.requestAnalysis(interestId);
          
          if (result.success && result.taskId) {
            set({ 
              currentTaskId: result.taskId,
              analysisStatus: {
                status: 'pending',
                progress: 0,
                currentStep: '분석 요청 중...'
              },
              loading: false 
            });
            return true;
          } else {
            set({ 
              error: result.message,
              loading: false 
            });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '분석 요청에 실패했습니다.';
          set({ 
            error: errorMessage,
            loading: false 
          });
          return false;
        }
      },

      updateAnalysisStatus: (status: InterestAnalysisStatus) => {
        set({ analysisStatus: status });
        
        // 분석 완료 시 데이터 새로고침
        if (status.status === 'completed') {
          // 현재 분석 중인 관심 상품 ID가 있다면 데이터 새로고침
          // 이는 WebSocket에서 호출될 때 interestId를 전달받아야 함
        }
      },

      clearAnalysis: () => {
        set({ 
          analysisData: null,
          analysisStatus: null,
          currentTaskId: null,
          error: null 
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'interest-analysis-store',
    }
  )
);