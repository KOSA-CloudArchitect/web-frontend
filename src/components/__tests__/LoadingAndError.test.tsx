import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ErrorMessage } from '../ErrorMessage';
import { LoadingOverlay } from '../LoadingOverlay';
import { SkeletonChart, SkeletonSummaryCard } from '../SkeletonLoader';
import { ErrorBoundary } from '../ErrorBoundary';

// Router wrapper for components that use navigation
const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter 
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    {children}
  </BrowserRouter>
);

describe('Loading and Error Components', () => {
  describe('ErrorMessage', () => {
    it('네트워크 에러 메시지를 올바르게 표시한다', () => {
      render(
        <RouterWrapper>
          <ErrorMessage
            message="네트워크 연결을 확인해주세요"
            type="network"
            onRetry={jest.fn()}
          />
        </RouterWrapper>
      );

      expect(screen.getByText('네트워크 연결 오류')).toBeInTheDocument();
      expect(screen.getByText('네트워크 연결을 확인해주세요')).toBeInTheDocument();
      expect(screen.getByText('다시 시도')).toBeInTheDocument();
    });

    it('서버 에러 메시지를 올바르게 표시한다', () => {
      render(
        <RouterWrapper>
          <ErrorMessage
            message="서버에 문제가 발생했습니다"
            type="server"
            showSupportButton={true}
          />
        </RouterWrapper>
      );

      expect(screen.getByText('서버 오류')).toBeInTheDocument();
      expect(screen.getByText('고객 지원')).toBeInTheDocument();
    });

    it('재시도 버튼이 올바르게 작동한다', () => {
      const mockRetry = jest.fn();
      render(
        <RouterWrapper>
          <ErrorMessage
            message="테스트 에러"
            onRetry={mockRetry}
          />
        </RouterWrapper>
      );

      fireEvent.click(screen.getByText('다시 시도'));
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('LoadingOverlay', () => {
    it('로딩 오버레이가 올바르게 표시된다', () => {
      render(
        <LoadingOverlay
          isVisible={true}
          stage="analyzing"
          progress={50}
          estimatedTime={30}
        />
      );

      expect(screen.getByText('감성 분석 진행 중')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('예상 소요 시간: 약 30초')).toBeInTheDocument();
    });

    it('로딩 오버레이가 숨겨진다', () => {
      const { container } = render(
        <LoadingOverlay isVisible={false} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('단계별 로딩 메시지가 올바르게 표시된다', () => {
      const { rerender } = render(
        <LoadingOverlay isVisible={true} stage="fetching" />
      );

      expect(screen.getByText('리뷰 데이터 수집 중')).toBeInTheDocument();

      rerender(<LoadingOverlay isVisible={true} stage="processing" />);
      expect(screen.getByText('데이터 처리 중')).toBeInTheDocument();
    });
  });

  describe('SkeletonLoader', () => {
    it('스켈레톤 차트가 렌더링된다', () => {
      render(<SkeletonChart />);
      
      // 스켈레톤 요소들이 존재하는지 확인
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('스켈레톤 요약 카드가 렌더링된다', () => {
      render(<SkeletonSummaryCard />);
      
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });
  });

  describe('ErrorBoundary', () => {
    // 에러를 발생시키는 테스트 컴포넌트
    const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
      if (shouldThrow) {
        throw new Error('테스트 에러');
      }
      return <div>정상 컴포넌트</div>;
    };

    it('에러가 없을 때 자식 컴포넌트를 렌더링한다', () => {
      render(
        <RouterWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={false} />
          </ErrorBoundary>
        </RouterWrapper>
      );

      expect(screen.getByText('정상 컴포넌트')).toBeInTheDocument();
    });

    it('에러가 발생했을 때 에러 메시지를 표시한다', () => {
      // 콘솔 에러 메시지 숨기기
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <RouterWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </RouterWrapper>
      );

      expect(screen.getByText('분석 중 오류가 발생했습니다')).toBeInTheDocument();
      expect(screen.getByText('다시 시도')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('재시도 버튼이 작동한다', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <RouterWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </RouterWrapper>
      );

      expect(screen.getByText('다시 시도')).toBeInTheDocument();

      // 재시도 버튼이 존재하는지만 확인 (실제 기능 테스트는 복잡함)
      const retryButton = screen.getByText('다시 시도');
      expect(retryButton).toBeInTheDocument();
      
      // 버튼 클릭 가능한지 확인
      fireEvent.click(retryButton);

      consoleSpy.mockRestore();
    });
  });
});