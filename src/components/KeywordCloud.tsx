import React, { useEffect, useRef } from 'react';

// wordcloud 라이브러리를 동적으로 import
let WordCloud: any = null;
try {
  WordCloud = require('wordcloud');
} catch (error) {
  console.warn('wordcloud library not found, using fallback');
}

export interface KeywordData {
  text: string;
  weight: number;
}

interface KeywordCloudProps {
  keywords: KeywordData[];
  width?: number;
  height?: number;
  className?: string;
  responsive?: boolean;
}

export const KeywordCloud: React.FC<KeywordCloudProps> = ({
  keywords,
  width = 400,
  height = 300,
  className = '',
  responsive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!WordCloud || !canvasRef.current || keywords.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 반응형 크기 계산
    let canvasWidth = width;
    let canvasHeight = height;
    
    if (responsive && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      if (containerWidth < width) {
        canvasWidth = containerWidth - 32; // padding 고려
        canvasHeight = (canvasWidth / width) * height;
      }
    }

    // 캔버스 크기 설정
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 키워드 데이터를 wordcloud 형식으로 변환
    const wordList: [string, number][] = keywords.map(keyword => [keyword.text, keyword.weight]);

    // 워드클라우드 옵션 설정
    const options = {
      list: wordList,
      gridSize: Math.round(16 * canvas.width / 1024),
      weightFactor: (size: number) => {
        return Math.pow(size, 2.3) * canvas.width / 1024;
      },
      fontFamily: 'Times, serif',
      color: () => {
        // 다양한 색상 팔레트
        const colors = [
          '#3B82F6', // blue-500
          '#10B981', // green-500
          '#F59E0B', // yellow-500
          '#EF4444', // red-500
          '#8B5CF6', // purple-500
          '#06B6D4', // cyan-500
          '#F97316', // orange-500
          '#84CC16', // lime-500
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      },
      rotateRatio: 0.3,
      rotationSteps: 2,
      backgroundColor: 'transparent',
      drawOutOfBound: false,
      shrinkToFit: true,
    };

    try {
      WordCloud(canvas, options);
    } catch (error) {
      console.error('워드클라우드 생성 중 오류:', error);
    }
  }, [keywords, width, height]);

  // 접근성을 위한 키워드 목록 텍스트 생성
  const keywordListText = keywords
    .sort((a, b) => b.weight - a.weight)
    .map(keyword => `${keyword.text} (${keyword.weight})`)
    .join(', ');

  // WordCloud 라이브러리가 없을 때 대체 UI
  if (!WordCloud) {
    return (
      <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${className}`}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">주요 키워드</h3>
          <p className="text-sm text-gray-600">리뷰에서 자주 언급된 키워드들입니다</p>
        </div>
        
        {keywords.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center p-4">
            {keywords
              .sort((a, b) => b.weight - a.weight)
              .map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 90%)`,
                    color: `hsl(${(index * 137.5) % 360}, 70%, 30%)`,
                    fontSize: `${Math.max(12, Math.min(20, 12 + keyword.weight * 2))}px`
                  }}
                >
                  {keyword.text}
                  <span className="ml-1 text-xs opacity-75">({keyword.weight})</span>
                </span>
              ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📝</div>
              <p>키워드 데이터가 없습니다</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">주요 키워드</h3>
        <p className="text-sm text-gray-600">리뷰에서 자주 언급된 키워드들입니다</p>
      </div>

      <div ref={containerRef} className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="max-w-full h-auto border border-gray-100 rounded-lg"
          aria-label={`키워드 워드클라우드: ${keywordListText}`}
          role="img"
        />
      </div>

      {/* 키워드가 없을 때 표시 */}
      {keywords.length === 0 && (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📝</div>
            <p>키워드 데이터가 없습니다</p>
          </div>
        </div>
      )}

      {/* 접근성을 위한 키워드 목록 (스크린 리더용) */}
      <div className="sr-only">
        <h4>키워드 목록 (중요도 순):</h4>
        <ul>
          {keywords
            .sort((a, b) => b.weight - a.weight)
            .map((keyword, index) => (
              <li key={index}>
                {keyword.text}: {keyword.weight}
              </li>
            ))}
        </ul>
      </div>

      {/* 키워드 범례 (선택사항) */}
      {keywords.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">상위 키워드</h4>
          <div className="flex flex-wrap gap-2">
            {keywords
              .sort((a, b) => b.weight - a.weight)
              .slice(0, 8)
              .map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {keyword.text}
                  <span className="ml-1 text-blue-600">({keyword.weight})</span>
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};