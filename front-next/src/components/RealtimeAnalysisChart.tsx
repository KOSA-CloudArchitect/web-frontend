import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAnalysisChart } from '../stores/realtimeAnalysisStore';

const COLORS = {
  positive: '#10B981', // green-500
  negative: '#EF4444', // red-500
  neutral: '#6B7280',  // gray-500
};

export const RealtimeAnalysisChart: React.FC = () => {
  const chartData = useAnalysisChart();

  const pieData = [
    { name: '긍정', value: chartData.positive, color: COLORS.positive },
    { name: '부정', value: chartData.negative, color: COLORS.negative },
    { name: '중립', value: chartData.neutral, color: COLORS.neutral },
  ].filter(item => item.value > 0);

  const total = chartData.positive + chartData.negative + chartData.neutral;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0.0';
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value}개 ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (total === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">실시간 감정 분포</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p>분석 데이터를 수집하는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        실시간 감정 분포
        <span className="ml-2 text-sm font-normal text-gray-500">
          (총 {chartData.totalProcessed}개 처리됨)
        </span>
      </h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>
                  {value} ({entry.payload.value}개)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* 상세 통계 */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {total > 0 ? Math.round((chartData.positive / total) * 100) : 0}%
          </div>
          <div className="text-sm text-green-700">긍정</div>
          <div className="text-xs text-green-600">{chartData.positive}개</div>
        </div>
        
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {total > 0 ? Math.round((chartData.negative / total) * 100) : 0}%
          </div>
          <div className="text-sm text-red-700">부정</div>
          <div className="text-xs text-red-600">{chartData.negative}개</div>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">
            {total > 0 ? Math.round((chartData.neutral / total) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-700">중립</div>
          <div className="text-xs text-gray-600">{chartData.neutral}개</div>
        </div>
      </div>
    </div>
  );
};