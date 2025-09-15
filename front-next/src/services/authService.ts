import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  RefreshTokenResponse, 
  User,
  ApiErrorResponse 
} from '../types';
import { getApiBaseUrl } from '../utils/apiConfig';

export class AuthError extends Error {
  constructor(message: string, public code?: string, public status?: number) {
    super(message);
    this.name = 'AuthError';
  }
}

class AuthService {
  private accessToken: string | null = null;

  constructor() {
    // 페이지 로드 시 localStorage에서 토큰 복원
    this.accessToken = localStorage.getItem('accessToken');
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` }),
          ...options?.headers,
        },
        credentials: 'include', // 쿠키 포함 (Refresh Token용)
        ...options,
      });

      if (!response) {
        throw new AuthError('네트워크 응답을 받을 수 없습니다.');
      }

      if (!response.ok) {
        let errorData: ApiErrorResponse;
        
        try {
          errorData = await response.json();
        } catch {
          throw new AuthError(`HTTP ${response.status}: ${response.statusText}`, 'NETWORK_ERROR', response.status);
        }
        
        throw new AuthError(errorData.message, errorData.error, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError(
        error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        'UNKNOWN_ERROR'
      );
    }
  }

  // 회원가입
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response;
  }

  // 로그인
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // 토큰 저장
    this.setAccessToken(response.data.accessToken);
    
    return response;
  }

  // 로그아웃
  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // 로그아웃 실패해도 로컬 토큰은 제거
      console.warn('로그아웃 요청 실패:', error);
    } finally {
      this.clearTokens();
    }
  }

  // 모든 세션 로그아웃
  async logoutAll(): Promise<void> {
    try {
      await this.request('/api/auth/logout-all', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('전체 로그아웃 요청 실패:', error);
    } finally {
      this.clearTokens();
    }
  }

  // 토큰 갱신
  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await this.request<RefreshTokenResponse>('/api/auth/refresh', {
      method: 'POST',
    });

    // 새로운 토큰 저장
    this.setAccessToken(response.data.accessToken);
    
    return response;
  }

  // 현재 사용자 정보 조회
  async getCurrentUser(): Promise<User> {
    const response = await this.request<{ success: boolean; data: { user: User } }>('/api/auth/me');
    return response.data.user;
  }

  // 비밀번호 변경
  async changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string): Promise<void> {
    await this.request('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmNewPassword,
      }),
    });
  }

  // Access Token 설정
  setAccessToken(token: string): void {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
  }

  // Access Token 조회
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // 토큰 제거
  clearTokens(): void {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  // 로그인 상태 확인
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // 토큰 자동 갱신 (만료 5분 전)
  async autoRefreshToken(): Promise<void> {
    if (!this.accessToken) return;

    try {
      // JWT 토큰 디코딩하여 만료 시간 확인
      const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
      const expirationTime = payload.exp * 1000; // 밀리초로 변환
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;

      // 만료 5분 전이면 토큰 갱신
      if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
        await this.refreshToken();
      }
    } catch (error) {
      console.warn('토큰 자동 갱신 실패:', error);
      // 토큰이 유효하지 않으면 로그아웃
      this.clearTokens();
    }
  }

  // 토큰 만료 확인
  isTokenExpired(): boolean {
    if (!this.accessToken) return true;

    try {
      const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      return Date.now() >= expirationTime;
    } catch {
      return true;
    }
  }
}

export const authService = new AuthService();

// 토큰 자동 갱신 설정 (5분마다 체크)
setInterval(() => {
  authService.autoRefreshToken();
}, 5 * 60 * 1000);