'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/common/Card';
import { useWebSocket } from '@/hooks/useWebSocket';
import { AnalysisService } from '@/services/analysisService';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BarChart3,
  TrendingUp,
  MessageSquare,
  Star
} from 'lucide-react';

interface AnalysisStatus {
  status: 'pending' | 'running' | 'success' | 'failed';
  progress: number;
  message: string;
  result?: any;
}

export default function AnalysisPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = params.productId as string;
  
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>({
    status: 'pending',
    progress: 0,
    message: '분석을 시작합니다...'
  });
  const [isPolling, setIsPolling] = useState(false);

  const taskId = searchParams.get('taskId');
  const dagRunId = searchParams.get('dagRunId');
  const dagId = searchParams.get('dagId');

  // 웹소켓 연결
  const { isConnected, connectionError } = useWebSocket({
    productId,
    onRealtimeUpdate: (data) => {
      setAnalysisStatus({
        status: data.status as any,
        progress: data.progress,
        message: data.message,
        result: data.result
      });
    },
    autoConnect: true
  });

  // 분석 상태 폴링
  useEffect(() => {
    if (!taskId && !dagRunId) {
      setAnalysisStatus({
        status: 'failed',
        progress: 0,
        message: '분석 작업 ID가 없습니다.'
      });
      return;
    }

    const startAnalysis = async () => {
      try {
        setAnalysisStatus({
          status: 'running',
          progress: 10,
          message: '상품 정보를 수집하고 있습니다...'
        });

        // 분석 상태 폴링 시작
        setIsPolling(true);
        pollAnalysisStatus();
      } catch (error) {
        console.error('분석 시작 오류:', error);
        setAnalysisStatus({
          status: 'failed',
          progress: 0,
          message: '분석을 시작할 수 없습니다.'
        });
      }
    };

    startAnalysis();
  }, [taskId, dagRunId, dagId]);

  const pollAnalysisStatus = async () => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/analyze/status?taskId=${taskId}&dagRunId=${dagRunId}`);
        const data = await response.json();

        if (data.success) {
          const status = data.data.status;
          const progress = data.data.progress || 0;
          const message = data.data.message || '분석 중...';

          setAnalysisStatus({
            status: status,
            progress: progress,
            message: message,
            result: data.data.result
          });

          if (status === 'success' || status === 'failed') {
            clearInterval(pollInterval);
            setIsPolling(false);
          }
        } else {
          console.error('상태 조회 실패:', data.message);
        }
      } catch (error) {
        console.error('상태 폴링 오류:', error);
        clearInterval(pollInterval);
        setIsPolling(false);
        setAnalysisStatus(prev => ({
          ...prev,
          status: 'failed',
          message: '상태 확인 중 오류가 발생했습니다.'
        }));
      }
    }, 2000); // 2초마다 폴링

    // 5분 후 타임아웃
    setTimeout(() => {
      clearInterval(pollInterval);
      setIsPolling(false);
      if (analysisStatus.status === 'running') {
        setAnalysisStatus(prev => ({
          ...prev,
          status: 'failed',
          message: '분석 시간이 초과되었습니다.'
        }));
      }
    }, 300000);
  };

  const getStatusIcon = () => {
    switch (analysisStatus.status) {
      case 'pending':
        return <Clock className="w-8 h-8 text-yellow-500" />;
      case 'running':
        return <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'failed':
        return <XCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Clock className="w-8 h-8 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (analysisStatus.status) {
      case 'pending':
        return 'text-yellow-600';
      case 'running':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              상품 리뷰 분석
            </h1>
            <p className="text-gray-600">
              상품 ID: {productId}
            </p>
          </div>

          {/* 분석 상태 카드 */}
          <Card className="p-8 mb-8">
            <div className="text-center">
              <div className="mb-6">
                {getStatusIcon()}
              </div>
              
              <h2 className={`text-2xl font-semibold mb-4 ${getStatusColor()}`}>
                {analysisStatus.status === 'pending' && '분석 대기 중'}
                {analysisStatus.status === 'running' && '분석 진행 중'}
                {analysisStatus.status === 'success' && '분석 완료'}
                {analysisStatus.status === 'failed' && '분석 실패'}
              </h2>

              <p className="text-gray-600 mb-6">
                {analysisStatus.message}
              </p>

              {/* 진행률 바 */}
              {analysisStatus.status === 'running' && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analysisStatus.progress}%` }}
                  ></div>
                </div>
              )}

              <div className="text-sm text-gray-500">
                진행률: {analysisStatus.progress}%
              </div>
            </div>
          </Card>

          {/* 분석 결과 */}
          {analysisStatus.status === 'success' && analysisStatus.result && (
            <div className="space-y-6">
              {/* 요약 카드 */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  분석 요약
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analysisStatus.result.positive_percentage || 0}%
                    </div>
                    <div className="text-sm text-gray-600">긍정 리뷰</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {analysisStatus.result.negative_percentage || 0}%
                    </div>
                    <div className="text-sm text-gray-600">부정 리뷰</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisStatus.result.total_reviews || 0}
                    </div>
                    <div className="text-sm text-gray-600">총 리뷰 수</div>
                  </div>
                </div>
              </Card>

              {/* 키워드 분석 */}
              {analysisStatus.result.keywords && (
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    주요 키워드
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisStatus.result.keywords.map((keyword: any, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* 리뷰 요약 */}
              {analysisStatus.result.summary && (
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    리뷰 요약
                  </h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {analysisStatus.result.summary}
                    </p>
                  </div>
                </Card>
              )}

              {/* 결과 보기 버튼 */}
              <div className="text-center">
                <button
                  onClick={() => {
                    window.location.href = `/analysis-result/${productId}`;
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  상세 결과 보기
                </button>
              </div>
            </div>
          )}

          {/* 실패 시 재시도 버튼 */}
          {analysisStatus.status === 'failed' && (
            <div className="text-center">
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
