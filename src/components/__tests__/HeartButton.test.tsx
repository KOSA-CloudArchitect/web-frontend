import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HeartButton } from '../HeartButton';
import { useInterestStore } from '../../stores/interestStore';
import { Product } from '../../types';

// Mock the store
jest.mock('../../stores/interestStore');

const mockProduct: Product = {
  id: 'test-product-1',
  name: '테스트 상품',
  price: 99000,
  rating: 4.5,
  review_count: 100,
  url: 'https://www.coupang.com/vp/products/123456',
};

const mockUseInterestStore = useInterestStore as jest.MockedFunction<typeof useInterestStore>;

describe('HeartButton', () => {
  const mockAddInterest = jest.fn();
  const mockRemoveInterest = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseInterestStore.mockReturnValue({
      addInterest: mockAddInterest,
      removeInterest: mockRemoveInterest,
      interests: [],
      loading: false,
      error: null,
      fetchInterests: jest.fn(),
      clearError: jest.fn(),
    });
  });

  it('renders heart button correctly', () => {
    render(<HeartButton product={mockProduct} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', '관심 상품으로 등록');
  });

  it('shows filled heart when product is in interests', () => {
    mockUseInterestStore.mockReturnValue({
      addInterest: mockAddInterest,
      removeInterest: mockRemoveInterest,
      interests: [{
        id: 'interest-1',
        userId: 'user-1',
        productId: 'test-product-1',
        productName: '테스트 상품',
        productUrl: 'https://www.coupang.com/vp/products/123456',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }],
      loading: false,
      error: null,
      fetchInterests: jest.fn(),
      clearError: jest.fn(),
    });

    render(<HeartButton product={mockProduct} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', '관심 상품에서 제거');
  });

  it('calls addInterest when clicking empty heart', async () => {
    mockAddInterest.mockResolvedValue(true);
    
    render(<HeartButton product={mockProduct} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockAddInterest).toHaveBeenCalledWith({
        productUrl: 'https://www.coupang.com/vp/products/123456',
        productName: '테스트 상품',
      });
    });
  });

  it('calls removeInterest when clicking filled heart', async () => {
    const mockInterest = {
      id: 'interest-1',
      userId: 'user-1',
      productId: 'test-product-1',
      productName: '테스트 상품',
      productUrl: 'https://www.coupang.com/vp/products/123456',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    mockUseInterestStore.mockReturnValue({
      addInterest: mockAddInterest,
      removeInterest: mockRemoveInterest,
      interests: [mockInterest],
      loading: false,
      error: null,
      fetchInterests: jest.fn(),
      clearError: jest.fn(),
    });

    mockRemoveInterest.mockResolvedValue(true);
    
    render(<HeartButton product={mockProduct} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockRemoveInterest).toHaveBeenCalledWith('interest-1');
    });
  });

  it('shows loading state when processing', () => {
    mockUseInterestStore.mockReturnValue({
      addInterest: mockAddInterest,
      removeInterest: mockRemoveInterest,
      interests: [],
      loading: true,
      error: null,
      fetchInterests: jest.fn(),
      clearError: jest.fn(),
    });

    render(<HeartButton product={mockProduct} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('shows success message after successful operation', async () => {
    mockAddInterest.mockResolvedValue(true);
    
    render(<HeartButton product={mockProduct} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('관심 상품으로 등록됨')).toBeInTheDocument();
    });
  });

  it('shows error message after failed operation', async () => {
    mockAddInterest.mockResolvedValue(false);
    
    render(<HeartButton product={mockProduct} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
    });
  });

  it('prevents event propagation when clicked', () => {
    const mockParentClick = jest.fn();
    
    render(
      <div onClick={mockParentClick}>
        <HeartButton product={mockProduct} />
      </div>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockParentClick).not.toHaveBeenCalled();
  });
});