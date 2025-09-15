import React, { useState } from 'react';
import { useInterestStore } from '../stores/interestStore';

interface InterestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const InterestForm: React.FC<InterestFormProps> = ({
  onSuccess,
  onCancel,
  className = '',
}) => {
  const { addInterest, loading, error, clearError } = useInterestStore();
  const [url, setUrl] = useState('');
  const [productName, setProductName] = useState('');
  const [urlError, setUrlError] = useState('');

  // 쿠팡 URL 유효성 검사
  const validateCoupangUrl = (url: string): boolean => {
    const coupangUrlPattern = /^https?:\/\/(www\.)?coupang\.com\/(vp\/products\/\d+|products\/\d+)/;
    return coupangUrlPattern.test(url);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    // 실시간 URL 유효성 검사
    if (newUrl && !validateCoupangUrl(newUrl)) {
      setUrlError('올바른 쿠팡 상품 URL을 입력해주세요.');
    } else {
      setUrlError('');
    }
    
    // 에러 메시지 초기화
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setUrlError('상품 URL을 입력해주세요.');
      return;
    }

    if (!validateCoupangUrl(url)) {
      setUrlError('올바른 쿠팡 상품 URL을 입력해주세요.');
      return;
    }

    try {
      const success = await addInterest({
        productUrl: url.trim(),
        productName: productName.trim() || undefined,
      });

      if (success) {
        // 폼 초기화
        setUrl('');
        setProductName('');
        setUrlError('');
        
        // 성공 콜백 호출
        onSuccess?.();
      }
    } catch (error) {
      // 에러는 스토어에서 처리됨
    }
  };

  const handleCancel = () => {
    setUrl('');
    setProductName('');
    setUrlError('');
    clearError();
    onCancel?.();
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        관심 상품 등록
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* URL 입력 */}
        <div>
          <label htmlFor="productUrl" className="block text-sm font-medium text-gray-700 mb-1">
            상품 URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="productUrl"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://www.coupang.com/vp/products/..."
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              ${urlError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}
            `}
            disabled={loading}
          />
          {urlError && (
            <p className="mt-1 text-sm text-red-600">{urlError}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            쿠팡 상품 페이지의 URL을 입력해주세요.
          </p>
        </div>

        {/* 상품명 입력 (선택사항) */}
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
            상품명 (선택사항)
          </label>
          <input
            type="text"
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="상품명을 입력하면 더 쉽게 찾을 수 있어요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            입력하지 않으면 자동으로 상품명을 가져옵니다.
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 버튼 그룹 */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading || !!urlError || !url.trim()}
            className={`
              flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200
              ${
                loading || !!urlError || !url.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }
            `}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                등록 중...
              </div>
            ) : (
              '관심 상품 등록'
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
          )}
        </div>
      </form>
    </div>
  );
};