import React from 'react';
import { render, screen } from '@testing-library/react';
import { KeywordCloud, KeywordData } from '../KeywordCloud';

// Mock wordcloud library
jest.mock('wordcloud', () => {
  return jest.fn();
});

describe('KeywordCloud', () => {
  const mockKeywords: KeywordData[] = [
    { text: '품질', weight: 80 },
    { text: '배송', weight: 60 },
    { text: '가격', weight: 40 },
    { text: '디자인', weight: 30 },
  ];

  it('키워드가 있을 때 캔버스가 렌더링된다', () => {
    render(<KeywordCloud keywords={mockKeywords} />);
    
    const canvas = screen.getByRole('img');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('aria-label');
  });

  it('키워드가 없을 때 빈 상태 메시지가 표시된다', () => {
    render(<KeywordCloud keywords={[]} />);
    
    expect(screen.getByText('키워드 데이터가 없습니다')).toBeInTheDocument();
  });

  it('제목과 설명이 올바르게 표시된다', () => {
    render(<KeywordCloud keywords={mockKeywords} />);
    
    expect(screen.getByText('주요 키워드')).toBeInTheDocument();
    expect(screen.getByText('리뷰에서 자주 언급된 키워드들입니다')).toBeInTheDocument();
  });

  it('상위 키워드 범례가 표시된다', () => {
    render(<KeywordCloud keywords={mockKeywords} />);
    
    expect(screen.getByText('상위 키워드')).toBeInTheDocument();
    expect(screen.getByText('품질')).toBeInTheDocument();
    expect(screen.getByText('(80)')).toBeInTheDocument();
  });

  it('접근성을 위한 스크린 리더 텍스트가 포함된다', () => {
    render(<KeywordCloud keywords={mockKeywords} />);
    
    expect(screen.getByText('키워드 목록 (중요도 순):')).toBeInTheDocument();
  });
});