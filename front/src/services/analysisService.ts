import { AnalysisResult } from '../stores/analysisStore';

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
}