import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProductList({ categoryId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 분석 상태 관리
  const [analyzeStatus, setAnalyzeStatus] = useState('idle'); // idle, loading, done, error
  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);

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

  // 상품 클릭 시 분석 상태 확인 후 AnalysisPage로 이동
  const handleAnalyze = async (productId) => {
    // 바로 분석 페이지로 이동 (분석 상태는 AnalysisPage에서 웹소켓으로 처리)
    navigate(`/analysis?productId=${productId}`);
  };

  if (loading) return <div className="p-8 text-center text-gray-400">상품을 불러오는 중...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {products.map(product => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:ring-2 ring-blue-400"
          onClick={() => handleAnalyze(product.id)}
        >
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{product.description}</p>
            <div className="flex items-center mb-2">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
              <span className="ml-2 text-sm text-gray-500">({product.review_count}개 리뷰)</span>
            </div>
            <p className="text-blue-600 font-bold">{product.price.toLocaleString()}원</p>
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