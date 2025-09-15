import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../types';
import { authService, AuthError } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string, confirmNewPassword: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  checkAuthStatus: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.login({ email, password });
          
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof AuthError 
            ? error.message 
            : '로그인 중 오류가 발생했습니다.';
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          
          throw error;
        }
      },

      register: async (email: string, password: string, confirmPassword: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await authService.register({ email, password, confirmPassword });
          
          set({
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof AuthError 
            ? error.message 
            : '회원가입 중 오류가 발생했습니다.';
          
          set({
            isLoading: false,
            error: errorMessage,
          });
          
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authService.logout();
        } catch (error) {
          console.warn('로그아웃 요청 실패:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      logoutAll: async () => {
        set({ isLoading: true });
        
        try {
          await authService.logoutAll();
        } catch (error) {
          console.warn('전체 로그아웃 요청 실패:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      refreshToken: async () => {
        try {
          const response = await authService.refreshToken();
          
          set({
            user: response.data.user,
            isAuthenticated: true,
            error: null,
          });
        } catch (error) {
          console.warn('토큰 갱신 실패:', error);
          
          // 토큰 갱신 실패 시 로그아웃
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
          
          throw error;
        }
      },

      getCurrentUser: async () => {
        if (!authService.isAuthenticated()) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        
        try {
          const user = await authService.getCurrentUser();
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.warn('사용자 정보 조회 실패:', error);
          
          // 사용자 정보 조회 실패 시 로그아웃
          authService.clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      changePassword: async (currentPassword: string, newPassword: string, confirmNewPassword: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await authService.changePassword(currentPassword, newPassword, confirmNewPassword);
          
          set({
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof AuthError 
            ? error.message 
            : '비밀번호 변경 중 오류가 발생했습니다.';
          
          set({
            isLoading: false,
            error: errorMessage,
          });
          
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      checkAuthStatus: () => {
        const state = get();
        const hasToken = authService.isAuthenticated();
        const isTokenValid = hasToken && !authService.isTokenExpired();
        
        // 토큰이 없거나 만료된 경우
        if (!isTokenValid && state.isAuthenticated) {
          authService.clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
          return;
        }
        
        // 토큰이 유효하지만 상태가 인증되지 않은 경우
        if (isTokenValid && !state.isAuthenticated) {
          set({ isAuthenticated: true });
          
          // 사용자 정보가 없으면 조회
          if (!state.user) {
            // 즉시 실행하지 않고 다음 틱에 실행
            setTimeout(() => {
              const currentState = get();
              if (currentState.isAuthenticated && !currentState.user) {
                currentState.getCurrentUser().catch((error) => {
                  console.error('사용자 정보 조회 실패:', error);
                  // 사용자 정보 조회 실패 시 로그아웃
                  authService.clearTokens();
                  set({
                    user: null,
                    isAuthenticated: false,
                    error: null,
                  });
                });
              }
            }, 0);
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // SSR 호환을 위해 localStorage가 사용 가능할 때만 사용
        if (typeof window !== 'undefined') {
          return window.localStorage;
        }
        // SSR 시에는 no-op 저장소 사용
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// 선택자 함수들 (성능 최적화)
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

// 액션들을 개별적으로 선택하는 훅들 (무한 루프 방지)
export const useAuthLogin = () => useAuthStore((state) => state.login);
export const useAuthRegister = () => useAuthStore((state) => state.register);
export const useAuthLogout = () => useAuthStore((state) => state.logout);
export const useAuthLogoutAll = () => useAuthStore((state) => state.logoutAll);
export const useAuthRefreshToken = () => useAuthStore((state) => state.refreshToken);
export const useAuthGetCurrentUser = () => useAuthStore((state) => state.getCurrentUser);
export const useAuthChangePassword = () => useAuthStore((state) => state.changePassword);
export const useAuthClearError = () => useAuthStore((state) => state.clearError);
export const useAuthSetLoading = () => useAuthStore((state) => state.setLoading);
export const useAuthCheckStatus = () => useAuthStore((state) => state.checkAuthStatus);