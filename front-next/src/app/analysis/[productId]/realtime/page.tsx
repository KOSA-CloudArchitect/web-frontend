'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, RotateCcw, Wifi, WifiOff, ArrowLeft, AlertTriangle, CheckCircle, Star, Heart, ExternalLink } from 'lucide-react';
import { RealtimeEmotionCards } from '../../../../components/RealtimeEmotionCards';
import { RealtimeAnalysisChart } from '../../../../components/RealtimeAnalysisChart';
import { RealtimeProgressIndicator } from '../../../../components/RealtimeProgressIndicator';
import { useRealtimeAnalysis } from '../../../../hooks/useRealtimeAnalysis';
import { FinalSummaryView } from '../../../../components/FinalSummaryView';
import NavBar from '../../../../components/NavBar';
import BottomBar from '../../../../components/BottomBar';
import Link from 'next/link';
import { apiService } from '../../../../services/api';
import { HeartButton } from '../../../../components/HeartButton';

interface ProductInfo {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  category?: string;
  url?: string;
}

export default function RealtimeAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.productId as string;
  
  const [showCompletionToast, setShowCompletionToast] = useState(false);
  const [startingAnalysis, setStartingAnalysis] = useState(false);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  
  const { 
    connection,
    progress,
    emotionCards,
    chartData,
    finalSummary,
    error,
    start,
    stop,
    reconnect
  } = useRealtimeAnalysis({
    productId,
    autoConnect: true
  });

  // 상품 정보 가져오기
  useEffect(() => {
    const fetchProductInfo = async () => {
      if (!productId) return;
      
      try {
        setLoadingProduct(true);
        
        // 먼저 캐시된 상품 정보를 확인
        const response = await apiService.get(`/api/products?q=${encodeURIComponent(productId)}&page=1&page_size=1`);
        
        if (response.success && response.data?.products?.length > 0) {
          const product = response.data.products[0];
          setProductInfo({
            id: product.id || productId,
            name: product.name || `상품 ${productId}`,
            price: product.price || 0,
            originalPrice: product.original_price,
            rating: product.rating || 0,
            reviewCount: product.review_count || 0,
            imageUrl: product.image_url || '/placeholder-product.png',
            category: product.category || '전자제품',
            url: product.url
          });
        } else {
          // 기본 상품 정보
          setProductInfo({
            id: productId,
            name: `상품 ${productId}`,
            price: 0,
            rating: 0,
            reviewCount: 0,
            imageUrl: '/placeholder-product.png',
            category: '전자제품'
          });
        }
      } catch (error) {
        console.error('상품 정보 가져오기 실패:', error);
        // 기본 상품 정보
        setProductInfo({
          id: productId,
          name: `상품 ${productId}`,
          price: 0,
          rating: 0,
          reviewCount: 0,
          imageUrl: '/placeholder-product.png',
          category: '전자제품'
        });
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProductInfo();
  }, [productId]);

  // 분석 시작 함수
  const handleStartAnalysis = async () => {
    if (startingAnalysis) return;

    try {
      setStartingAnalysis(true);
      
      // job_id 생성 (현재 시간 기반)
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      // 분석 요청 API 호출
      const response = await apiService.post('/api/analyze', {
        product_id: productId,
        url: productInfo?.url || `https://www.coupang.com/products/${productId}`,
        job_id: jobId,
        review_cnt: 0, // 초기값
        source: 'realtime_page'
      });

      if (response.success) {
        console.log(`✅ 분석 요청 성공 (job_id: ${jobId}), WebSocket 연결 시작`);
        start(); // WebSocket 연결 시작
      } else {
        throw new Error(response.message || '분석 요청에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('❌ 분석 시작 실패:', error);
    } finally {
      setStartingAnalysis(false);
    }
  };

  // 가격 포맷팅
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // 할인율 계산
  const getDiscountRate = (originalPrice: number, currentPrice: number): number => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  // 별점 렌더링
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-4 h-4 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  // 분석 중지
  const handleStopAnalysis = () => {
    stop();
    setShowFinalSummary(false);
  };

  // 초기화
  const handleReset = () => {
    stop();
    setShowCompletionToast(false);
    setShowFinalSummary(false);
  };

  // 최종 분석 결과 도착 시 처리
  useEffect(() => {
    if (finalSummary && !showFinalSummary) {
      setShowFinalSummary(true);
      setShowCompletionToast(true);
    }
  }, [finalSummary, showFinalSummary]);

  const isConnected = connection === 'open';
  const isConnecting = connection === 'connecting';
  const hasError = connection === 'error' || !!error;

  if (!productId) {
    return (
      <>
        <NavBar title="분석" />
        <div className="min-h-screen bg-gray-50 p-6 pt-20 pb-24 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">상품 정보를 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-4">올바른 상품 ID가 필요합니다.</p>
            <Link 
              href="/search" 
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              검색으로 돌아가기
            </Link>
          </div>
        </div>
        <BottomBar />
      </>
    );
  }

  return (
    <>
      <NavBar title="실시간 분석" />
      <div className="min-h-screen bg-gray-50 p-4 pt-20 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Link 
                href={`/result?id=${productId}`}
                className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                실시간 리뷰 분석
              </h1>
            </div>
            <p className="text-gray-600 text-sm">
              상품 ID: {productId} | 실시간으로 리뷰를 분석하고 감정 카드를 생성합니다.
            </p>
          </div>

          {/* 상품 정보 섹션 */}
          {loadingProduct ? (
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 h-48 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                </div>
              </div>
            </motion.div>
          ) : productInfo && (
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* 상품 이미지 */}
                <div className="w-full md:w-48 h-48 flex-shrink-0">
                  <img
                    src={productInfo.imageUrl}
                    alt={productInfo.name}
                    className="w-full h-full object-cover rounded-lg bg-gray-50"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-product.png';
                    }}
                  />
                </div>

                {/* 상품 정보 */}
                <div className="flex-1 space-y-4">
                  {/* 카테고리 */}
                  {productInfo.category && (
                    <span className="inline-block text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {productInfo.category}
                    </span>
                  )}

                  {/* 상품명 */}
                  <h2 className="text-xl font-bold text-gray-900 line-clamp-2">
                    {productInfo.name}
                  </h2>

                  {/* 평점 및 리뷰 수 */}
                  {productInfo.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {renderStars(productInfo.rating)}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {productInfo.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({productInfo.reviewCount.toLocaleString()}개 상품평)
                      </span>
                    </div>
                  )}

                  {/* 가격 정보 */}
                  <div className="space-y-2">
                    {productInfo.originalPrice && productInfo.originalPrice > productInfo.price && (
                      <div className="flex items-center gap-2">
                        <span className="text-red-500 font-bold text-sm bg-red-100 px-2 py-1 rounded">
                          {getDiscountRate(productInfo.originalPrice, productInfo.price)}% 할인
                        </span>
                        <span className="text-gray-400 line-through text-sm">
                          {formatPrice(productInfo.originalPrice)}원
                        </span>
                      </div>
                    )}
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(productInfo.price)}원
                    </div>
                    {productInfo.price > 0 && (
                      <div className="text-sm text-blue-600">무료배송</div>
                    )}
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    {/* 관심상품 등록 */}
                    <div className="flex-shrink-0">
                      <HeartButton 
                        product={{
                          id: productInfo.id,
                          name: productInfo.name,
                          url: productInfo.url || `https://www.coupang.com/products/${productInfo.id}`,
                          image_url: productInfo.imageUrl,
                          price: productInfo.price,
                          rating: productInfo.rating,
                          review_count: productInfo.reviewCount
                        }} 
                        size="md" 
                      />
                    </div>

                    {/* 구매하러 가기 */}
                    {productInfo.url && (
                      <a
                        href={productInfo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        구매하러 가기
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 에러 표시 */}
          {hasError && (
            <motion.div 
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium text-sm">
                  {error || '연결에 오류가 발생했습니다.'}
                </span>
                <button
                  onClick={reconnect}
                  className="ml-auto text-red-600 hover:text-red-800 underline text-sm"
                >
                  재연결
                </button>
              </div>
            </motion.div>
          )}

          {/* 최종 분석 완료 알림 */}
          <AnimatePresence>
            {showFinalSummary && finalSummary && (
              <motion.div
                className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    최종 분석이 완료되었습니다! 아래에서 결과를 확인하세요.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 컨트롤 패널 */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">분석 컨트롤</h2>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={handleStartAnalysis}
                disabled={startingAnalysis || isConnected}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  startingAnalysis || isConnected
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                <Play className="w-4 h-4" />
                {startingAnalysis ? '분석 요청 중...' : '분석 시작'}
              </button>

              <button
                onClick={handleStopAnalysis}
                disabled={!isConnected && !isConnecting}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  !isConnected && !isConnecting
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                <Square className="w-4 h-4" />
                분석 중지
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-500 text-white hover:bg-gray-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                초기화
              </button>
            </div>

            {/* 상태 표시 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">WebSocket</div>
                <div className={`flex items-center gap-2 font-semibold text-sm ${
                  isConnected ? 'text-green-600' : 
                  isConnecting ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {isConnected ? <Wifi className="w-4 h-4" /> : 
                   isConnecting ? <Wifi className="w-4 h-4 animate-pulse" /> :
                   <WifiOff className="w-4 h-4" />}
                  {isConnected ? '연결됨' : 
                   isConnecting ? '연결 중...' : '연결 끊김'}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">분석 진행률</div>
                <div className={`font-semibold text-sm ${progress >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                  {progress >= 100 ? '완료' : `${Math.round(progress)}%`}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">감정 카드</div>
                <div className="font-semibold text-sm text-purple-600">
                  {emotionCards.length}개 수신
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">최종 분석</div>
                <div className={`font-semibold text-sm ${finalSummary ? 'text-green-600' : 'text-gray-600'}`}>
                  {finalSummary ? '완료' : '대기 중'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* 최종 분석 결과 (우선 표시) */}
          <AnimatePresence>
            {showFinalSummary && finalSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <FinalSummaryView summary={finalSummary} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 실시간 스트림 영역 */}
          {!showFinalSummary && (
            <>
              {/* 진행률 표시 */}
              {(isConnected || isConnecting) && (
                <motion.div 
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <RealtimeProgressIndicator />
                </motion.div>
              )}

              {/* 실시간 UI 카드들 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <RealtimeAnalysisChart />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <RealtimeEmotionCards />
                </motion.div>
              </div>
            </>
          )}

          {/* 완료 토스트 */}
          {showCompletionToast && (
            <motion.div
              className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>상품 {productId}의 리뷰 분석이 완료되었습니다!</span>
                <button
                  onClick={() => setShowCompletionToast(false)}
                  className="ml-2 text-green-200 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <BottomBar />
    </>
  );
}