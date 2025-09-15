import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmotionCards } from '../stores/realtimeAnalysisStore';
import { Heart, Frown, Meh, Clock } from 'lucide-react';

export const RealtimeEmotionCards: React.FC = () => {
  const emotionCards = useEmotionCards();

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Heart className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <Frown className="w-4 h-4 text-red-600" />;
      case 'neutral':
        return <Meh className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '긍정';
      case 'negative':
        return '부정';
      case 'neutral':
        return '중립';
      default:
        return '분석중';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  if (emotionCards.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">실시간 감정 분석</h3>
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>분석 결과를 기다리는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        실시간 감정 분석
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({emotionCards.length}개 분석됨)
        </span>
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence initial={false}>
          {emotionCards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`p-4 rounded-lg border-2 ${card.color} transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getSentimentIcon(card.sentiment)}
                  <span className="font-medium text-sm">
                    {getSentimentLabel(card.sentiment)}
                  </span>
                  <span className="text-xs opacity-75">
                    ({Math.round(card.confidence * 100)}%)
                  </span>
                </div>
                <span className="text-xs opacity-75">
                  {formatTimestamp(card.timestamp)}
                </span>
              </div>
              
              <p className="text-sm mb-2 line-clamp-3">
                {card.content}
              </p>
              
              {card.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {card.keywords.slice(0, 5).map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs rounded-full bg-white bg-opacity-50 font-medium"
                    >
                      #{keyword}
                    </span>
                  ))}
                  {card.keywords.length > 5 && (
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-white bg-opacity-50 font-medium">
                      +{card.keywords.length - 5}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};