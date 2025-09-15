import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { WatchListItem, InterestProduct, InterestProductRequest } from '../types';
import { interestService } from '../services/interestService';

interface InterestState {
  interests: InterestProduct[]; // 호환성을 위해 변환된 형태로 유지
  watchListItems: WatchListItem[]; // 원본 WatchListItem 데이터
  loading: boolean;
  error: string | null;
  
  // Actions
  addInterest: (request: InterestProductRequest) => Promise<boolean>;
  removeInterest: (interestId: string) => Promise<boolean>;
  removeMultipleInterests: (interestIds: string[]) => Promise<boolean>;
  fetchInterests: () => Promise<void>;
  clearError: () => void;
}

// WatchListItem을 InterestProduct 형태로 변환하는 함수
const convertWatchListToInterestProduct = (watchItem: WatchListItem): InterestProduct => {
  return {
    id: watchItem.id,
    productId: watchItem.productId,
    productName: watchItem.product?.title || 'Unknown Product',
    productUrl: watchItem.product?.url || '',
    imageUrl: watchItem.product?.imageUrl,
    currentPrice: watchItem.product?.currentPrice,
    originalPrice: watchItem.product?.originalPrice,
    rating: watchItem.product?.rating,
    reviewCount: watchItem.product?.reviewCount,
    isActive: watchItem.isActive,
    lastAnalyzedAt: undefined,
    createdAt: watchItem.createdAt,
    updatedAt: watchItem.updatedAt,
  };
};

export const useInterestStore = create<InterestState>()(
  devtools(
    (set, get) => ({
      interests: [],
      watchListItems: [],
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
            const newWatchItem = response.data as WatchListItem;
            const convertedItem = convertWatchListToInterestProduct(newWatchItem);
            
            set((state) => ({
              watchListItems: [...state.watchListItems, newWatchItem],
              interests: [...state.interests, convertedItem],
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
              watchListItems: state.watchListItems.filter(item => item.id !== interestId),
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
              watchListItems: state.watchListItems.filter(item => !successfulDeletes.includes(item.id)),
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
        console.log('🟡 interestStore.fetchInterests 시작');
        set({ loading: true, error: null });
        
        try {
          const watchListItems = await interestService.getInterests();
          console.log('🟡 조회된 WatchListItems:', watchListItems);
          
          // WatchListItem을 InterestProduct 형태로 변환
          const convertedInterests = watchListItems.map(convertWatchListToInterestProduct);
          console.log('🟡 변환된 InterestProducts:', convertedInterests);
          
          set({ 
            watchListItems,
            interests: convertedInterests,
            loading: false 
          });
        } catch (error) {
          console.error('🔴 interestStore.fetchInterests 에러:', error);
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