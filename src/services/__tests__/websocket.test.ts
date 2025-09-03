import { WebSocketAnalysisEvent } from '../../types';

// Mock socket.io-client with a factory function to avoid hoisting issues
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connected: true,
  };

  return {
    io: jest.fn(() => mockSocket),
  };
});

// Import after mocking
import { WebSocketService } from '../websocket';
import { io } from 'socket.io-client';

describe('WebSocketService', () => {
  let webSocketService: WebSocketService;
  let mockSocket: any;
  let mockIo: jest.MockedFunction<typeof io>;

  beforeEach(() => {
    // Get the mocked io function
    mockIo = io as jest.MockedFunction<typeof io>;
    
    // Create a fresh mock socket for each test
    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
      connected: true,
    };
    
    // Make io return our mock socket
    mockIo.mockReturnValue(mockSocket);
    
    // Create fresh service instance
    webSocketService = new WebSocketService();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('connect', () => {
    it('should create socket connection with correct configuration', () => {
      webSocketService.connect();

      expect(mockIo).toHaveBeenCalledWith('ws://localhost:3001', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    });

    it('should set up event listeners', () => {
      webSocketService.connect();

      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
    });

    it('should return existing socket if already connected', () => {
      const socket1 = webSocketService.connect();
      const socket2 = webSocketService.connect();

      expect(socket1).toBe(socket2);
      expect(mockIo).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscribeToAnalysis', () => {
    it('should subscribe to analysis events', () => {
      const productId = 'product-123';
      const callback = jest.fn();

      webSocketService.subscribeToAnalysis(productId, callback);

      expect(mockSocket.on).toHaveBeenCalledWith(`analysis:${productId}`, callback);
    });

    it('should return unsubscribe function', () => {
      const productId = 'product-123';
      const callback = jest.fn();

      const unsubscribe = webSocketService.subscribeToAnalysis(productId, callback);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();

      expect(mockSocket.off).toHaveBeenCalledWith(`analysis:${productId}`, callback);
    });

    it('should handle analysis events correctly', () => {
      const productId = 'product-123';
      const callback = jest.fn();
      const eventData: WebSocketAnalysisEvent = {
        status: 'processing',
        progress: 50,
        timestamp: '2023-01-01T00:00:00Z',
      };

      webSocketService.subscribeToAnalysis(productId, callback);

      // Find the callback that was registered for the analysis event
      const onCalls = mockSocket.on.mock.calls;
      const analysisCall = onCalls.find((call: any) => call[0] === `analysis:${productId}`);
      
      expect(analysisCall).toBeDefined();
      
      if (analysisCall && analysisCall[1]) {
        // Simulate the event by calling the registered callback
        analysisCall[1](eventData);
        expect(callback).toHaveBeenCalledWith(eventData);
      }
    });
  });

  describe('disconnect', () => {
    it('should disconnect socket when socket exists', () => {
      // First connect to create a socket
      webSocketService.connect();
      
      // Then disconnect
      webSocketService.disconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should handle disconnect when no socket exists', () => {
      // Create a new service that hasn't connected yet
      const newService = new WebSocketService();
      
      // Should not throw
      expect(() => newService.disconnect()).not.toThrow();
    });
  });

  describe('isConnected', () => {
    it('should return connection status when socket exists', () => {
      webSocketService.connect();
      expect(webSocketService.isConnected()).toBe(true);

      mockSocket.connected = false;
      expect(webSocketService.isConnected()).toBe(false);
    });

    it('should return false when no socket exists', () => {
      const newService = new WebSocketService();
      expect(newService.isConnected()).toBe(false);
    });
  });
});