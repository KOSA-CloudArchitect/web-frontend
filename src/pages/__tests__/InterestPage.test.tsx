import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { InterestPage } from '../InterestPage';

// Mock the components
jest.mock('../../components/InterestList', () => ({
  InterestList: ({ enableSelection, onCompare }: { enableSelection?: boolean; onCompare?: (ids: string[]) => void }) => (
    <div data-testid="interest-list">
      <span>InterestList - Selection: {enableSelection ? 'enabled' : 'disabled'}</span>
      {onCompare && (
        <button onClick={() => onCompare(['1', '2'])}>
          Test Compare
        </button>
      )}
    </div>
  ),
}));

jest.mock('../../components/InterestForm', () => ({
  InterestForm: ({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) => (
    <div data-testid="interest-form">
      <span>InterestForm</span>
      <button onClick={onSuccess}>Success</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('InterestPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('페이지가 올바르게 렌더링된다', () => {
    renderWithRouter(<InterestPage />);
    
    expect(screen.getByText('관심 상품')).toBeInTheDocument();
    expect(screen.getByText('관심 있는 상품을 등록하고 정기적으로 분석 결과를 확인하세요.')).toBeInTheDocument();
    expect(screen.getByTestId('interest-list')).toBeInTheDocument();
  });

  it('상품 등록 버튼이 작동한다', () => {
    renderWithRouter(<InterestPage />);
    
    const registerButton = screen.getByText('상품 등록');
    fireEvent.click(registerButton);
    
    expect(screen.getByTestId('interest-form')).toBeInTheDocument();
    expect(screen.getByText('취소')).toBeInTheDocument();
  });

  it('선택 모드 토글이 작동한다', () => {
    renderWithRouter(<InterestPage />);
    
    const selectionButton = screen.getByText('선택 모드');
    fireEvent.click(selectionButton);
    
    expect(screen.getByText('선택 완료')).toBeInTheDocument();
    expect(screen.getByText('InterestList - Selection: enabled')).toBeInTheDocument();
  });

  it('폼 성공 시 폼이 숨겨진다', () => {
    renderWithRouter(<InterestPage />);
    
    // 폼 열기
    const registerButton = screen.getByText('상품 등록');
    fireEvent.click(registerButton);
    
    expect(screen.getByTestId('interest-form')).toBeInTheDocument();
    
    // 폼 성공
    const successButton = screen.getByText('Success');
    fireEvent.click(successButton);
    
    expect(screen.queryByTestId('interest-form')).not.toBeInTheDocument();
    expect(screen.getByText('상품 등록')).toBeInTheDocument();
  });

  it('폼 취소 시 폼이 숨겨진다', () => {
    renderWithRouter(<InterestPage />);
    
    // 폼 열기
    const registerButton = screen.getByText('상품 등록');
    fireEvent.click(registerButton);
    
    expect(screen.getByTestId('interest-form')).toBeInTheDocument();
    
    // 폼 취소
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(screen.queryByTestId('interest-form')).not.toBeInTheDocument();
    expect(screen.getByText('상품 등록')).toBeInTheDocument();
  });

  it('비교 기능이 올바른 URL로 이동한다', () => {
    renderWithRouter(<InterestPage />);
    
    // 선택 모드 활성화
    const selectionButton = screen.getByText('선택 모드');
    fireEvent.click(selectionButton);
    
    // 비교 버튼 클릭 (모킹된 컴포넌트에서)
    const compareButton = screen.getByText('Test Compare');
    fireEvent.click(compareButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/compare?id=1&id=2');
  });

  it('도움말 섹션이 표시된다', () => {
    renderWithRouter(<InterestPage />);
    
    expect(screen.getByText('관심 상품 기능 안내')).toBeInTheDocument();
    expect(screen.getByText('📝 상품 등록 방법')).toBeInTheDocument();
    expect(screen.getByText('🔄 자동 분석 기능')).toBeInTheDocument();
  });
});