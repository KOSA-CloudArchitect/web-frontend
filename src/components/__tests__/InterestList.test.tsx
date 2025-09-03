import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { InterestList } from '../InterestList';
import { useInterestStore } from '../../stores/interestStore';
import { InterestProduct } from '../../types';

// Mock the store
jest.mock('../../stores/interestStore');
const mockUseInterestStore = useInterestStore as jest.MockedFunction<typeof useInterestStore>;

// Mock HeartButton component
jest.mock('../HeartButton', () => ({
  HeartButton: ({ product }: { product: any }) => (
    <button data-testid={`heart-${product.id}`}>Heart</button>
  ),
}));

// Mock LoadingSpinner component
jest.mock('../LoadingSpinner', () => ({
  LoadingSpinner: ({ size }: { size?: string }) => (
    <div data-testid="loading-spinner">Loading {size}</div>
  ),
}));

const mockInterests: InterestProduct[] = [
  {
    id: '1',
    userId: 'user1',
    productId: 'product1',
    productName: '테스트 상품 1',
    productUrl: 'https://example.com/product1',
    imageUrl: 'https://example.com/image1.jpg',
    currentPrice: 10000,
    originalPrice: 12000,
    rating: 4.5,
    reviewCount: 100,
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    lastAnalyzedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    userId: 'user1',
    productId: 'product2',
    productName: '테스트 상품 2',
    productUrl: 'https://example.com/product2',
    imageUrl: 'https://example.com/image2.jpg',
    currentPrice: 20000,
    rating: 4.0,
    reviewCount: 200,
    isActive: true,
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
  },
];

const defaultMockStore = {
  interests: mockInterests,
  loading: false,
  error: null,
  fetchInterests: jest.fn(),
  removeMultipleInterests: jest.fn(),
  clearError: jest.fn(),
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('InterestList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseInterestStore.mockReturnValue(defaultMockStore);
  });

  it('관심 상품 목록을 렌더링한다', () => {
    renderWithRouter(<InterestList />);
    
    expect(screen.getByText('관심 상품 (2)')).toBeInTheDocument();
    expect(screen.getByText('테스트 상품 1')).toBeInTheDocument();
    expect(screen.getByText('테스트 상품 2')).toBeInTheDocument();
  });

  it('로딩 상태를 표시한다', () => {
    mockUseInterestStore.mockReturnValue({
      ...defaultMockStore,
      loading: true,
      interests: [],
    });

    renderWithRouter(<InterestList />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('에러 상태를 표시한다', () => {
    mockUseInterestStore.mockReturnValue({
      ...defaultMockStore,
      error: '테스트 에러 메시지',
    });

    renderWithRouter(<InterestList />);
    
    expect(screen.getByText('테스트 에러 메시지')).toBeInTheDocument();
  });

  it('관심 상품이 없을 때 빈 상태를 표시한다', () => {
    mockUseInterestStore.mockReturnValue({
      ...defaultMockStore,
      interests: [],
    });

    renderWithRouter(<InterestList />);
    
    expect(screen.getByText('관심 상품이 없습니다')).toBeInTheDocument();
  });

  describe('선택 모드', () => {
    it('선택 모드가 활성화되면 체크박스를 표시한다', () => {
      renderWithRouter(<InterestList enableSelection={true} />);
      
      expect(screen.getByLabelText('전체 선택')).toBeInTheDocument();
      expect(screen.getAllByRole('checkbox')).toHaveLength(3); // 전체 선택 + 각 상품
    });

    it('전체 선택 체크박스가 작동한다', () => {
      renderWithRouter(<InterestList enableSelection={true} />);
      
      const selectAllCheckbox = screen.getByLabelText('전체 선택');
      fireEvent.click(selectAllCheckbox);
      
      expect(screen.getByText('2개 선택됨')).toBeInTheDocument();
    });

    it('개별 상품 선택이 작동한다', () => {
      renderWithRouter(<InterestList enableSelection={true} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      const firstProductCheckbox = checkboxes[1]; // 첫 번째는 전체 선택
      
      fireEvent.click(firstProductCheckbox);
      
      expect(screen.getByText('1개 선택됨')).toBeInTheDocument();
    });

    it('선택된 항목을 삭제할 수 있다', async () => {
      const mockRemoveMultiple = jest.fn().mockResolvedValue(true);
      mockUseInterestStore.mockReturnValue({
        ...defaultMockStore,
        removeMultipleInterests: mockRemoveMultiple,
      });

      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = jest.fn().mockReturnValue(true);

      renderWithRouter(<InterestList enableSelection={true} />);
      
      // 첫 번째 상품 선택
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      
      // 삭제 버튼 클릭
      const deleteButton = screen.getByText(/삭제 \(1\)/);
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(mockRemoveMultiple).toHaveBeenCalledWith(['1']);
      });

      // Restore window.confirm
      window.confirm = originalConfirm;
    });

    it('비교 기능을 호출할 수 있다', () => {
      const mockOnCompare = jest.fn();
      renderWithRouter(
        <InterestList enableSelection={true} onCompare={mockOnCompare} />
      );
      
      // 두 개 상품 선택
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      fireEvent.click(checkboxes[2]);
      
      // 비교 버튼 클릭
      const compareButton = screen.getByText(/비교 \(2\)/);
      fireEvent.click(compareButton);
      
      expect(mockOnCompare).toHaveBeenCalledWith(['1', '2']);
    });

    it('비교 시 최소 2개 상품이 필요하다는 알림을 표시한다', () => {
      const mockOnCompare = jest.fn();
      
      // Mock window.alert
      const originalAlert = window.alert;
      window.alert = jest.fn();

      renderWithRouter(
        <InterestList enableSelection={true} onCompare={mockOnCompare} />
      );
      
      // 한 개 상품만 선택
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      
      // 비교 버튼 클릭
      const compareButton = screen.getByText(/비교 \(1\)/);
      fireEvent.click(compareButton);
      
      expect(window.alert).toHaveBeenCalledWith('비교하려면 최소 2개의 상품을 선택해주세요.');
      expect(mockOnCompare).not.toHaveBeenCalled();

      // Restore window.alert
      window.alert = originalAlert;
    });
  });

  it('상품 정보를 올바르게 표시한다', () => {
    renderWithRouter(<InterestList />);
    
    // 가격 표시
    expect(screen.getByText('10,000원')).toBeInTheDocument();
    expect(screen.getByText('20,000원')).toBeInTheDocument();
    
    // 평점 표시
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('4.0')).toBeInTheDocument();
    
    // 리뷰 수 표시
    expect(screen.getByText('(100)')).toBeInTheDocument();
    expect(screen.getByText('(200)')).toBeInTheDocument();
  });
});