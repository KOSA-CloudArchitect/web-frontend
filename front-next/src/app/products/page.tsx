'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiService } from '../../services/api';

interface Product {
    id: string;
    name: string;
    url: string;
    currentPrice: number | null;
    averageRating: number | null;
    totalReviews: number;
    imageUrl: string | null;
    lastCrawledAt: string;
    createdAt: string;
    updatedAt: string;
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export default function ProductListPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const searchParams = useSearchParams();

    useEffect(() => {
        // URL에서 초기 검색어와 페이지 파라미터 읽기
        const search = searchParams?.get('search') || '';
        const page = parseInt(searchParams?.get('page') || '1');
        
        setSearchTerm(search);
        setCurrentPage(page);
        fetchProducts(page, search);
    }, [searchParams]);

    const fetchProducts = async (page: number = 1, search?: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiService.getProductList({
                page,
                limit: 12,
                search: search || undefined
            });

            if (response.success) {
                setProducts(response.products);
                setPagination(response.pagination);
            } else {
                setError('상품 목록을 불러올 수 없습니다.');
            }
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError('상품 목록을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(currentPage, searchTerm);
    }, [currentPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        
        // URL 업데이트
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        params.set('page', '1');
        
        window.history.pushState(null, '', `${window.location.pathname}?${params.toString()}`);
        
        fetchProducts(1, searchTerm);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        
        // URL 업데이트
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        params.set('page', newPage.toString());
        
        window.history.pushState(null, '', `${window.location.pathname}?${params.toString()}`);
    };

    const formatPrice = (price: number | null) => {
        if (!price) return '가격 정보 없음';
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW'
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && products.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">상품 목록을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">상품 목록</h1>
                        <div className="text-sm text-gray-500">
                            {pagination && `총 ${pagination.totalCount}개 상품`}
                        </div>
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="mt-6">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="상품명으로 검색..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                            >
                                검색
                            </button>
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setCurrentPage(1);
                                        window.history.pushState(null, '', window.location.pathname);
                                        fetchProducts(1);
                                    }}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                >
                                    초기화
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="text-red-800">
                                <p className="font-medium">오류 발생</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {products.length === 0 && !loading ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📦</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">상품이 없습니다</h3>
                        <p className="text-gray-500">
                            {searchTerm ? '검색 조건에 맞는 상품이 없습니다.' : '아직 등록된 상품이 없습니다.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Product Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    {/* Product Image */}
                                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="h-48 w-full object-cover object-center"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij7snbTrr7jsp4A8L3RleHQ+PC9zdmc+';
                                                }}
                                            />
                                        ) : (
                                            <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-400 text-sm">이미지 없음</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                                            {product.name}
                                        </h3>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-bold text-blue-600">
                                                    {formatPrice(product.currentPrice)}
                                                </span>
                                            </div>

                                            {product.averageRating && (
                                                <div className="flex items-center">
                                                    <div className="flex items-center">
                                                        {[...Array(5)].map((_, i) => (
                                                            <svg
                                                                key={i}
                                                                className={`h-4 w-4 ${i < Math.floor(product.averageRating!)
                                                                    ? 'text-yellow-400'
                                                                    : 'text-gray-300'
                                                                    }`}
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                    <span className="ml-2 text-sm text-gray-600">
                                                        {product.averageRating.toFixed(1)} ({product.totalReviews}개 리뷰)
                                                    </span>
                                                </div>
                                            )}

                                            <div className="text-xs text-gray-500">
                                                <div>등록: {formatDate(product.createdAt)}</div>
                                                <div>수집: {formatDate(product.lastCrawledAt)}</div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-4 flex gap-2">
                                            <a
                                                href={product.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                                            >
                                                쿠팡에서 보기
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center">
                                <nav className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={!pagination.hasPrev}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        이전
                                    </button>

                                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                        const pageNum = Math.max(1, currentPage - 2) + i;
                                        if (pageNum > pagination.totalPages) return null;

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`px-3 py-2 text-sm font-medium rounded-md ${pageNum === currentPage
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={!pagination.hasNext}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        다음
                                    </button>
                                </nav>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}