// 상품 관련 유틸리티 함수들

export interface Product {
  id?: string;
  product_code?: string;
  title?: string;
  name?: string;
  original_price?: string | number;
  final_price?: string | number;
  origin_price?: string | number;
  review_rating?: string | number;
  review_count?: string | number;
  image_url?: string;
  url?: string;
}

export const formatPrice = (priceInput: string | number | undefined): string => {
  if (!priceInput && priceInput !== 0) return '가격 정보 없음';
  
  const price = typeof priceInput === 'string' 
    ? parseFloat(priceInput.replace(/[^0-9.]/g, '')) 
    : parseFloat(String(priceInput));
  
  if (isNaN(price)) return '가격 정보 없음';
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
};

export const calculateDiscountRate = (originalPrice: string | number | undefined, finalPrice: string | number | undefined): number | null => {
  if (!originalPrice || !finalPrice) return null;
  
  const original = typeof originalPrice === 'string' 
    ? parseFloat(originalPrice.replace(/[^0-9.]/g, '')) 
    : parseFloat(String(originalPrice));
  const final = typeof finalPrice === 'string' 
    ? parseFloat(finalPrice.replace(/[^0-9.]/g, '')) 
    : parseFloat(String(finalPrice));
  
  if (isNaN(original) || isNaN(final) || original <= final) return null;
  return Math.round(((original - final) / original) * 100);
};

export const getProductDisplayData = (product: Product) => {
  const originalPrice = product.original_price || product.origin_price;
  const finalPrice = product.final_price;
  const discountRate = calculateDiscountRate(originalPrice, finalPrice);
  
  // 이미지 URL 처리 - 여러 가능한 필드 확인
  let imageUrl = product.image_url;
  if (!imageUrl && (product as any).img) {
    imageUrl = (product as any).img;
  }
  if (!imageUrl && (product as any).image) {
    imageUrl = (product as any).image;
  }
  if (!imageUrl && (product as any).thumbnail) {
    imageUrl = (product as any).thumbnail;
  }
  
  // 이미지 URL 처리
  if (imageUrl) {
    // 상대 경로인 경우 절대 경로로 변환
    if (imageUrl.startsWith('//')) {
      imageUrl = 'https:' + imageUrl;
    } else if (imageUrl.startsWith('/')) {
      imageUrl = 'https://www.coupang.com' + imageUrl;
    }
    
    // 쿠팡 이미지인 경우 프록시 사용
    if (imageUrl.includes('coupang.com') || imageUrl.includes('coupangcdn.com')) {
      imageUrl = `/api/image/proxy?url=${encodeURIComponent(imageUrl)}`;
    }
  }
  
  return {
    id: product.product_code || product.id || Math.random().toString(),
    name: product.title || product.name || '상품명 없음',
    originalPrice: originalPrice,
    finalPrice: finalPrice,
    discount: discountRate,
    rating: parseFloat(String(product.review_rating || 0)) || 0,
    reviewCount: typeof product.review_count === 'string' 
      ? parseInt(product.review_count.replace(/[^0-9]/g, '')) || 0
      : parseInt(String(product.review_count || 0)) || 0,
    image: imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiPuydtOuvuOyngDwvdGV4dD4KPHN2Zz4=',
    url: product.url
  };
};
