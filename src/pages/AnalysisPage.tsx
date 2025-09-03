import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import BottomBar from '../components/BottomBar';

interface AnalysisStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'queued' | 'running' | 'success';
  progress?: number;
  estimatedTime?: number;
  error?: string;
  dagId?: string;
  dagRunId?: string;
  tasks?: Array<{
    taskId: string;
    state: string;
    startDate?: string;
    endDate?: string;
    duration?: number;
  }>;
}

interface AnalysisResult {
  productId: string;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  summary: string;
  keywords: string[];
  totalReviews: number;
}

const AnalysisPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // URL 파라미터에서 분석 정보 추출
  const taskId = searchParams.get('taskId');
  const dagRunId = searchParams.get('dagRunId');
  const dagId = searchParams.get('dagId');
  const initialStatus = searchParams.get('status');

  if (!productId) {
    return (
      <>
        <NavBar title="분석 결과" />
        <div className="max-w-2xl mx-auto p-4 bg-gray-100 min-h-screen pt-16 pb-24">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h1 className="text-xl font-bold text-red-600 mb-4">오류</h1>
            <p className="text-gray-600 mb-4">상품 ID가 필요합니다.</p>
            <button
              onClick={() => navigate('/search')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              검색 페이지로 돌아가기
            </button>
          </div>
        </div>
        <BottomBar />
      </>
    );
  }

  // Redis 기반 분석 상태 확인 함수
  const checkRedisAnalysisStatus = async () => {
    if (!taskId) {
      console.log('Task ID가 없어 기존 방식으로 상태 확인');
      return checkAnalysisStatus();
    }

    try {
      const response = await fetch(`/api/analyze/redis/status/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const status: AnalysisStatus = {
            status: data.status,
            progress: data.progress || 0,
            dagId: data.dagId,
            dagRunId: data.dagRunId,
            estimatedTime: data.queueInfo?.estimatedCompletion ? 
              Math.ceil((new Date(data.queueInfo.estimatedCompletion).getTime() - Date.now()) / 1000) : 
              undefined,
          };
          
          setAnalysisStatus(status);
          
          if (status.status === 'completed') {
            await fetchAnalysisResult();
          } else if (status.status === 'failed') {
            setError(data.errorMessage || '분석에 실패했습니다.');
          }
        }
      } else if (response.status === 404) {
        setError('분석 요청을 찾을 수 없습니다.');
      } else {
        throw new Error('분석 상태 확인 실패');
      }
    } catch (err) {
      console.error('Redis 분석 상태 확인 중 오류:', err);
      setError('분석 상태를 확인할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 기존 분석 상태 확인 함수 (fallback)
  const checkAnalysisStatus = async () => {
    try {
      const response = await fetch(`/api/analyze/status/${productId}`);
      if (response.ok) {
        const status = await response.json();
        setAnalysisStatus(status);
        
        if (status.status === 'completed') {
          await fetchAnalysisResult();
        } else if (status.status === 'failed') {
          setError(status.error || '분석에 실패했습니다.');
        }
      } else if (response.status === 404) {
        setAnalysisStatus(null);
      } else {
        throw new Error('상태 확인 실패');
      }
    } catch (err) {
      console.error('분석 상태 확인 중 오류:', err);
      setError('분석 상태를 확인할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 분석 결과 조회 함수 (MongoDB에서)
  const fetchAnalysisResult = async () => {
    try {
      // MongoDB에서 분석 결과 조회
      const response = await fetch(`/api/analyze/result/mongo/${productId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.result) {
          setAnalysisResult(data.result);
          return;
        }
      }
      
      // MongoDB에서 찾을 수 없으면 기존 방식으로 시도
      const fallbackResponse = await fetch(`/api/analyze/result/${productId}`);
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.success && fallbackData.result) {
          setAnalysisResult(fallbackData.result);
        }
      }
    } catch (err) {
      console.error('분석 결과 조회 중 오류:', err);
    }
  };

  // 분석 시작 함수
  const startAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('분석 시작 성공:', data);
        // 상태 폴링 시작
        const interval = pollRedisAnalysisStatus();
        
        // 컴포넌트 언마운트 시 정리를 위해 저장
        return () => {
          if (interval) clearInterval(interval);
        };
      } else {
        let errorMessage = '분석 시작에 실패했습니다.';
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // ignore JSON parse error
        }
        setError(errorMessage);
      }
    } catch (err) {
      console.error('분석 시작 중 오류:', err);
      setError('분석 시작 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Redis 기반 분석 상태 폴링
  const pollRedisAnalysisStatus = () => {
    const interval = setInterval(async () => {
      try {
        if (taskId) {
          const response = await fetch(`/api/analyze/redis/status/${taskId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              const status: AnalysisStatus = {
                status: data.status,
                progress: data.progress || 0,
                dagId: data.dagId,
                dagRunId: data.dagRunId,
                estimatedTime: data.queueInfo?.estimatedCompletion ? 
                  Math.ceil((new Date(data.queueInfo.estimatedCompletion).getTime() - Date.now()) / 1000) : 
                  undefined,
              };
              
              setAnalysisStatus(status);
              
              if (status.status === 'completed') {
                clearInterval(interval);
                await fetchAnalysisResult();
              } else if (status.status === 'failed') {
                clearInterval(interval);
                setError(data.errorMessage || '분석에 실패했습니다.');
              }
            }
          }
        } else {
          // Task ID가 없으면 기존 방식으로 폴링
          const response = await fetch(`/api/analyze/status/${productId}`);
          if (response.ok) {
            const status = await response.json();
            setAnalysisStatus(status);
            
            if (status.status === 'completed') {
              clearInterval(interval);
              await fetchAnalysisResult();
            } else if (status.status === 'failed') {
              clearInterval(interval);
              setError(status.error || '분석에 실패했습니다.');
            }
          }
        }
      } catch (err) {
        console.error('상태 폴링 중 오류:', err);
      }
    }, 5000); // 5초마다 상태 확인

    // 10분 후 폴링 중단
    setTimeout(() => {
      clearInterval(interval);
    }, 600000);
    
    return interval;
  };

  // 컴포넌트 마운트 시 분석 상태 확인
  useEffect(() => {
    // Task ID가 있으면 Redis 방식으로, 없으면 기존 방식으로 상태 확인
    if (taskId) {
      checkRedisAnalysisStatus();
      // Redis 상태 폴링 시작
      const interval = pollRedisAnalysisStatus();
      
      // 컴포넌트 언마운트 시 인터벌 정리
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      checkAnalysisStatus();
    }
  }, [productId, taskId]);

  return (
    <>
      <NavBar title="분석 결과" />
      <div className="max-w-2xl mx-auto p-4 bg-gray-100 min-h-screen pt-16 pb-24">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-xl font-bold mb-4">상품 분석</h1>
          <p className="text-sm text-gray-600 mb-6">상품 ID: {productId}</p>
          
          {loading ? (
            <div className="flex flex-col items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">분석 상태를 확인하고 있습니다...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  checkAnalysisStatus();
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                다시 시도
              </button>
            </div>
          ) : analysisResult ? (
            // 분석 결과 표시
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-green-800 mb-2">✅ 분석 완료</h2>
                <p className="text-sm text-green-600">총 {analysisResult.totalReviews}개의 리뷰를 분석했습니다.</p>
              </div>

              {/* 감성 분석 결과 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">감성 분석</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">긍정</span>
                    <span className="font-semibold">{(analysisResult.sentiment.positive * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${analysisResult.sentiment.positive * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-red-600">부정</span>
                    <span className="font-semibold">{(analysisResult.sentiment.negative * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${analysisResult.sentiment.negative * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">중립</span>
                    <span className="font-semibold">{(analysisResult.sentiment.neutral * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-500 h-2 rounded-full" 
                      style={{ width: `${analysisResult.sentiment.neutral * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* 요약 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">리뷰 요약</h3>
                <p className="text-gray-700 leading-relaxed">{analysisResult.summary}</p>
              </div>

              {/* 키워드 */}
              {analysisResult.keywords && analysisResult.keywords.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">주요 키워드</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.keywords.map((keyword, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/search')}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  검색으로 돌아가기
                </button>
                <button
                  onClick={() => {
                    setAnalysisResult(null);
                    setAnalysisStatus(null);
                    startAnalysis();
                  }}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  다시 분석하기
                </button>
              </div>
            </div>
          ) : analysisStatus ? (
            // 분석 진행 중
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4 mx-auto"></div>
              <h2 className="text-lg font-semibold mb-2">
                {analysisStatus.status === 'pending' ? '분석 대기 중...' : 
                 analysisStatus.status === 'processing' ? '분석 진행 중...' : '분석 중...'}
              </h2>
              {analysisStatus.progress !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${analysisStatus.progress}%` }}
                  ></div>
                </div>
              )}
              {analysisStatus.estimatedTime && (
                <p className="text-sm text-gray-600">예상 완료 시간: 약 {analysisStatus.estimatedTime}초</p>
              )}
            </div>
          ) : (
            // 분석 시작 전
            <div className="text-center py-8">
              <h2 className="text-lg font-semibold mb-4">리뷰 분석을 시작하시겠습니까?</h2>
              <p className="text-gray-600 mb-6">이 상품의 리뷰를 분석하여 감성 분석 결과와 요약을 제공합니다.</p>
              <button
                onClick={startAnalysis}
                disabled={loading}
                className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                분석 시작하기
              </button>
            </div>
          )}
        </div>
      </div>
      <BottomBar />
    </>
  );
};

export default AnalysisPage;