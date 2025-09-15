'use client';

import React from 'react';
import { FinalSummaryView } from '../../components/FinalSummaryView';
import { FinalSummary } from '../../types/realtime';

export default function FinalSummaryTestPage() {
  // 샘플 데이터 생성
  const sampleSummary: FinalSummary = {
    productId: 'test-product-123',
    overall: { pos: 65, neg: 20, neu: 15 },
    topKeywords: [
      { key: '품질', count: 125 },
      { key: '배송', count: 98 },
      { key: '만족', count: 87 },
      { key: '추천', count: 72 },
      { key: '빠른', count: 65 },
      { key: '친절', count: 54 },
      { key: '가격', count: 48 },
      { key: '서비스', count: 43 },
      { key: '완벽', count: 38 },
      { key: '좋아요', count: 32 }
    ],
    highlights: [
      '전반적으로 긍정적인 반응을 보이고 있습니다.',
      '제품 품질에 대한 만족도가 높습니다.',
      '배송 서비스와 고객 응대에 대한 좋은 평가가 많습니다.',
      '가격 대비 만족도가 우수합니다.'
    ],
    insights: '고객들은 특히 제품의 품질과 빠른 배송 서비스에 대해 높은 만족도를 보이고 있습니다. 다만 일부 고객들은 포장에 대한 개선을 원하고 있어, 이 부분에 대한 검토가 필요해 보입니다.',
    charts: {
      timeline: [
        { t: '2023-01-01', pos: 60, neg: 25, neu: 15 },
        { t: '2023-01-02', pos: 62, neg: 23, neu: 15 },
        { t: '2023-01-03', pos: 65, neg: 20, neu: 15 }
      ]
    },
    rawCount: 1247,
    generatedAt: new Date().toISOString()
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            FinalSummaryView 컴포넌트 테스트
          </h1>
          <p className="text-gray-600">
            새로 업데이트된 FinalSummaryView 컴포넌트의 디자인을 확인할 수 있는 테스트 페이지입니다.
          </p>
        </div>

        <FinalSummaryView summary={sampleSummary} />
      </div>
    </div>
  );
}