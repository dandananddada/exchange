import { OKXWebSocket } from '../OKXWebSocket';

// Mock the underlying BaseWebSocket
jest.mock('../BaseWebSocket', () => {
  // Mock the constructor and methods of BaseWebSocket
  const mockSubscribe = jest.fn();
  const mockUnsubscribe = jest.fn();
  const mockConnect = jest.fn();
  const mockClose = jest.fn();

  const EventEmitter = require('events');

  class MockBaseWebSocket extends EventEmitter {
    subscribers = new Map();
    constructor() {
      super();
      this.subscribers.set('test-channel', [{}, new Set([jest.fn()])]);
    }
    connect = mockConnect;
    subscribe = mockSubscribe;
    unsubscribe = mockUnsubscribe;
    close = mockClose;
    // Helper to simulate message for testing onWSMessage
    simulateMessage(data: any) {
      this.emit('message', data);
    }
  }

  return {
    BaseWebSocket: MockBaseWebSocket,
    // Expose mocks for testing
    __mockSubscribe: mockSubscribe,
    __mockUnsubscribe: mockUnsubscribe,
    __mockConnect: mockConnect,
    __mockClose: mockClose,
  };
});

describe('OKXWebSocket', () => {
  let okxWs: OKXWebSocket;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    okxWs = new OKXWebSocket('ws://okx.com/ws/v5/public');
  });

  it('should call connect on instantiation', () => {
    const { __mockConnect } = require('../BaseWebSocket');
    expect(__mockConnect).toHaveBeenCalled();
  });

  describe('onWSMessage', () => {
    it('should not process subscribe response messages', () => {
      const subscribeResponse = { event: 'subscribe', arg: { channel: 'books' } };
      const listener = jest.fn();
      // @ts-ignore
      okxWs.subscribers.set('books', [{}, new Set([listener])]);
      
      // @ts-ignore
      okxWs.onWSMessage(subscribeResponse);
      
      expect(listener).not.toHaveBeenCalled();
    });

    it('should process data messages and notify subscribers', () => {
      const dataMessage = {
        arg: { channel: 'books', instId: 'BTC-USDT' },
        data: [{ asks: [], bids: [] }],
      };
      const listener = jest.fn();
      // @ts-ignore
      okxWs.subscribers.set('books', [{}, new Set([listener])]);
      
      // @ts-ignore
      okxWs.onWSMessage(dataMessage);
      
      expect(listener).toHaveBeenCalledWith(dataMessage.data);
    });

    it('should not fail if channel has no subscribers', () => {
        const dataMessage = {
            arg: { channel: 'non-existent-channel' },
            data: 'some data',
        };
        // @ts-ignore
        expect(() => okxWs.onWSMessage(dataMessage)).not.toThrow();
    });
  });

  describe('formatSubscribeMessage', () => {
    it('should format subscribe message correctly', () => {
      const channel = 'books';
      const args = { instId: 'BTC-USDT' };
      const message = okxWs['formatSubscribeMessage'](channel, args);
      expect(message).toEqual({
        op: 'subscribe',
        args: [{ channel: 'books', instId: 'BTC-USDT' }],
      });
    });
  });

  describe('formatUnsubscribeMessage', () => {
    it('should format unsubscribe message correctly', () => {
      const channel = 'books:BTC-USDT';
      const message = okxWs['formatUnsubscribeMessage'](channel);
      expect(message).toEqual({
        op: 'unsubscribe',
        args: [{ channel: 'books', instId: 'BTC-USDT' }],
      });
    });
  });
});
