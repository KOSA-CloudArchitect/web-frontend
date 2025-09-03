import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SkeletonLoader from '../SkeletonLoader';

describe('SkeletonLoader Component', () => {
  it('should render skeleton loader with default props', () => {
    render(<SkeletonLoader />);
    
    const skeleton = screen.getByTestId('skeleton-loader');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('should render with custom width', () => {
    render(<SkeletonLoader width="200px" />);
    
    const skeleton = screen.getByTestId('skeleton-loader');
    expect(skeleton).toHaveStyle({ width: '200px' });
  });

  it('should render with custom height', () => {
    render(<SkeletonLoader height="50px" />);
    
    const skeleton = screen.getByTestId('skeleton-loader');
    expect(skeleton).toHaveStyle({ height: '50px' });
  });

  it('should render with custom className', () => {
    render(<SkeletonLoader className="custom-skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton-loader');
    expect(skeleton).toHaveClass('custom-skeleton');
    expect(skeleton).toHaveClass('animate-pulse'); // Should still have default classes
  });

  it('should render rounded skeleton', () => {
    render(<SkeletonLoader rounded />);
    
    const skeleton = screen.getByTestId('skeleton-loader');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('should render multiple skeleton lines', () => {
    render(<SkeletonLoader lines={3} />);
    
    const skeletons = screen.getAllByTestId('skeleton-loader');
    expect(skeletons).toHaveLength(3);
    
    skeletons.forEach(skeleton => {
      expect(skeleton).toHaveClass('animate-pulse');
      expect(skeleton).toHaveClass('bg-gray-200');
    });
  });

  it('should render with different variants', () => {
    const { rerender } = render(<SkeletonLoader variant="text" />);
    let skeleton = screen.getByTestId('skeleton-loader');
    expect(skeleton).toHaveClass('h-4');

    rerender(<SkeletonLoader variant="circular" />);
    skeleton = screen.getByTestId('skeleton-loader');
    expect(skeleton).toHaveClass('rounded-full');

    rerender(<SkeletonLoader variant="rectangular" />);
    skeleton = screen.getByTestId('skeleton-loader');
    expect(skeleton).toHaveClass('rounded-md');
  });

  it('should handle animation prop', () => {
    const { rerender } = render(<SkeletonLoader animation="pulse" />);
    let skeleton = screen.getByTestId('skeleton-loader');
    expect(skeleton).toHaveClass('animate-pulse');

    rerender(<SkeletonLoader animation="wave" />);
    skeleton = screen.getByTestId('skeleton-loader');
    expect(skeleton).toHaveClass('animate-wave');

    rerender(<SkeletonLoader animation={false} />);
    skeleton = screen.getByTestId('skeleton-loader');
    expect(skeleton).not.toHaveClass('animate-pulse');
    expect(skeleton).not.toHaveClass('animate-wave');
  });

  it('should render with custom data-testid', () => {
    render(<SkeletonLoader data-testid="custom-skeleton" />);
    
    const skeleton = screen.getByTestId('custom-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('should apply correct styles for different sizes', () => {
    const { rerender } = render(<SkeletonLoader size="small" />);
    let skeleton = screen.getByTestId('skeleton-loader');
    expect(skeleton).toHaveClass('h-3');

    rerender(<SkeletonLoader size="medium" />);
    skeleton = screen.getByTestId('skeleton-loader');
    expect(skeleton).toHaveClass('h-4');

    rerender(<SkeletonLoader size="large" />);
    skeleton = screen.getByTestId('skeleton-loader');
    expect(skeleton).toHaveClass('h-6');
  });

  it('should render skeleton for card layout', () => {
    render(
      <SkeletonLoader 
        variant="card" 
        width="300px" 
        height="200px"
        className="p-4"
      />
    );
    
    const skeleton = screen.getByTestId('skeleton-loader');
    expect(skeleton).toHaveClass('p-4');
    expect(skeleton).toHaveStyle({ 
      width: '300px', 
      height: '200px' 
    });
  });

  it('should handle accessibility attributes', () => {
    render(
      <SkeletonLoader 
        aria-label="Loading content"
        role="status"
      />
    );
    
    const skeleton = screen.getByTestId('skeleton-loader');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
    expect(skeleton).toHaveAttribute('role', 'status');
  });

  it('should render skeleton with gradient background', () => {
    render(<SkeletonLoader gradient />);
    
    const skeleton = screen.getByTestId('skeleton-loader');
    expect(skeleton).toHaveClass('bg-gradient-to-r');
  });

  it('should render skeleton table rows', () => {
    render(
      <table>
        <tbody>
          <SkeletonLoader variant="table-row" columns={3} />
        </tbody>
      </table>
    );
    
    const row = screen.getByRole('row');
    const cells = screen.getAllByRole('cell');
    
    expect(row).toBeInTheDocument();
    expect(cells).toHaveLength(3);
    
    cells.forEach(cell => {
      const skeleton = cell.querySelector('[data-testid="skeleton-loader"]');
      expect(skeleton).toBeInTheDocument();
    });
  });

  it('should match snapshot', () => {
    const { container } = render(
      <SkeletonLoader 
        width="100px" 
        height="20px" 
        className="test-skeleton"
        lines={2}
      />
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const renderSpy = jest.fn();
      
      const TestComponent = React.memo(() => {
        renderSpy();
        return <SkeletonLoader />;
      });

      const { rerender } = render(<TestComponent />);
      
      // Initial render
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props should not cause re-render
      rerender(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid props gracefully', () => {
      // Should not throw error with invalid props
      expect(() => {
        render(
          <SkeletonLoader 
            width="invalid-width"
            height={null}
            lines={-1}
          />
        );
      }).not.toThrow();
    });

    it('should provide fallback for missing props', () => {
      render(<SkeletonLoader lines={0} />);
      
      // Should render at least one skeleton even with lines=0
      const skeleton = screen.getByTestId('skeleton-loader');
      expect(skeleton).toBeInTheDocument();
    });
  });
});