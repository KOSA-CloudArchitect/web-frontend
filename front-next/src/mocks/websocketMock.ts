// Mock WebSocket 서버 (테스트용)
export class MockWebSocketServer {
  private callbacks: Map<string, Function[]> = new Map();
  private isConnected = false;
  private productId: string;
  private _connected = false;

  constructor(productId: string) {
    this.productId = productId;
  }

  get connected() {
    return this._connected;
  }

  set connected(value: boolean) {
    this._connected = value;
    this.isConnected = value;
  }

  // 이벤트 리스너 등록
  on(event: string, callback: Function) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  // 이벤트 리스너 제거
  off(event: string, callback: Function) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // 이벤트 발생
  emit(event: string, data: any) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // 연결 시뮬레이션
  connect() {
    if (!this.isConnected) {
      this.isConnected = true;
      this.connected = true;
      setTimeout(() => {
        this.emit('connect', {});

        // 테스트 환경이 아닌 경우에만 분석 시뮬레이션 시작
        if (process.env.NODE_ENV !== 'test') {
          this.startAnalysisSimulation();
        }
      }, 0);
    }
    return this;
  }

  // 연결 해제
  disconnect() {
    this.isConnected = false;
    this.connected = false;
    this.emit('disconnect', { reason: 'client disconnect' });
  }

  // Socket.IO 호환성을 위한 추가 메서드들
  close() {
    this.disconnect();
  }

  removeAllListeners() {
    this.callbacks.clear();
  }

  // 분석 시뮬레이션
  private startAnalysisSimulation() {
    // 테스트 환경에서는 시뮬레이션 실행하지 않음
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    let progress = 0;
    let emotionCardCount = 0;

    const stages = [
      '리뷰 수집 중',
      '데이터 전처리',
      '감성 분석 중',
      '결과 생성',
      '완료'
    ];

    const mockEmotions = [
      { sentiment: 'positive', content: '정말 좋은 제품이에요! 추천합니다.', keywords: ['좋은', '추천', '만족'] },
      { sentiment: 'negative', content: '배송이 너무 늦었어요. 실망입니다.', keywords: ['배송', '늦음', '실망'] },
      { sentiment: 'neutral', content: '보통 수준의 제품입니다.', keywords: ['보통', '평범'] },
      { sentiment: 'positive', content: '가격 대비 성능이 훌륭해요!', keywords: ['가격', '성능', '훌륭'] },
      { sentiment: 'negative', content: '품질이 기대에 못 미쳤습니다.', keywords: ['품질', '기대', '실망'] },
    ];

    const interval = setInterval(() => {
      if (!this.isConnected) {
        clearInterval(interval);
        return;
      }

      progress += Math.random() * 10;
      if (progress > 100) progress = 100;

      // 진행 상태 업데이트
      const currentStageIndex = Math.floor((progress / 100) * stages.length);
      const currentStage = stages[Math.min(currentStageIndex, stages.length - 1)];

      this.emit(`analysis:status:${this.productId}`, {
        stage: currentStage,
        progress: Math.round(progress),
        timestamp: new Date().toISOString()
      });

      // 감정 카드 생성 (50% 이후부터)
      if (progress > 50 && Math.random() > 0.7 && emotionCardCount < 10) {
        const emotion = mockEmotions[emotionCardCount % mockEmotions.length];
        this.emit(`analysis:emotion:${this.productId}`, {
          id: `emotion-${emotionCardCount}`,
          sentiment: emotion.sentiment,
          content: emotion.content,
          keywords: emotion.keywords,
          confidence: 0.7 + Math.random() * 0.3,
          timestamp: new Date().toISOString()
        });
        emotionCardCount++;
      }

      // 차트 업데이트
      const positive = Math.floor(emotionCardCount * 0.4 + Math.random() * 5);
      const negative = Math.floor(emotionCardCount * 0.3 + Math.random() * 3);
      const neutral = Math.floor(emotionCardCount * 0.3 + Math.random() * 2);

      this.emit(`analysis:chart:${this.productId}`, {
        positive,
        negative,
        neutral,
        totalProcessed: positive + negative + neutral
      });

      // 완료 처리
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          this.emit(`analysis:complete:${this.productId}`, {
            message: '분석이 완료되었습니다.',
            timestamp: new Date().toISOString()
          });
        }, 1000);
      }
    }, 1000);
  }
}

// Mock 서버 인스턴스 생성 함수
export const createMockWebSocketServer = (productId: string) => {
  const server = new MockWebSocketServer(productId);
  // 즉시 연결 상태로 설정
  server.connect();
  return server;
};