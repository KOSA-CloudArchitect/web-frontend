'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { SentimentChart } from '@/components/SentimentChart';
import { SummaryCard } from '@/components/SummaryCard';
import { KeywordCloud } from '@/components/KeywordCloud';
import { ReviewList } from '@/components/ReviewList';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { 
  SkeletonChart, 
  SkeletonSummaryCard, 
  SkeletonWordCloud, 
  SkeletonReviewList 
} from '@/components/SkeletonLoader';
import NavBar from '@/components/NavBar';
import BottomBar from '@/components/BottomBar';
import { normalizeKeywords } from '@/utils/keywordUtils';
import { collectErrorInfo, reportError, classifyError, getUserFriendlyMessage } from '@/utils/errorUtils';
import { Download } from 'lucide-react';

// Analysis store hooks - These would need to be implemented in Next.js context
import { useAnalysisData, useAnalysisLoading, useAnalysisError, useAnalysisActions } from '@/stores/analysisStore';
import { AnalysisService } from '@/services/analysisService';

export default function AnalysisResultPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = params.productId as string;
  
  const loading = useAnalysisLoading();
  const data = useAnalysisData();
  const error = useAnalysisError();
  const { setLoading, setData, setError, reset } = useAnalysisActions();
  const [productUrl, setProductUrl] = useState<string>('');
  const [loadingStage, setLoadingStage] = useState<'fetching' | 'analyzing' | 'processing' | 'finalizing'>('fetching');
  const [progress, setProgress] = useState<number>(0);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

  useEffect(() => {
    if (!productId) {
      router.push('/');
      return;
    }

    // URL에서 productUrl 파라미터 가져오기
    const url = searchParams.get('url');
    if (url) {
      setProductUrl(url);
      handleAnalyze(url);
    }
  }, [productId, searchParams, router]);

  const handleAnalyze = async (url: string) => {
    if (!url.trim()) {
      const errorInfo = collectErrorInfo('상품 URL을 입력해주세요.', { context: 'validation' });
      setError(errorInfo.message);
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);
    setEstimatedTime(30); // 예상 30초

    try {
      // 단계별 로딩 시뮬레이션
      setLoadingStage('fetching');
      setProgress(10);
      
      // 실제 API 호출
      const result = await AnalysisService.analyzeProduct(url);
      
      // 성공 시 단계별 진행
      setLoadingStage('analyzing');
      setProgress(40);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoadingStage('processing');
      setProgress(70);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoadingStage('finalizing');
      setProgress(90);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setProgress(100);
      setData(result);
    } catch (err) {
      const errorType = classifyError(err as Error);
      const userMessage = getUserFriendlyMessage(err as Error, errorType);
      
      // 에러 리포팅
      const errorInfo = collectErrorInfo(err as Error, {
        context: 'analysis_request',
        productUrl: url,
      });
      reportError(errorInfo);
      
      setError(userMessage);
    }
  };

  const handleRetry = () => {
    if (productUrl) {
      handleAnalyze(productUrl);
    }
  };

  const handleShare = async () => {
    if (navigator.share && data) {
      try {
        await navigator.share({
          title: `${data.productName} 리뷰 분석 결과`,
          text: `긍정: ${data.positiveRatio.toFixed(1)}%, 부정: ${data.negativeRatio.toFixed(1)}%`,
          url: window.location.href,
        });
      } catch (err) {
        // 공유 실패 시 URL 복사
        navigator.clipboard.writeText(window.location.href);
        alert('링크가 클립보드에 복사되었습니다.');
      }
    } else {
      // Web Share API 미지원 시 URL 복사
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다.');
    }
  };

  const handleDownload = () => {
    if (!data) return;

    const content = `
${data.productName} 리뷰 분석 결과

총 리뷰 수: ${data.totalReviews.toLocaleString()}개
평균 평점: ${data.averageRating.toFixed(1)}점
긍정 비율: ${data.positiveRatio.toFixed(1)}%
부정 비율: ${data.negativeRatio.toFixed(1)}%

AI 요약:
${data.summary}

주요 키워드:
${data.keywords.map(keyword => `#${keyword}`).join(', ')}

분석 일시: ${new Date().toLocaleString('ko-KR')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.productName}_리뷰분석.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <NavBar title="리뷰 분석 결과" />
      <div className="min-h-screen bg-gray-100 pt-16 pb-24">
        {/* 다운로드 버튼 */}
        {data && (
          <div className="max-w-2xl mx-auto px-4 pt-4">
            <div className="flex justify-end">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                결과 다운로드
              </button>
            </div>
          </div>
        )}

        {/* 로딩 오버레이 */}
        <LoadingOverlay
          isVisible={loading}
          stage={loadingStage}
          progress={progress}
          estimatedTime={estimatedTime || undefined}
        />

        {/* 메인 콘텐츠 */}
        <main className="max-w-2xl mx-auto px-4 py-4">
        {loading && (
          <div className="space-y-6">
            <SkeletonChart />
            <SkeletonSummaryCard />
            <SkeletonWordCloud />
            <SkeletonReviewList />
          </div>
        )}

        {error && (
          <ErrorMessage 
            message={error} 
            type={classifyError(error)}
            onRetry={handleRetry}
            showHomeButton={true}
            showSupportButton={true}
          />
        )}

        {data && !loading && !error && (
          <div className="space-y-6">
            {/* 도넛 차트 */}
            <SentimentChart
              positiveRatio={data.positiveRatio}
              negativeRatio={data.negativeRatio}
              totalReviews={data.totalReviews}
            />

            {/* 요약 카드 */}
            <SummaryCard
              summary={data.summary}
              keywords={data.keywords}
              averageRating={data.averageRating}
              productName={data.productName}
            />

            {/* 키워드 워드클라우드 */}
            <KeywordCloud
              keywords={normalizeKeywords(data.keywordData || data.keywords)}
              width={400}
              height={300}
              className="w-full"
            />

            {/* 상세 리뷰 리스트 */}
            {data.reviews && data.reviews.length > 0 && (
              <ReviewList
                reviews={data.reviews}
                keywords={data.keywords}
              />
            )}
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && !error && !data && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-gray-500 text-lg mb-4">분석할 상품을 선택해주세요.</div>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              상품 검색하기
            </button>
          </div>
        )}
        </main>
      </div>
      <BottomBar />
    </>
  );
}
