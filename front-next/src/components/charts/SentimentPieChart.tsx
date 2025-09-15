import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { SentimentData } from '../../types';

interface SentimentPieChartProps {
  data: SentimentData;
  className?: string;
}

const COLORS = {
  positive: '#10B981', // green-500
  negative: '#EF4444', // red-500
  neutral: '#6B7280'   // gray-500
};

export const SentimentPieChart: React.FC<SentimentPieChartProps> = ({ 
  data, 
  className = '' 
}) => {
  const chartData = [
    { name: '긍정', value: data.positive, color: COLORS.positive },
    { name: '부정', value: data.negative, color: COLORS.negative },
    { name: '중립', value: data.neutral, color: COLORS.neutral },
  ].filter(item => item.value > 0); // 0인 값은 제외

  const total = data.positive + data.negative + data.neutral;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium" style={{ color: data.payload.color }}>
            {data.name}: {data.value}개 ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // 5% 미만은 라벨 숨김
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (total === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500">분석 데이터가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* 요약 통계 */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{data.positive}</div>
          <div className="text-sm text-green-600">긍정</div>
          <div className="text-xs text-gray-500">
            {((data.positive / total) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">{data.neutral}</div>
          <div className="text-sm text-gray-600">중립</div>
          <div className="text-xs text-gray-500">
            {((data.neutral / total) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{data.negative}</div>
          <div className="text-sm text-red-600">부정</div>
          <div className="text-xs text-gray-500">
            {((data.negative / total) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};