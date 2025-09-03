import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HeartButton } from './HeartButton';
import { Product } from '../types';

interface ProductListProps {
  categoryId?: string;
}

export default function ProductList({ categoryId }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 분석 상태 관리
  const [analyzeStatus, setAnalyzeStatus] = useState('idle'); // idle, loading, done, error
  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = categoryId 
          ? `/api/products?main_category=${categoryId}`
          : '/api/products';
        const response = await fetch(url);
        const data = await response.json();
        setProducts(data.products || []);
        setLoading(false);
      } catch (err) {
        console.error('상품 조회 에러:', err);
        setError('상품을 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  // 상품 클릭 시 Airflow를 통한 분석 요청 후 AnalysisPage로 이동
  const handleAnalyze = async (productId: string, productUrl?: string) => {
    try {
      console.log(`🔄 Starting analysis for product: ${productId}`);
      
      // Airflow 단일 상품 분석 요청
      const response = await fetch('/api/analyze/airflow/single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId,
          productUrl: productUrl || `https://www.coupang.com/products/${productId}`,
          userId: 'anonymous', // 현재는 익명 사용자
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Analysis started successfully: ${result.dagRunId}`);
        
        // 분석 페이지로 이동하면서 DAG Run 정보 전달
        navigate(`/analysis/${encodeURIComponent(productId)}?dagRunId=${result.dagRunId}&dagId=${result.dagId}`);
      } else {
        console.error('❌ Analysis request failed:', result.message);
        alert('분석 요청에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('❌ Error requesting analysis:', error);
      alert('분석 요청 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">상품을 불러오는 중...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {products.map(product => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:ring-2 ring-blue-400 relative"
          onClick={() => handleAnalyze(product.id)}
        >
          {/* 상품 이미지 */}
          <div className="relative">
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            {/* 하트 버튼 */}
            <div className="absolute top-2 right-2">
              <HeartButton product={product} size="md" />
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
            {product.brand && (
              <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
            )}
            <div className="flex items-center mb-2">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
              <span className="ml-2 text-sm text-gray-500">({product.review_count}개 리뷰)</span>
            </div>
            {product.price && (
              <p className="text-blue-600 font-bold">{product.price.toLocaleString()}원</p>
            )}
          </div>
          {/* 분석 상태 UI */}
          {selectedProductId === product.id && (
            <div className="p-2">
              {analyzeStatus === 'loading' && <div className="text-blue-500">분석 중입니다...</div>}
              {analyzeStatus === 'done' && <div className="text-green-600">분석 결과: {JSON.stringify(analyzeResult)}</div>}
              {analyzeStatus === 'error' && <div className="text-red-500">분석에 실패했습니다.</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 