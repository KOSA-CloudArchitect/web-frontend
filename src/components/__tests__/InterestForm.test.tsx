import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InterestForm } from '../InterestForm';
import { useInterestStore } from '../../stores/interestStore';

// Mock the store
jest.mock('../../stores/interestStore');

const mockUseInterestStore = useInterestStore as jest.MockedFunction<typeof useInterestStore>;

describe('InterestForm', () => {
  const mockAddInterest = jest.fn();
  const mockClearError = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseInterestStore.mockReturnValue({
      addInterest: mockAddInterest,
      removeInterest: jest.fn(),
      interests: [],
      loading: false,
      error: null,
      fetchInterests: jest.fn(),
      clearError: mockClearError,
    });
  });

  it('renders form correctly', () => {
    render(<InterestForm />);
    
    expect(screen.getByText('관심 상품 등록')).toBeInTheDocument();
    expect(screen.getByLabelText(/상품 URL/)).toBeInTheDocument();
    expect(screen.getByLabelText(/상품명 \(선택사항\)/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '관심 상품 등록' })).toBeInTheDocument();
  });

  it('validates Coupang URL format', async () => {
    const user = userEvent.setup();
    render(<InterestForm />);
    
    const urlInput = screen.getByLabelText(/상품 URL/);
    
    // Invalid URL
    await user.type(urlInput, 'https://invalid-url.com');
    
    expect(screen.getByText('올바른 쿠팡 상품 URL을 입력해주세요.')).toBeInTheDocument();
    
    // Valid URL
    await user.clear(urlInput);
    await user.type(urlInput, 'https://www.coupang.com/vp/products/123456');
    
    expect(screen.queryByText('올바른 쿠팡 상품 URL을 입력해주세요.')).not.toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockAddInterest.mockResolvedValue(true);
    
    render(<InterestForm onSuccess={mockOnSuccess} />);
    
    const urlInput = screen.getByLabelText(/상품 URL/);
    const nameInput = screen.getByLabelText(/상품명 \(선택사항\)/);
    const submitButton = screen.getByRole('button', { name: '관심 상품 등록' });
    
    await user.type(urlInput, 'https://www.coupang.com/vp/products/123456');
    await user.type(nameInput, '테스트 상품');
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddInterest).toHaveBeenCalledWith({
        productUrl: 'https://www.coupang.com/vp/products/123456',
        productName: '테스트 상품',
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('submits form without product name', async () => {
    const user = userEvent.setup();
    mockAddInterest.mockResolvedValue(true);
    
    render(<InterestForm onSuccess={mockOnSuccess} />);
    
    const urlInput = screen.getByLabelText(/상품 URL/);
    const submitButton = screen.getByRole('button', { name: '관심 상품 등록' });
    
    await user.type(urlInput, 'https://www.coupang.com/vp/products/123456');
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddInterest).toHaveBeenCalledWith({
        productUrl: 'https://www.coupang.com/vp/products/123456',
        productName: undefined,
      });
    });
  });

  it('shows error message when URL is empty', async () => {
    const user = userEvent.setup();
    render(<InterestForm />);
    
    const submitButton = screen.getByRole('button', { name: '관심 상품 등록' });
    
    fireEvent.click(submitButton);

    expect(screen.getByText('상품 URL을 입력해주세요.')).toBeInTheDocument();
    expect(mockAddInterest).not.toHaveBeenCalled();
  });

  it('disables submit button when URL is invalid', async () => {
    const user = userEvent.setup();
    render(<InterestForm />);
    
    const urlInput = screen.getByLabelText(/상품 URL/);
    const submitButton = screen.getByRole('button', { name: '관심 상품 등록' });
    
    await user.type(urlInput, 'invalid-url');
    
    expect(submitButton).toBeDisabled();
  });

  it('shows loading state during submission', () => {
    mockUseInterestStore.mockReturnValue({
      addInterest: mockAddInterest,
      removeInterest: jest.fn(),
      interests: [],
      loading: true,
      error: null,
      fetchInterests: jest.fn(),
      clearError: mockClearError,
    });

    render(<InterestForm />);
    
    expect(screen.getByText('등록 중...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /등록 중/ })).toBeDisabled();
  });

  it('displays error from store', () => {
    mockUseInterestStore.mockReturnValue({
      addInterest: mockAddInterest,
      removeInterest: jest.fn(),
      interests: [],
      loading: false,
      error: '서버 오류가 발생했습니다.',
      fetchInterests: jest.fn(),
      clearError: mockClearError,
    });

    render(<InterestForm />);
    
    expect(screen.getByText('서버 오류가 발생했습니다.')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<InterestForm onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByRole('button', { name: '취소' });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('clears form when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<InterestForm onCancel={mockOnCancel} />);
    
    const urlInput = screen.getByLabelText(/상품 URL/);
    const nameInput = screen.getByLabelText(/상품명 \(선택사항\)/);
    const cancelButton = screen.getByRole('button', { name: '취소' });
    
    await user.type(urlInput, 'https://www.coupang.com/vp/products/123456');
    await user.type(nameInput, '테스트 상품');
    
    fireEvent.click(cancelButton);
    
    expect(urlInput).toHaveValue('');
    expect(nameInput).toHaveValue('');
    expect(mockClearError).toHaveBeenCalled();
  });
});