import { apiService } from './api';
import { InterestAnalysisData, InterestAnalysisResponse, InterestAnalysisStatus } from '../types';

export const interestAnalysisService = {
  // 관심 상품 분석 데이터 조회
  getAnalysis: async (interestId: string): Promise<InterestAnalysisData | null> => {
    try {
      const response = await apiService.get<InterestAnalysisResponse>(`/api/interests/${interestId}/analysis`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to fetch interest analysis:', error);
      return null;
    }
  },

  // 관심 상품 분석 요청
  requestAnalysis: async (interestId: string): Promise<{ success: boolean; taskId?: string; message: string }> => {
    try {
      const response = await apiService.post<{
        success: boolean;
        taskId?: string;
        message: string;
        estimatedTime?: number;
      }>(`/api/interests/${interestId}/analysis`);
      
      return {
        success: response.success,
        taskId: response.taskId,
        message: response.message
      };
    } catch (error: any) {
      console.error('Failed to request interest analysis:', error);
      return {
        success: false,
        message: error.message || '분석 요청에 실패했습니다.'
      };
    }
  },

  // 분석 상태 조회
  getAnalysisStatus: async (taskId: string): Promise<InterestAnalysisStatus | null> => {
    try {
      const response = await apiService.get<{
        success: boolean;
        data?: InterestAnalysisStatus;
      }>(`/api/analysis-status/${taskId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to fetch analysis status:', error);
      return null;
    }
  }
};