import axios from 'axios';
import { WatchListItem, InterestProduct, InterestProductRequest, InterestProductResponse } from '../types';

import { getApiBaseUrl } from '../utils/apiConfig';

// Axios 인스턴스 지연 생성
let apiClient: ReturnType<typeof axios.create> | null = null;

const getApiClient = () => {
  if (!apiClient) {
    apiClient = axios.create({
      baseURL: getApiBaseUrl(),
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // 요청 인터셉터: 인증 토큰 자동 추가
    apiClient.interceptors.request.use(
      (config: any) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // 응답 인터셉터: 에러 처리
    apiClient.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  } else {
    // 런타임 설정이 변경되었을 수 있으므로 baseURL 최신화
    apiClient.defaults.baseURL = getApiBaseUrl();
  }
  return apiClient;
};

// 주의: 인터셉터는 getApiClient() 내부에서 인스턴스 생성 시에만 등록됩니다.

export const interestService = {
  // 관심 상품 등록
  addInterest: async (request: InterestProductRequest): Promise<InterestProductResponse> => {
    try {
      console.log('🔵 interestService.addInterest 요청 데이터:', request);
      console.log('🔵 API Base URL:', getApiBaseUrl());
      
      const response = await getApiClient().post('/api/interests', request);
      console.log('🔵 interestService.addInterest 응답:', response.data);
      
      return response.data as InterestProductResponse;
    } catch (error: any) {
      console.error('🔴 interestService.addInterest 에러:', error);
      
      if (error.response) {
        console.error('🔴 응답 상태:', error.response.status);
        console.error('🔴 응답 데이터:', error.response.data);
        
        return {
          success: false,
          message: error.response.data?.message || '관심 상품 등록에 실패했습니다.',
          error: error.response.data?.error,
        };
      }
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  },

  // 관심 상품 목록 조회 (WatchListItem 타입으로 반환)
  getInterests: async (): Promise<WatchListItem[]> => {
    try {
      console.log('🔵 interestService.getInterests 요청');
      const response = await getApiClient().get('/api/interests');
      const data = response.data as any;
      console.log('🔵 interestService.getInterests 응답:', data);
      
      if (data.success) {
        return data.data || [];
      }
      throw new Error(data.message || '관심 상품 목록을 불러오는데 실패했습니다.');
    } catch (error: any) {
      console.error('🔴 interestService.getInterests 에러:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || '관심 상품 목록을 불러오는데 실패했습니다.');
      }
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  },

  // 관심 상품 삭제
  removeInterest: async (interestId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await getApiClient().delete(`/api/interests/${interestId}`);
      return response.data as { success: boolean; message: string };
    } catch (error: any) {
      if (error.response) {
        return {
          success: false,
          message: error.response.data?.message || '관심 상품 삭제에 실패했습니다.',
        };
      }
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  },

  // 특정 관심 상품 조회
  getInterest: async (interestId: string): Promise<InterestProduct> => {
    try {
      const response = await getApiClient().get(`/api/interests/${interestId}`);
      const data = response.data as any;
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || '관심 상품 정보를 불러오는데 실패했습니다.');
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || '관심 상품 정보를 불러오는데 실패했습니다.');
      }
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  },
};