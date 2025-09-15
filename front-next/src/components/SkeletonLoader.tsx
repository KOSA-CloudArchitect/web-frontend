import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string;
    height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    width = 'w-full',
    height = 'h-4'
}) => {
    return (
        <div
            className={`${width} ${height} bg-gray-200 rounded animate-pulse ${className}`}
        />
    );
};

export const SkeletonChart: React.FC = () => {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="mb-4">
                <Skeleton width="w-32" height="h-6" className="mb-2" />
                <Skeleton width="w-48" height="h-4" />
            </div>

            <div className="flex justify-center items-center h-80">
                <div className="relative">
                    <div className="w-48 h-48 border-8 border-gray-200 rounded-full animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Skeleton width="w-16" height="h-8" className="mx-auto mb-1" />
                    <Skeleton width="w-12" height="h-4" className="mx-auto" />
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Skeleton width="w-16" height="h-8" className="mx-auto mb-1" />
                    <Skeleton width="w-12" height="h-4" className="mx-auto" />
                </div>
            </div>
        </div>
    );
};

export const SkeletonSummaryCard: React.FC = () => {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="mb-4">
                <Skeleton width="w-24" height="h-6" className="mb-2" />
                <div className="flex items-center gap-2">
                    <Skeleton width="w-32" height="h-4" />
                    <div className="flex gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                            <Skeleton key={i} width="w-4" height="h-4" className="rounded-full" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-start gap-2 mb-3">
                    <Skeleton width="w-5" height="h-5" className="mt-0.5" />
                    <div className="flex-1">
                        <Skeleton width="w-20" height="h-5" className="mb-2" />
                        <div className="space-y-2">
                            <Skeleton width="w-full" height="h-4" />
                            <Skeleton width="w-full" height="h-4" />
                            <Skeleton width="w-3/4" height="h-4" />
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <Skeleton width="w-20" height="h-5" className="mb-3" />
                <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 6 }, (_, i) => (
                        <Skeleton key={i} width="w-16" height="h-6" className="rounded-full" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export const SkeletonWordCloud: React.FC = () => {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="mb-4">
                <Skeleton width="w-24" height="h-6" className="mb-2" />
                <Skeleton width="w-48" height="h-4" />
            </div>

            <div className="flex justify-center">
                <div className="w-full max-w-md h-64 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse mx-auto mb-2" />
                        <Skeleton width="w-32" height="h-4" className="mx-auto" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const SkeletonReviewItem: React.FC = () => {
    return (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                            <Skeleton key={i} width="w-4" height="h-4" className="rounded-full" />
                        ))}
                    </div>
                    <Skeleton width="w-12" height="h-6" className="rounded-full" />
                </div>
                <Skeleton width="w-20" height="h-4" />
            </div>

            <div className="mb-3 space-y-2">
                <Skeleton width="w-full" height="h-4" />
                <Skeleton width="w-full" height="h-4" />
                <Skeleton width="w-2/3" height="h-4" />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <Skeleton width="w-4" height="h-4" />
                    <Skeleton width="w-16" height="h-4" />
                </div>
                <Skeleton width="w-20" height="h-4" />
            </div>
        </div>
    );
};

export const SkeletonReviewList: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* 필터 스켈레톤 */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <Skeleton width="w-24" height="h-6" />
                    <Skeleton width="w-20" height="h-4" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={i}>
                            <Skeleton width="w-20" height="h-4" className="mb-2" />
                            <Skeleton width="w-full" height="h-10" />
                        </div>
                    ))}
                </div>
            </div>

            {/* 통계 스켈레톤 */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <Skeleton width="w-20" height="h-6" />
                    <Skeleton width="w-24" height="h-4" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                            <Skeleton width="w-8" height="h-6" className="mx-auto mb-1" />
                            <Skeleton width="w-12" height="h-4" className="mx-auto" />
                        </div>
                    ))}
                </div>
            </div>

            {/* 리뷰 아이템 스켈레톤 */}
            <div className="space-y-4">
                {Array.from({ length: 3 }, (_, i) => (
                    <SkeletonReviewItem key={i} />
                ))}
            </div>
        </div>
    );
};