'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InterestList } from '../../components/InterestList';
import { InterestForm } from '../../components/InterestForm';

export default function InterestPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const router = useRouter();

  const handleFormSuccess = () => {
    setShowForm(false);
    // InterestList는 자동으로 새로고침됨 (useEffect에서 fetchInterests 호출)
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleCompare = (selectedIds: string[]) => {
    // 비교 페이지로 이동 (쿼리 파라미터로 선택된 ID들 전달)
    const params = new URLSearchParams();
    selectedIds.forEach(id => params.append('id', id));
    router.push(`/compare?${params.toString()}`);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">관심 상품</h1>
              <p className="mt-2 text-gray-600">
                관심 있는 상품을 등록하고 정기적으로 분석 결과를 확인하세요.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleSelectionMode}
                className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  selectionMode
                    ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500'
                    : 'border-transparent text-white bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {selectionMode ? '선택 완료' : '선택 모드'}
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {showForm ? '취소' : '상품 등록'}
              </button>
            </div>
          </div>
        </div>

        {/* 관심 상품 등록 폼 */}
        {showForm && (
          <div className="mb-8">
            <InterestForm
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
              className="max-w-2xl"
            />
          </div>
        )}

        {/* 관심 상품 목록 */}
        <InterestList 
          enableSelection={selectionMode}
          onCompare={handleCompare}
        />

        {/* 도움말 섹션 */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">관심 상품 기능 안내</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">📝 상품 등록 방법</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 쿠팡 상품 페이지 URL을 직접 입력</li>
                <li>• 검색 결과에서 하트 버튼 클릭</li>
                <li>• 상품명은 자동으로 가져오거나 직접 입력</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">🔄 자동 분석 기능</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 등록된 상품은 정기적으로 분석</li>
                <li>• 가격 변동 및 리뷰 변화 추적</li>
                <li>• 할인 정보 및 트렌드 알림</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}