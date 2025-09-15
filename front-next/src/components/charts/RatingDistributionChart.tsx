import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RatingDistributionChartProps {
  data: { [key: string]: number };
  className?: string;
}

export const RatingDistributionChart: React.FC<RatingDistributionChartProps> = ({ 
  data, 
  className = '' 
}) => {
  const chartData = Object.entries(data)
    .map(([rating, count]) => ({
      rating: `${rating}점`,
      count,
      percentage: 0 // 계산 후 설정
    }))
    .sort((a, b) => parseInt(a.rating) - parseInt(b.rating));

  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  
  // 백분율 계산
  chartData.forEach(item => {
    item.percentage = total > 0 ? (item.count / total) * 100 : 0;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            리뷰 수: {data.value}개 ({data.payload.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (total === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <p className="text-gray-500">별점 데이터가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="rating" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: '리뷰 수', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* 요약 통계 */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-3 bg-blue-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{total}</div>
          <div className="text-sm text-blue-600">총 리뷰 수</div>
        </div>
        <div className="p-3 bg-yellow-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {total > 0 ? (
              Object.entries(data).reduce((sum, [rating, count]) => 
                sum + (parseInt(rating) * count), 0) / total
            ).toFixed(1) : '0.0'}
          </div>
          <div className="text-sm text-yellow-600">평균 별점</div>
        </div>
      </div>
    </div>
  );
};