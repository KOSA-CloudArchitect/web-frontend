import '@testing-library/jest-dom';

// Mock environment variables
process.env.REACT_APP_API_BASE_URL = 'http://localhost:3001';
process.env.REACT_APP_WS_URL = 'ws://localhost:3001';

// Mock window.alert
global.alert = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock fetch globally
global.fetch = jest.fn();

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connected: true,
  })),
}));