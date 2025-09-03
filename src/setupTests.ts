import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { server } from './mocks/server';

// Configure React Testing Library
configure({ testIdAttribute: 'data-testid' });

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock WebSocket
global.WebSocket = class MockWebSocket {
  constructor(url: string) {
    this.url = url;
    this.readyState = 1; // OPEN
    setTimeout(() => {
      if (this.onopen) this.onopen(new Event('open'));
    }, 100);
  }
  
  url: string;
  readyState: number;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  
  send(data: string) {
    // Mock sending data
  }
  
  close() {
    this.readyState = 3; // CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock console methods in test environment
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    // Suppress console.log in tests unless DEBUG is set
    log: process.env.DEBUG ? console.log : jest.fn(),
    debug: process.env.DEBUG ? console.debug : jest.fn(),
    info: process.env.DEBUG ? console.info : jest.fn(),
    warn: console.warn,
    error: console.error,
  };
}

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  // Clear all mocks after each test
  jest.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});
afterAll(() => server.close());

// Global test utilities
global.testUtils = {
  // Helper to create mock user
  createMockUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date().toISOString(),
  }),
  
  // Helper to create mock analysis result
  createMockAnalysisResult: () => ({
    productId: 'test-product-id',
    sentiment: {
      positive: 0.6,
      negative: 0.2,
      neutral: 0.2,
    },
    summary: '전반적으로 긍정적인 리뷰가 많습니다.',
    keywords: ['품질', '가격', '배송'],
    totalReviews: 150,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
  
  // Helper to wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveStyle(style: Record<string, any>): R;
      toHaveAttribute(attr: string, value?: string): R;
    }
  }
  
  var testUtils: {
    createMockUser: () => any;
    createMockAnalysisResult: () => any;
    waitFor: (ms: number) => Promise<void>;
  };
}