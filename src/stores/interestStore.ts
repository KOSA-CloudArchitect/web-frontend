import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { InterestProduct, InterestProductRequest } from '../types';
import { interestService } from '../services/interestService';

interface InterestState {
  interests: InterestProduct[];
  loading: boolean;
  error: string | null;
  
  // Actions
  addInterest: (request: InterestProductRequest) => Promise<boolean>;
  removeInterest: (interestId: string) => Promise<boolean>;
  removeMultipleInterests: (interestIds: string[]) => Promise<boolean>;
  fetchInterests: () => Promise<void>;
  clearError: () => void;
}

export const useInterestStore = create<InterestState>()(
  devtools(
    (set, get) => ({
      interests: [],
      loading: false,
      error: null,

      addInterest: async (request: InterestProductRequest) => {
        console.log('🟡 interestStore.addInterest 시작:', request);
        set({ loading: true, error: null });
        
        try {
          const response = await interestService.addInterest(request);
          console.log('🟡 interestStore.addInterest 서비스 응답:', response);
          
          if (response.success && response.data) {
            console.log('✅ 관심 상품 등록 성공:', response.data);
            set((state) => ({
              interests: [...state.interests, response.data!],
              loading: false,
            }));
            return true;
          } else {
            console.error('❌ 관심 상품 등록 실패:', response.message);
            set({ 
              error: response.message || '관심 상품 등록에 실패했습니다.',
              loading: false 
            });
            return false;
          }
        } catch (error) {
          console.error('❌ interestStore.addInterest 예외:', error);
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
          set({ 
            error: errorMessage,
            loading: false 
          });
          return false;
        }
      },

      removeInterest: async (interestId: string) => {
        set({ loading: true, error: null });
        
        try {
          const response = await interestService.removeInterest(interestId);
          
          if (response.success) {
            set((state) => ({
              interests: state.interests.filter(interest => interest.id !== interestId),
              loading: false,
            }));
            return true;
          } else {
            set({ 
              error: response.message || '관심 상품 삭제에 실패했습니다.',
              loading: false 
            });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
          set({ 
            error: errorMessage,
            loading: false 
          });
          return false;
        }
      },

      removeMultipleInterests: async (interestIds: string[]) => {
        set({ loading: true, error: null });
        
        try {
          // 병렬로 삭제 요청 실행
          const deletePromises = interestIds.map(id => interestService.removeInterest(id));
          const results = await Promise.allSettled(deletePromises);
          
          // 성공한 삭제들만 필터링
          const successfulDeletes: string[] = [];
          const failedDeletes: string[] = [];
          
          results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value.success) {
              successfulDeletes.push(interestIds[index]);
            } else {
              failedDeletes.push(interestIds[index]);
            }
          });
          
          // 성공한 항목들을 상태에서 제거
          if (successfulDeletes.length > 0) {
            set((state) => ({
              interests: state.interests.filter(interest => !successfulDeletes.includes(interest.id)),
              loading: false,
              error: failedDeletes.length > 0 
                ? `${failedDeletes.length}개 항목 삭제에 실패했습니다.`
                : null
            }));
          } else {
            set({ 
              error: '모든 항목 삭제에 실패했습니다.',
              loading: false 
            });
          }
          
          return successfulDeletes.length > 0;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
          set({ 
            error: errorMessage,
            loading: false 
          });
          return false;
        }
      },

      fetchInterests: async () => {
        set({ loading: true, error: null });
        
        try {
          const interests = await interestService.getInterests();
          set({ 
            interests,
            loading: false 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '관심 상품 목록을 불러오는데 실패했습니다.';
          set({ 
            error: errorMessage,
            loading: false 
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'interest-store',
    }
  )
);