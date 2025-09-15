'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useInterestStore } from '../../stores/interestStore';
import { InterestProduct, InterestAnalysisData } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { SentimentPieChart } from '../../components/charts/SentimentPieChart';
import { SentimentTrendChart } from '../../components/charts/SentimentTrendChart';
import { PriceHistoryChart } from '../../components/charts/PriceHistoryChart';
import { RatingDistributionChart } from '../../components/charts/RatingDistributionChart';
import { KeywordCloud } from '../../components/KeywordCloud';
import { interestAnalysisService } from '../../services/interestAnalysisService';

const ComparePage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { interests, fetchInterests } = useInterestStore();
  const [selectedProducts, setSelectedProducts] = useState<InterestProduct[]>([]);
  const [analysisDataMap, setAnalysisDataMap] = useState<Record<string, InterestAnalysisData>>({});
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'sentiment' | 'rating' | 'trend' | 'price'>('overview');

  useEffect(() => {
    const loadData = async () => {
      await fetchInterests();
      setLoading(false);
    };
    loadData();
  }, [fetchInterests]);

  useEffect(() => {
    if (!loading && interests.length > 0) {
      const selectedIds = searchParams.getAll('id');
      const products = interests.filter(interest => selectedIds.includes(interest.id));
      setSelectedProducts(products);

      // 선택된 상품들의 분석 데이터 로드
      loadAnalysisData(products);
    }
  }, [searchParams, interests, loading]);

  const loadAnalysisData = async (products: InterestProduct[]) => {
    setAnalysisLoading(true);
    const dataMap: Record<string, InterestAnalysisData> = {};

    try {
      const promises = products.map(async (product) => {
        try {
          const data = await interestAnalysisService.getAnalysis(product.id);
          if (data) {
            dataMap[product.id] = data;
          }
        } catch (error) {
          console.warn(`Failed to load analysis data for product ${product.id}:`, error);
        }
      });

      await Promise.all(promises);
      setAnalysisDataMap(dataMap);
    } catch (error) {
      console.error('Failed to load analysis data:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (selectedProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">상품 비교</h1>
            <p className="text-gray-600 mb-8">비교할 상품이 선택되지 않았습니다.</p>
            <button
              onClick={() => router.push('/interest')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              관심 상품으로 돌아가기
            </button>
          </div>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">상품 비교</h1>
              <p className="mt-2 text-gray-600">
                선택한 {selectedProducts.length}개 상품을 비교해보세요.
              </p>
            </div>
            <button
              onClick={() => router.push('/interest')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              돌아가기
            </button>
          </div>
        </div>

        {/* 로딩 상태 */}
        {analysisLoading && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center">
              <LoadingSpinner size="sm" className="mr-3" />
              <p className="text-blue-800">분석 데이터를 불러오는 중...</p>
            </div>
          </div>
        )}

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
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      항목
                    </th>
                    {selectedProducts.map((product) => (
                      <th key={product.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상품 {selectedProducts.indexOf(product) + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* 상품 이미지 */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      이미지
                    </td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="px-6 py-4 whitespace-nowrap">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.productName}
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
                      </td>
                    ))}
                  </tr>

                  {/* 상품명 */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      상품명
                    </td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs">
                          <p className="line-clamp-3">{product.productName}</p>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* 가격 */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      현재 가격
                    </td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.currentPrice ? (
                          <span className="font-bold text-lg">
                            {product.currentPrice.toLocaleString()}원
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* 평점 */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      평점
                    </td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.rating ? (
                          <div className="flex items-center space-x-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(product.rating!) ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="font-medium">{product.rating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* 리뷰 수 */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      리뷰 수
                    </td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.reviewCount ? (
                          <span>{product.reviewCount.toLocaleString()}개</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* 등록일 */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      등록일
                    </td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                    ))}
                  </tr>

                  {/* 마지막 분석일 */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      마지막 분석
                    </td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.lastAnalyzedAt ? (
                          new Date(product.lastAnalyzedAt).toLocaleDateString()
                        ) : (
                          <span className="text-gray-500">분석 안됨</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 감정 분석 탭 */}
        {activeTab === 'sentiment' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedProducts.map((product) => {
                const analysisData = analysisDataMap[product.id];
                return (
                  <div key={product.id} className="space-y-6">
                    {/* 감정 분석 차트 */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        상품 {selectedProducts.indexOf(product) + 1} - 감정 분석
                      </h3>
                      <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {product.productName}
                      </div>
                      {analysisData?.sentiment ? (
                        <SentimentPieChart data={analysisData.sentiment} />
                      ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                          분석 데이터가 없습니다
                        </div>
                      )}
                    </div>

                    {/* 키워드 클라우드 */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        상품 {selectedProducts.indexOf(product) + 1} - 주요 키워드
                      </h3>
                      {(() => {
                        const validKeywords = analysisData?.keywords && Array.isArray(analysisData.keywords) 
                          ? analysisData.keywords.filter(keyword => typeof keyword === 'string' && keyword.trim().length > 0)
                          : [];
                        
                        return validKeywords.length > 0 ? (
                          <KeywordCloud
                            keywords={validKeywords.map((keyword, index) => ({
                              text: keyword.trim(),
                              weight: Math.max(1, validKeywords.length - index)
                            }))}
                            height={200}
                            responsive={true}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-48 text-gray-500">
                            키워드 데이터가 없습니다
                          </div>
                        );
                      })()}
                    </div>

                    {/* 요약 */}
                    {analysisData?.summary && (
                      <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          상품 {selectedProducts.indexOf(product) + 1} - 리뷰 요약
                        </h3>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 leading-relaxed">
                            {analysisData.summary}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 별점 분포 탭 */}
        {activeTab === 'rating' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedProducts.map((product) => {
                const analysisData = analysisDataMap[product.id];
                return (
                  <div key={product.id} className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      상품 {selectedProducts.indexOf(product) + 1} - 별점 분포
                    </h3>
                    <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.productName}
                    </div>
                    {analysisData?.ratingDistribution ? (
                      <RatingDistributionChart data={analysisData.ratingDistribution} />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-500">
                        분석 데이터가 없습니다
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 감정 추이 탭 */}
        {activeTab === 'trend' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedProducts.map((product) => {
                const analysisData = analysisDataMap[product.id];
                return (
                  <div key={product.id} className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      상품 {selectedProducts.indexOf(product) + 1} - 감정 추이
                    </h3>
                    <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.productName}
                    </div>
                    {analysisData?.sentimentTrend ? (
                      <SentimentTrendChart data={analysisData.sentimentTrend} />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-500">
                        분석 데이터가 없습니다
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 가격 변화 탭 */}
        {activeTab === 'price' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedProducts.map((product) => {
                const analysisData = analysisDataMap[product.id];
                return (
                  <div key={product.id} className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      상품 {selectedProducts.indexOf(product) + 1} - 가격 변화
                    </h3>
                    <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.productName}
                    </div>
                    {analysisData?.priceHistory ? (
                      <PriceHistoryChart data={analysisData.priceHistory} />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-500">
                        분석 데이터가 없습니다
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="mt-8 flex justify-center space-x-4">
          {selectedProducts.map((product) => (
            <a
              key={product.id}
              href={product.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              상품 {selectedProducts.indexOf(product) + 1} 보기
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparePage;