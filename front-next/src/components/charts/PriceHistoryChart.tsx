import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PriceHistoryData {
  date: string;
  price: number;
}

interface PriceHistoryChartProps {
  data: PriceHistoryData[];
  className?: string;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ 
  data, 
  className = '' 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
      const price = payload[0].value;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{formattedDate}</p>
          <p className="text-blue-600 font-bold">
            {formatPrice(price)}
          </p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <p className="text-gray-500">가격 변화 데이터가 없습니다</p>
        </div>
      </div>
    );
  }

  // 데이터를 날짜순으로 정렬
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // 가격 통계 계산
  const prices = sortedData.map(item => item.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice = prices[prices.length - 1];
  const firstPrice = prices[0];
  const priceChange = currentPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? ((priceChange / firstPrice) * 100) : 0;

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
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              label={{ value: '가격 (원)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* 가격 통계 */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-3 bg-blue-50 rounded-lg text-center">
          <div className="text-lg font-bold text-blue-600">
            {formatPrice(currentPrice)}
          </div>
          <div className="text-sm text-blue-600">현재 가격</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg text-center">
          <div className="text-lg font-bold text-green-600">
            {formatPrice(minPrice)}
          </div>
          <div className="text-sm text-green-600">최저가</div>
        </div>
        <div className="p-3 bg-red-50 rounded-lg text-center">
          <div className="text-lg font-bold text-red-600">
            {formatPrice(maxPrice)}
          </div>
          <div className="text-sm text-red-600">최고가</div>
        </div>
        <div className={`p-3 rounded-lg text-center ${
          priceChange >= 0 ? 'bg-red-50' : 'bg-green-50'
        }`}>
          <div className={`text-lg font-bold ${
            priceChange >= 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {priceChange >= 0 ? '+' : ''}{formatPrice(priceChange)}
          </div>
          <div className={`text-sm ${
            priceChange >= 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            변화량 ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%)
          </div>
        </div>
      </div>
    </div>
  );
};