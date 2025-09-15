import React from 'react';
import { motion } from 'framer-motion';
import { FinalSummary } from '../types/realtime';
import { Star, TrendingUp, TrendingDown, Minus, Clock, Hash, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

interface FinalSummaryViewProps {
  summary: FinalSummary;
  className?: string;
}

export const FinalSummaryView: React.FC<FinalSummaryViewProps> = ({ summary, className = '' }) => {
  // 전체 비율 계산
  const totalPercentage = summary.overall.pos + summary.overall.neg + summary.overall.neu;
  const normalizedOverall = totalPercentage > 0 ? {
    pos: Math.round((summary.overall.pos / totalPercentage) * 100),
    neg: Math.round((summary.overall.neg / totalPercentage) * 100),
    neu: Math.round((summary.overall.neu / totalPercentage) * 100)
  } : { pos: 0, neg: 0, neu: 0 };

  // 도넛 차트 데이터
  const doughnutData = {
    labels: ['긍정', '중립', '부정'],
    datasets: [
      {
        data: [normalizedOverall.pos, normalizedOverall.neu, normalizedOverall.neg],
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
        borderWidth: 0,
        cutout: '60%',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.parsed}%`,
        },
      },
    },
  };

  // 시간별 감정 변화 차트 데이터 (샘플)
  const timelineData = {
    labels: ['1주전', '6일전', '5일전', '4일전', '3일전', '2일전', '1일전', '오늘'],
    datasets: [
      {
        label: '긍정',
        data: [45, 48, 52, 49, 55, 58, 60, normalizedOverall.pos],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: '부정',
        data: [25, 28, 22, 26, 20, 18, 15, normalizedOverall.neg],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: '중립',
        data: [30, 24, 26, 25, 25, 24, 25, normalizedOverall.neu],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const timelineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  // 키워드를 긍정/부정으로 분류 (샘플 로직)
  const categorizeKeywords = () => {
    const positiveKeywords = [];
    const negativeKeywords = [];
    
    for (const keyword of summary.topKeywords.slice(0, 10)) {
      // 간단한 키워드 분류 로직 (실제로는 더 정교한 분석 필요)
      const positiveWords = ['좋', '만족', '품질', '빠른', '친절', '추천', '완벽'];
      const negativeWords = ['나쁜', '불만', '늦은', '부족', '실망', '문제', '최악'];
      
      const isPositive = positiveWords.some(word => keyword.key.includes(word));
      const isNegative = negativeWords.some(word => keyword.key.includes(word));
      
      if (isPositive) {
        positiveKeywords.push(keyword);
      } else if (isNegative) {
        negativeKeywords.push(keyword);
      } else {
        // 중립적인 키워드는 감정 비율에 따라 분류
        if (normalizedOverall.pos > normalizedOverall.neg) {
          positiveKeywords.push(keyword);
        } else {
          negativeKeywords.push(keyword);
        }
      }
    }
    
    return { positiveKeywords, negativeKeywords };
  };

  const { positiveKeywords, negativeKeywords } = categorizeKeywords();

  return (
    <motion.div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">감정 분포</h2>
        <p className="text-sm text-gray-600">
          실시간으로 관련된 리뷰를 분석한 감정을 요약한 결과입니다.
        </p>
      </div>

      {/* 메인 콘텐츠 - 2컬럼 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 왼쪽 컬럼 - 차트들 */}
        <div className="space-y-6">
          {/* 감정 분포 도넛 차트 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">감정 분포</h3>
            <div className="relative h-64">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              {/* 중앙 총점 표시 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round((normalizedOverall.pos - normalizedOverall.neg + 100) / 2)}점
                  </div>
                  <div className="text-sm text-gray-600">종합 점수</div>
                </div>
              </div>
            </div>
            
            {/* 감정 비율 레전드 */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">긍정</span>
                </div>
                <div className="text-lg font-bold text-green-600">{normalizedOverall.pos}%</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">중립</span>
                </div>
                <div className="text-lg font-bold text-amber-600">{normalizedOverall.neu}%</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">부정</span>
                </div>
                <div className="text-lg font-bold text-red-600">{normalizedOverall.neg}%</div>
              </div>
            </div>
          </div>

          {/* 감정 변화 추이 차트 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">감정 변화 추이</h3>
            <div className="h-48">
              <Line data={timelineData} options={timelineOptions} />
            </div>
          </div>
        </div>

        {/* 오른쪽 컬럼 - 인사이트 및 키워드 */}
        <div className="space-y-6">
          {/* 핵심 인사이트 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">핵심 인사이트</h3>
            <div className="space-y-2 text-sm text-gray-700">
              {summary.highlights?.map((highlight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{highlight}</span>
                </div>
              )) || [
                <div key="1" className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>전반적으로 긍정적인 반응을 보이고 있습니다.</span>
                </div>,
                <div key="2" className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>리뷰 품질과 서비스에 대한 만족도가 높습니다.</span>
                </div>
              ]}
            </div>
            
            {summary.insights && (
              <div className="mt-4 p-3 bg-white rounded border-l-4 border-blue-500">
                <p className="text-sm text-gray-800 whitespace-pre-line">
                  {summary.insights}
                </p>
              </div>
            )}
          </div>

          {/* 주요 키워드 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">주요 키워드</h3>
            
            {/* 좋은 키워드 */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-green-700 mb-2">좋은 키워드</h4>
              <div className="flex flex-wrap gap-2">
                {positiveKeywords.map((keyword, index) => (
                  <span
                    key={`pos-${keyword.key}`}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200"
                  >
                    {keyword.key}
                  </span>
                ))}
                {positiveKeywords.length === 0 && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">
                    품질
                  </span>
                )}
              </div>
            </div>

            {/* 개선 필요 키워드 */}
            <div>
              <h4 className="text-sm font-medium text-red-700 mb-2">개선 필요 키워드</h4>
              <div className="flex flex-wrap gap-2">
                {negativeKeywords.map((keyword, index) => (
                  <span
                    key={`neg-${keyword.key}`}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium border border-red-200"
                  >
                    {keyword.key}
                  </span>
                ))}
                {negativeKeywords.length === 0 && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium border border-red-200">
                    배송
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 추천 액션 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">추천 액션</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>긍정적인 키워드들을 활용한 마케팅 강화</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>중립 고객을 긍정으로 전환하는 서비스 개선</span>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>부정적인 피드백에 대한 즉각적인 대응 필요</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 통계 */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600 mb-1">전체 리뷰</div>
            <div className="text-xl font-bold text-blue-600">
              {summary.rawCount?.toLocaleString() || '0'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">긍정</div>
            <div className="text-xl font-bold text-green-600">
              {Math.round((summary.rawCount || 0) * normalizedOverall.pos / 100).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">중립</div>
            <div className="text-xl font-bold text-amber-600">
              {Math.round((summary.rawCount || 0) * normalizedOverall.neu / 100).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">부정</div>
            <div className="text-xl font-bold text-red-600">
              {Math.round((summary.rawCount || 0) * normalizedOverall.neg / 100).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};