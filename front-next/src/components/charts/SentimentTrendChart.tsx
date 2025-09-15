import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SentimentTrendData {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
}

interface SentimentTrendChartProps {
  data: SentimentTrendData[];
  className?: string;
}

export const SentimentTrendChart: React.FC<SentimentTrendChartProps> = ({ 
  data, 
  className = '' 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{formattedDate}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}개
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500">감정 추이 데이터가 없습니다</p>
        </div>
      </div>
    );
  }

  // 데이터를 날짜순으로 정렬
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className={className}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={sortedData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: '리뷰 수', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="positive" 
              stroke="#10B981" 
              strokeWidth={2}
              name="긍정"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="neutral" 
              stroke="#6B7280" 
              strokeWidth={2}
              name="중립"
              dot={{ fill: '#6B7280', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="negative" 
              stroke="#EF4444" 
              strokeWidth={2}
              name="부정"
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* 요약 통계 */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {sortedData.reduce((sum, item) => sum + item.positive, 0)}
          </div>
          <div className="text-sm text-green-600">총 긍정 리뷰</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-600">
            {sortedData.reduce((sum, item) => sum + item.neutral, 0)}
          </div>
          <div className="text-sm text-gray-600">총 중립 리뷰</div>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="text-lg font-bold text-red-600">
            {sortedData.reduce((sum, item) => sum + item.negative, 0)}
          </div>
          <div className="text-sm text-red-600">총 부정 리뷰</div>
        </div>
      </div>
    </div>
  );
};