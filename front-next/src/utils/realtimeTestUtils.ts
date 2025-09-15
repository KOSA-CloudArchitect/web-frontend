// 개발자 도구에서 사용할 수 있는 테스트 유틸리티

import { mockDataGenerator } from './mockDataGenerator';

// 글로벌 객체에 테스트 함수들 추가 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  (window as any).realtimeTest = {
    // 대량 카드 생성
    generateBulkCards: (count: number = 10) => {
      console.log(`${count}개의 감정 카드를 생성합니다...`);
      for (let i = 0; i < count; i++) {
        const card = mockDataGenerator.generateEmotionCard();
        console.log(`카드 ${i + 1}:`, card);
      }
    },

    // 특정 감정의 카드만 생성
    generateSentimentCards: (sentiment: 'positive' | 'negative' | 'neutral', count: number = 5) => {
      console.log(`${sentiment} 감정의 카드 ${count}개를 생성합니다...`);
      // 임시로 감정 고정
      const originalMethod = mockDataGenerator.generateEmotionCard;
      mockDataGenerator.generateEmotionCard = function() {
        const card = originalMethod.call(this);
        card.sentiment = sentiment;
        return card;
      };
      
      for (let i = 0; i < count; i++) {
        const card = mockDataGenerator.generateEmotionCard();
        console.log(`${sentiment} 카드 ${i + 1}:`, card);
      }
      
      // 원래 메서드 복원
      mockDataGenerator.generateEmotionCard = originalMethod;
    },

    // 현재 통계 확인
    getStats: () => {
      const stats = mockDataGenerator.generateAnalysisChart();
      console.log('현재 분석 통계:', stats);
      return stats;
    },

    // 리셋
    reset: () => {
      mockDataGenerator.reset();
      console.log('Mock 데이터 생성기가 리셋되었습니다.');
    }
  };

  console.log('🧪 실시간 테스트 유틸리티가 로드되었습니다!');
  console.log('사용법:');
  console.log('- realtimeTest.generateBulkCards(10) // 10개 카드 생성');
  console.log('- realtimeTest.generateSentimentCards("positive", 5) // 긍정 카드 5개');
  console.log('- realtimeTest.getStats() // 현재 통계');
  console.log('- realtimeTest.reset() // 리셋');
}

export {};