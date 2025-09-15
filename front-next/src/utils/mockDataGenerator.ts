import { EmotionCard, AnalysisChart, AnalysisSummary } from '../stores/realtimeAnalysisStore';

// 샘플 리뷰 데이터
const sampleReviews = [
  "이 제품 정말 좋아요! 품질이 훌륭하고 배송도 빨라서 만족합니다.",
  "가격 대비 성능이 아쉬워요. 기대했던 것보다 품질이 떨어집니다.",
  "보통 수준이에요. 나쁘지도 좋지도 않은 평범한 제품입니다.",
  "완전 대만족! 친구들에게도 추천하고 싶은 제품이에요.",
  "배송이 너무 늦었어요. 제품은 괜찮지만 서비스가 아쉽습니다.",
  "디자인이 예쁘고 실용적이에요. 다시 구매할 의향 있습니다.",
  "불량품이 왔어요. 교환 처리가 번거로웠습니다.",
  "가성비 좋은 제품이네요. 추천합니다!",
  "포장이 꼼꼼하고 제품 상태도 완벽했어요.",
  "사용법이 복잡해서 이해하기 어려웠습니다."
];

const sampleKeywords = [
  ['품질', '만족', '추천'],
  ['가격', '성능', '아쉬움'],
  ['보통', '평범', '무난'],
  ['대만족', '완벽', '최고'],
  ['배송', '늦음', '서비스'],
  ['디자인', '예쁨', '실용'],
  ['불량', '교환', '문제'],
  ['가성비', '추천', '좋음'],
  ['포장', '완벽', '상태'],
  ['복잡', '어려움', '사용법']
];

const sentimentColors = {
  positive: 'border-green-200 bg-green-50',
  negative: 'border-red-200 bg-red-50',
  neutral: 'border-gray-200 bg-gray-50'
};

export class MockDataGenerator {
  private cardIdCounter = 0;
  private analysisStats = {
    positive: 0,
    negative: 0,
    neutral: 0,
    totalProcessed: 0
  };
  private allGeneratedCards: EmotionCard[] = [];

  generateEmotionCard(): EmotionCard {
    const sentiments: Array<'positive' | 'negative' | 'neutral'> = ['positive', 'negative', 'neutral'];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const reviewIndex = Math.floor(Math.random() * sampleReviews.length);
    
    // 감정에 따른 확률 조정
    let adjustedSentiment = sentiment;
    if (sentiment === 'positive' && Math.random() < 0.7) {
      adjustedSentiment = 'positive';
    } else if (sentiment === 'negative' && Math.random() < 0.3) {
      adjustedSentiment = 'negative';
    } else if (Math.random() < 0.4) {
      adjustedSentiment = 'neutral';
    }

    this.analysisStats[adjustedSentiment]++;
    this.analysisStats.totalProcessed++;

    const card: EmotionCard = {
      id: `card-${++this.cardIdCounter}-${Date.now()}`,
      sentiment: adjustedSentiment,
      content: sampleReviews[reviewIndex],
      keywords: sampleKeywords[reviewIndex] || ['키워드'],
      confidence: 0.7 + Math.random() * 0.3, // 0.7 ~ 1.0
      timestamp: new Date().toISOString(),
      color: sentimentColors[adjustedSentiment]
    };

    this.allGeneratedCards.push(card);
    return card;
  }

  generateAnalysisChart(): AnalysisChart {
    return { ...this.analysisStats };
  }

  generateAnalysisSummary(): AnalysisSummary {
    const total = this.analysisStats.totalProcessed;
    if (total === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        topKeywords: [],
        sentimentTrend: [],
        summary: '분석할 데이터가 없습니다.',
        recommendations: []
      };
    }

    // 키워드 빈도 계산
    const keywordCount: { [key: string]: { count: number; sentiment: 'positive' | 'negative' | 'neutral' } } = {};
    this.allGeneratedCards.forEach(card => {
      card.keywords.forEach(keyword => {
        if (!keywordCount[keyword]) {
          keywordCount[keyword] = { count: 0, sentiment: card.sentiment };
        }
        keywordCount[keyword].count++;
      });
    });

