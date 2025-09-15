import { useEffect, useRef, useState } from 'react';
import { useRealtimeActions } from '../stores/realtimeAnalysisStore';
import { mockDataGenerator } from '../utils/mockDataGenerator';

interface SimulationOptions {
  cardInterval?: number; // 카드 생성 간격 (ms)
  progressInterval?: number; // 진행률 업데이트 간격 (ms)
  autoStart?: boolean; // 자동 시작 여부
  targetReviews?: number; // 목표 리뷰 수
}

export const useRealtimeSimulation = (options: SimulationOptions = {}) => {
  const {
    cardInterval = 2000,
    progressInterval = 100,
    autoStart = false,
    targetReviews = 20
  } = options;

  const {
    setConnectionStatus,
    setCurrentStage,
    setProgress,
    setCompleted,
    addEmotionCard,
    updateAnalysisChart,
    setAnalysisSummary,
    setError,
    clearError,
    reset
  } = useRealtimeActions();

  const [isRunning, setIsRunning] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const cardIntervalRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const stageTimeoutRef = useRef<NodeJS.Timeout>();
  const cardCountRef = useRef(0);

  const stages = mockDataGenerator.getAnalysisStages(targetReviews);

  const startSimulation = () => {
    if (isRunning) return;

    setIsRunning(true);
    setConnectionStatus(true);
    clearError();
    reset();
    mockDataGenerator.reset();
    cardCountRef.current = 0;
    setCurrentStageIndex(0);

    // 단계별 진행 시뮬레이션
    runStageSimulation(0);
  };

  const stopSimulation = () => {
    setIsRunning(false);
    setConnectionStatus(false);
    
    // 모든 타이머 정리
    if (cardIntervalRef.current) {
      clearInterval(cardIntervalRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (stageTimeoutRef.current) {
      clearTimeout(stageTimeoutRef.current);
    }
  };

  const runStageSimulation = (stageIndex: number) => {
    if (stageIndex >= stages.length) {
      // 모든 단계 완료
      setProgress(100);
      setCurrentStage('분석 완료');
      setCompleted(true);
      
      // 최종 요약 생성
      const summary = mockDataGenerator.generateAnalysisSummary();
      setAnalysisSummary(summary);
      
      setTimeout(() => {
        setIsRunning(false);
        setConnectionStatus(false);
      }, 3000);
      return;
    }

    const stage = stages[stageIndex];
    setCurrentStage(stage.stage);
    
    // 진행률 애니메이션
    let currentProgress = (stageIndex / stages.length) * 100;
    const targetProgress = ((stageIndex + 1) / stages.length) * 100;
    const progressStep = (targetProgress - currentProgress) / (stage.duration / progressInterval);

    progressIntervalRef.current = setInterval(() => {
      currentProgress += progressStep;
      if (currentProgress >= targetProgress) {
        currentProgress = targetProgress;
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
      setProgress(Math.round(currentProgress));
    }, progressInterval);

    // 감정 분석 단계에서 카드 생성 시작
    if (stage.stage === '감정 분석 중') {
      startCardGeneration();
    }

    // 다음 단계로 이동
    stageTimeoutRef.current = setTimeout(() => {
      setCurrentStageIndex(stageIndex + 1);
      runStageSimulation(stageIndex + 1);
    }, stage.duration);
  };

  const startCardGeneration = () => {
    cardIntervalRef.current = setInterval(() => {
      if (cardCountRef.current >= targetReviews) {
        if (cardIntervalRef.current) {
          clearInterval(cardIntervalRef.current);
        }
        // 목표 리뷰 수에 도달하면 감정 분석 단계 완료
        // 다음 단계들은 runStageSimulation에서 자동으로 진행됨
        return;
      }

      // 새 감정 카드 생성
      const newCard = mockDataGenerator.generateEmotionCard();
      addEmotionCard(newCard);
      
      // 차트 데이터 업데이트
      const chartData = mockDataGenerator.generateAnalysisChart();
      updateAnalysisChart(chartData);
      
      cardCountRef.current++;
      
      // 진행률 업데이트 (감정 분석 단계에서 50% ~ 75%)
      const cardProgress = (cardCountRef.current / targetReviews) * 25; // 25% 범위
      setProgress(Math.round(50 + cardProgress));
    }, cardInterval);
  };

  const simulateError = (errorMessage: string) => {
    setError(errorMessage);
    stopSimulation();
  };

  const addSingleCard = () => {
    const newCard = mockDataGenerator.generateEmotionCard();
    addEmotionCard(newCard);
    
    const chartData = mockDataGenerator.generateAnalysisChart();
    updateAnalysisChart(chartData);
  };

  // 자동 시작
  useEffect(() => {
    if (autoStart) {
      startSimulation();
    }

    return () => {
      stopSimulation();
    };
  }, [autoStart]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopSimulation();
    };
  }, []);

  return {
    isRunning,
    targetReviews,
    currentCardCount: cardCountRef.current,
    startSimulation,
    stopSimulation,
    simulateError,
    addSingleCard,
    reset: () => {
      stopSimulation();
      reset();
      mockDataGenerator.reset();
      cardCountRef.current = 0;
      setCurrentStageIndex(0);
    }
  };
};