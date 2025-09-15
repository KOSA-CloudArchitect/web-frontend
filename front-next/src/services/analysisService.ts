'use client';

// 분석 결과 타입 정의
export interface AnalysisResult {
  productId: string;
  productName: string;
  totalReviews: number;
  positiveRatio: number;
  negativeRatio: number;
  summary: string;
  keywords: string[];
  keywordData: any[];
  averageRating: number;
  reviews: any[];
}

export interface AnalyzeRequest {
  productUrl: string;
}

export class AnalysisService {
  private static readonly BASE_URL = '/api';

  static async analyzeProduct(productUrl: string): Promise<AnalysisResult> {
    try {
      const response = await fetch(`${this.BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // 백엔드 응답을 프론트엔드 형식으로 변환
      return {
        productId: data.productId || '',
        productName: data.productName || '상품명 없음',
        totalReviews: data.totalReviews || 0,
        positiveRatio: data.positiveRatio || 0,
        negativeRatio: data.negativeRatio || 0,
        summary: data.summary || '요약 정보가 없습니다.',
        keywords: data.keywords || [],
        keywordData: data.keywordData || data.keywordAnalysis || [],
        averageRating: data.averageRating || 0,
        reviews: data.reviews || data.reviewList || [],
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('분석 요청 중 알 수 없는 오류가 발생했습니다.');
    }
  }

  // Airflow를 통한 분석 요청
  static async analyzeProductWithAirflow(
    productId: string, 
    productUrl: string, 
    userId: string = 'anonymous'
  ): Promise<{ success: boolean; taskId?: string; dagRunId?: string; message?: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/analyze/airflow/single`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          productUrl,
          userId,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Airflow 분석 요청 오류:', error);
      return {
        success: false,
        message: '분석 요청 중 오류가 발생했습니다.',
      };
    }
  }

  // 분석 상태 확인
  static async getAnalysisStatus(
    taskId: string, 
    dagRunId?: string
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const params = new URLSearchParams({ taskId });
      if (dagRunId) params.append('dagRunId', dagRunId);
      
      const response = await fetch(`${this.BASE_URL}/analyze/status?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('분석 상태 확인 오류:', error);
      return {
        success: false,
        message: '분석 상태 확인 중 오류가 발생했습니다.',
      };
    }
  }

  // 분석 결과 조회
  static async getAnalysisResult(productId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/analysis/result/${productId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('분석 결과 조회 오류:', error);
      return {
        success: false,
        message: '분석 결과 조회 중 오류가 발생했습니다.',
      };
    }
  }
}