    const topKeywords = Object.entries(keywordCount)
      .map(([word, data]) => ({ word, count: data.count, sentiment: data.sentiment }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 감정 트렌드 (시간별)
    const sentimentTrend = this.generateSentimentTrend();

    // 평균 평점 계산 (감정 비율 기반)
    const positiveRatio = this.analysisStats.positive / total;
    const negativeRatio = this.analysisStats.negative / total;
    const averageRating = Math.round((positiveRatio * 5 + negativeRatio * 2 + (1 - positiveRatio - negativeRatio) * 3.5) * 10) / 10;

    // 요약 생성
    const summary = this.generateSummaryText();

    // 추천사항 생성
    const recommendations = this.generateRecommendations();

    return {
      totalReviews: total,
      averageRating,
      topKeywords,
      sentimentTrend,
      summary,
      recommendations
    };
  }

  private generateSentimentTrend() {
    const trend = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 10 * 60 * 1000); // 10분 간격
      const timeStr = time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      
      // 시간에 따른 감정 변화 시뮬레이션
      const basePositive = this.analysisStats.positive / 7;
      const baseNegative = this.analysisStats.negative / 7;
      const baseNeutral = this.analysisStats.neutral / 7;
      
      trend.push({
        time: timeStr,
        positive: Math.round(basePositive + (Math.random() - 0.5) * basePositive * 0.3),
        negative: Math.round(baseNegative + (Math.random() - 0.5) * baseNegative * 0.3),
        neutral: Math.round(baseNeutral + (Math.random() - 0.5) * baseNeutral * 0.3)
      });
    }
    
    return trend;
  }

  private generateSummaryText(): string {
    const total = this.analysisStats.totalProcessed;
    const positiveRatio = (this.analysisStats.positive / total * 100).toFixed(1);
    const negativeRatio = (this.analysisStats.negative / total * 100).toFixed(1);
    const neutralRatio = (this.analysisStats.neutral / total * 100).toFixed(1);

    let summary = `총 ${total}개의 리뷰를 분석한 결과, `;
    
    if (this.analysisStats.positive > this.analysisStats.negative) {
      summary += `전반적으로 긍정적인 반응을 보이고 있습니다. `;
      summary += `긍정적 리뷰가 ${positiveRatio}%로 가장 높은 비율을 차지하며, `;
      summary += `부정적 리뷰는 ${negativeRatio}%, 중립적 리뷰는 ${neutralRatio}%입니다.`;
    } else if (this.analysisStats.negative > this.analysisStats.positive) {
      summary += `부정적인 반응이 우세한 상황입니다. `;
      summary += `부정적 리뷰가 ${negativeRatio}%로 가장 높고, `;
      summary += `긍정적 리뷰는 ${positiveRatio}%, 중립적 리뷰는 ${neutralRatio}%입니다.`;
    } else {
      summary += `긍정과 부정이 균형을 이루고 있습니다. `;
      summary += `긍정 ${positiveRatio}%, 부정 ${negativeRatio}%, 중립 ${neutralRatio}%의 분포를 보입니다.`;
    }

    return summary;
  }

  private generateRecommendations(): string[] {
    const recommendations = [];
    const total = this.analysisStats.totalProcessed;
    const positiveRatio = this.analysisStats.positive / total;
    const negativeRatio = this.analysisStats.negative / total;

    if (positiveRatio > 0.6) {
      recommendations.push('긍정적 리뷰가 많으므로 현재 전략을 유지하는 것이 좋습니다.');
      recommendations.push('만족한 고객들의 후기를 마케팅에 적극 활용해보세요.');
    } else if (negativeRatio > 0.4) {
      recommendations.push('부정적 피드백이 많으므로 제품/서비스 개선이 필요합니다.');
      recommendations.push('주요 불만사항을 파악하여 우선순위별로 개선 계획을 수립하세요.');
    }

    if (total < 50) {
      recommendations.push('더 많은 리뷰 데이터 수집을 통해 분석 정확도를 높이는 것을 권장합니다.');
    }

    recommendations.push('정기적인 감정 분석을 통해 고객 만족도 변화를 모니터링하세요.');

    return recommendations;
  }

  reset() {
    this.cardIdCounter = 0;
    this.analysisStats = {
      positive: 0,
      negative: 0,
      neutral: 0,
      totalProcessed: 0
    };
    this.allGeneratedCards = [];
  }

  // 시뮬레이션을 위한 단계별 진행 상태
  getAnalysisStages(targetReviews: number = 20) {
    // 카드 생성 시간을 고려한 감정 분석 단계 시간 계산
    const cardGenerationTime = targetReviews * 1200 + 1000; // 카드 간격 * 개수 + 여유시간
    
    return [
      { stage: '크롤링 시작', duration: 2000 },
      { stage: '리뷰 데이터 수집 중', duration: 3000 },
      { stage: '텍스트 전처리 중', duration: 1500 },
      { stage: '감정 분석 중', duration: cardGenerationTime },
      { stage: '키워드 추출 중', duration: 2500 },
      { stage: '결과 생성 중', duration: 2000 },
      { stage: '최종 검토 중', duration: 1500 },
      { stage: '분석 완료', duration: 1000 }
    ];
  }
}

export const mockDataGenerator = new MockDataGenerator();