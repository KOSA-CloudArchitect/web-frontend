import React, { useState } from 'react';
import { useInterestStore } from '../stores/interestStore';
import { Product } from '../types';

interface HeartButtonProps {
  product: Product;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export const HeartButton: React.FC<HeartButtonProps> = ({
  product,
  className = '',
  size = 'md',
  showTooltip = true,
}) => {
  const { addInterest, removeInterest, interests, loading } = useInterestStore();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // 현재 상품이 관심 상품으로 등록되어 있는지 확인
  const isInterested = interests.some(interest => interest.productId === product.id);

  // 크기별 스타일 정의
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    console.log('💗 하트 버튼 클릭:', {
      productId: product.id,
      productName: product.name,
      productUrl: product.url,
      isInterested
    });

    try {
      if (isInterested) {
        // 관심 상품에서 제거
        const interestToRemove = interests.find(interest => interest.productId === product.id);
        console.log('💔 관심 상품 제거 시도:', interestToRemove);
        
        if (interestToRemove) {
          const success = await removeInterest(interestToRemove.id);
          console.log('💔 관심 상품 제거 결과:', success);
          
          if (success) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
          } else {
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
          }
        }
      } else {
        // 관심 상품으로 등록
        const requestData = {
          productUrl: product.url || `https://www.coupang.com/vp/products/${product.id}`,
          productName: product.name,
        };
        
        console.log('💗 관심 상품 등록 시도:', requestData);
        
        const success = await addInterest(requestData);
        console.log('💗 관심 상품 등록 결과:', success);
        
        if (success) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        } else {
          setShowError(true);
          setTimeout(() => setShowError(false), 3000);
        }
      }
    } catch (error) {
      console.error('❌ 하트 버튼 처리 중 에러:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          relative transition-all duration-200 ease-in-out
          ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}
          ${className}
        `}
        title={showTooltip ? (isInterested ? '관심 상품에서 제거' : '관심 상품으로 등록') : undefined}
      >
        {/* 하트 아이콘 */}
        <svg
          className={`${sizeClasses[size]} transition-colors duration-200`}
          fill={isInterested ? '#ef4444' : 'none'}
          stroke={isInterested ? '#ef4444' : '#6b7280'}
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>

        {/* 로딩 스피너 */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
          </div>
        )}
      </button>

      {/* 성공 메시지 */}
      {showSuccess && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
          {isInterested ? '관심 상품에서 제거됨' : '관심 상품으로 등록됨'}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-500"></div>
        </div>
      )}

      {/* 에러 메시지 */}
      {showError && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
          오류가 발생했습니다
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
        </div>
      )}
    </div>
  );
};