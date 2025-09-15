import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SentimentChartProps {
  positiveRatio: number;
  negativeRatio: number;
  totalReviews: number;
}

const COLORS = {
  positive: '#10B981', // green-500
  negative: '#EF4444', // red-500
};

export const SentimentChart: React.FC<SentimentChartProps> = ({
  positiveRatio,
  negativeRatio,
  totalReviews,
}) => {
  const data = [
    {
      name: '긍정',
      value: positiveRatio,
      count: Math.round((positiveRatio / 100) * totalReviews),
      color: COLORS.positive,
    },
    {
      name: '부정',
      value: negativeRatio,
      count: Math.round((negativeRatio / 100) * totalReviews),
      color: COLORS.negative,
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value.toFixed(1)}% ({data.count}개)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
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
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">감성 분석 결과</h3>
        <p className="text-sm text-gray-600">총 {totalReviews.toLocaleString()}개 리뷰 분석</p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }} className="font-medium">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {positiveRatio.toFixed(1)}%
          </div>
          <div className="text-sm text-green-700">긍정 리뷰</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {negativeRatio.toFixed(1)}%
          </div>
          <div className="text-sm text-red-700">부정 리뷰</div>
        </div>
      </div>
    </div>
  );
};