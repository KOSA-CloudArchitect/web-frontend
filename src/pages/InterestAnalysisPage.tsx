import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInterestStore } from '../stores/interestStore';
import { useInterestAnalysisStore } from '../stores/interestAnalysisStore';
import { SentimentPieChart } from '../components/charts/SentimentPieChart';
import { RatingDistributionChart } from '../components/charts/RatingDistributionChart';
import { SentimentTrendChart } from '../components/charts/SentimentTrendChart';
import { PriceHistoryChart } from '../components/charts/PriceHistoryChart';
import { AnalysisProgressIndicator } from '../components/AnalysisProgressIndicator';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { KeywordCloud } from '../components/KeywordCloud';

export const InterestAnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'sentiment' | 'rating' | 'trend' | 'price'>('overview');

  const { interests, fetchInterests } = useInterestStore();
  const {
    analysisData,
    analysisStatus,
    loading,
    error,
    fetchAnalysis,
    requestAnalysis,
    clearError
  } = useInterestAnalysisStore();

  const currentInterest = interests.find(interest => interest.id === id);

  useEffect(() => {
    if (!id) {
      navigate('/interests');
      return;
    }

    // 관심 상품 목록이 없으면 먼저 로드
    if (interests.length === 0) {
      fetchInterests();
    }

    // 분석 데이터 로드
    fetchAnalysis(id);
  }, [id, interests.length, fetchInterests, fetchAnalysis, navigate]);

  const handleRequestAnalysis = async () => {
    if (!id) return;

    const success = await requestAnalysis(id);
    if (success) {
      // WebSocket 연결 등 실시간 상태 업데이트 로직은 여기에 추가
      // 현재는 간단히 주기적으로 상태를 확인하는 방식으로 구현
    }
  };

  const handleRetry = () => {
    if (id) {
      clearError();
      fetchAnalysis(id);
    }
  };

  if (!currentInterest && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">관심 상품을 찾을 수 없습니다</h1>
            <p className="text-gray-600 mb-8">요청하신 관심 상품이 존재하지 않거나 삭제되었습니다.</p>
            <button
              onClick={() => navigate('/interests')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              관심 상품 목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !analysisData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: '개요', icon: '📊' },
    { id: 'sentiment', name: '감정 분석', icon: '😊' },
    { id: 'rating', name: '별점 분포', icon: '⭐' },
    { id: 'trend', name: '감정 추이', icon: '📈' },
    { id: 'price', name: '가격 변화', icon: '💰' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/interests')}
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                관심 상품 목록
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentInterest?.productName || '상품 분석'}
              </h1>
              <p className="mt-2 text-gray-600">
                관심 상품의 상세 분석 결과를 확인하세요.
              </p>
            </div>
            {!analysisData && !analysisStatus && (
              <button
                onClick={handleRequestAnalysis}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    분석 요청 중...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    분석 시작
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 상품 정보 카드 */}
        {currentInterest && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {currentInterest.imageUrl ? (
                  <img
                    src={currentInterest.imageUrl}
                    alt={currentInterest.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {currentInterest.productName}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {currentInterest.currentPrice && (
                    <div>
                      <span className="text-gray-500">현재 가격:</span>
                      <span className="ml-1 font-medium">
                        {currentInterest.currentPrice.toLocaleString()}원
                      </span>
                    </div>
                  )}
                  {currentInterest.rating && (
                    <div>
                      <span className="text-gray-500">평점:</span>
                      <span className="ml-1 font-medium">
                        {currentInterest.rating.toFixed(1)}점
                      </span>
                    </div>
                  )}
                  {currentInterest.reviewCount && (
                    <div>
                      <span className="text-gray-500">리뷰 수:</span>
                      <span className="ml-1 font-medium">
                        {currentInterest.reviewCount.toLocaleString()}개
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">등록일:</span>
                    <span className="ml-1 font-medium">
                      {new Date(currentInterest.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 분석 상태 표시 */}
        {analysisStatus && (
          <div className="mb-8">
            <AnalysisProgressIndicator status={analysisStatus} />
          </div>
        )}

        {/* 에러 표시 */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
                <button
                  onClick={handleRetry}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 분석 결과 */}
        {analysisData && (
          <>
            {/* 탭 네비게이션 */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* 탭 컨텐츠 */}
            <div className="space-y-8">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">감정 분석 결과</h3>
                    <SentimentPieChart data={analysisData.sentiment} />
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">리뷰 요약</h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        {analysisData.summary}
                      </p>
                    </div>
                    <div className="mt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-3">주요 키워드</h4>
                      <KeywordCloud
                        keywords={analysisData.keywords && Array.isArray(analysisData.keywords)
                          ? analysisData.keywords
                            .filter(keyword => typeof keyword === 'string' && keyword.trim().length > 0)
                            .map((keyword, index) => ({
                              text: keyword.trim(),
                              weight: Math.max(1, analysisData.keywords.length - index)
                            }))
                          : []
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sentiment' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">감정 분석 상세</h3>
                  <SentimentPieChart data={analysisData.sentiment} />
                </div>
              )}

              {activeTab === 'rating' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">별점 분포</h3>
                  <RatingDistributionChart data={analysisData.ratingDistribution} />
                </div>
              )}

              {activeTab === 'trend' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">감정 추이</h3>
                  <SentimentTrendChart data={analysisData.sentimentTrend} />
                </div>
              )}

              {activeTab === 'price' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">가격 변화</h3>
                  <PriceHistoryChart data={analysisData.priceHistory} />
                </div>
              )}
            </div>
          </>
        )}

        {/* 분석 데이터가 없고 진행 중이지도 않을 때 */}
        {!analysisData && !analysisStatus && !loading && !error && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">분석 데이터가 없습니다</h3>
            <p className="text-gray-500 mb-6">
              이 상품에 대한 분석을 시작하려면 분석 버튼을 클릭하세요.
            </p>
            <button
              onClick={handleRequestAnalysis}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              분석 시작
            </button>
          </div>
        )}
      </div>
    </div>
  );
};