import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  MessageSquare, 
  Target,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { useAnalysisSummary, useIsCompleted } from '../stores/realtimeAnalysisStore';

export const AnalysisSummaryCard: React.FC = () => {
  const summary = useAnalysisSummary();
  const isCompleted = useIsCompleted();

  if (!isCompleted || !summary) {
    return null;
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingIcon = (rating: number) => {
    if (rating >= 4) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (rating >= 3) return <BarChart3 className="w-5 h-5 text-yellow-600" />;
    return <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200"
    >
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-bold text-gray-800">분석 완료 - 최종 요약</h3>
      </div>

      {/* 핵심 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">{summary.totalReviews}</div>
          <div className="text-sm text-blue-700">총 리뷰 수</div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {getRatingIcon(summary.averageRating)}
            <Star className="w-6 h-6 text-yellow-500 fill-current" />
          </div>
          <div className={`text-2xl font-bold ${getRatingColor(summary.averageRating)}`}>
            {summary.averageRating}
          </div>
          <div className="text-sm text-gray-700">평균 평점</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">{summary.topKeywords.length}</div>
          <div className="text-sm text-purple-700">핵심 키워드</div>
        </div>
      </div>

      {/* 분석 요약 */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">📊 분석 요약</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 leading-relaxed">{summary.summary}</p>
        </div>
      </div>

      {/* 주요 키워드 */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">🔑 주요 키워드</h4>
        <div className="flex flex-wrap gap-2">
          {summary.topKeywords.slice(0, 8).map((keyword, index) => {
            const bgColor = keyword.sentiment === 'positive' 
              ? 'bg-green-100 text-green-800 border-green-200' 
              : keyword.sentiment === 'negative'
              ? 'bg-red-100 text-red-800 border-red-200'
              : 'bg-gray-100 text-gray-800 border-gray-200';
            
            return (
              <span
                key={index}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${bgColor}`}
              >
                #{keyword.word}
                <span className="text-xs opacity-75">({keyword.count})</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* 감정 트렌드 */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">📈 시간별 감정 변화</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-7 gap-2 text-xs">
            {summary.sentimentTrend.map((trend, index) => (
              <div key={index} className="text-center">
                <div className="text-gray-600 mb-1">{trend.time}</div>
                <div className="space-y-1">
                  <div className="h-2 bg-green-200 rounded relative">
                    <div 
                      className="h-full bg-green-500 rounded"
                      style={{ width: `${Math.max(10, (trend.positive / Math.max(...summary.sentimentTrend.map(t => t.positive))) * 100)}%` }}
                    />
                  </div>
                  <div className="h-2 bg-red-200 rounded relative">
                    <div 
                      className="h-full bg-red-500 rounded"
                      style={{ width: `${Math.max(10, (trend.negative / Math.max(...summary.sentimentTrend.map(t => t.negative))) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 bg-green-500 rounded"></div>
              <span>긍정</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 bg-red-500 rounded"></div>
              <span>부정</span>
            </div>
          </div>
        </div>
      </div>

      {/* 추천사항 */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">💡 추천사항</h4>
        <div className="space-y-2">
          {summary.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-blue-800 text-sm">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};