import { renderHook } from '@testing-library/react';
import { usePublicSubscribe, useBusinessSubscribe } from '../useOKXSubscribe';
import { useSubscribe } from '../index';
import { SubscribeOptions } from '@/types/websocket.types';

// Mock useSubscribe
jest.mock('../index', () => ({
  useSubscribe: jest.fn(),
}));

describe('useOKXSubscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('usePublicSubscribe', () => {
    it('should call useSubscribe with public OKX WebSocket URL', () => {
      const mockOptions: SubscribeOptions = {
        url: 'wss://test.com', // This will be overridden
        channel: 'tickers',
        params: { instId: 'BTC-USDT' },
      };

      renderHook(() => usePublicSubscribe(mockOptions));

      expect(useSubscribe).toHaveBeenCalledWith({
        ...mockOptions,
        url: 'wss://ws.okx.com:8443/ws/v5/public',
      });
    });

    it('should pass all options to useSubscribe', () => {
      const mockOptions: SubscribeOptions = {
        url: 'placeholder',
        channel: 'candle1m',
        params: { instId: 'ETH-USDT' },
        onMessage: jest.fn(),
        onError: jest.fn(),
        enabled: true,
        reconnect: true,
      };

      renderHook(() => usePublicSubscribe(mockOptions));

      expect(useSubscribe).toHaveBeenCalledWith({
        ...mockOptions,
        url: 'wss://ws.okx.com:8443/ws/v5/public',
      });
    });

    it('should handle enabled false', () => {
      const mockOptions: SubscribeOptions = {
        url: 'placeholder',
        channel: 'books',
        params: { instId: 'BTC-USDT' },
        enabled: false,
      };

      renderHook(() => usePublicSubscribe(mockOptions));

      expect(useSubscribe).toHaveBeenCalledWith({
        ...mockOptions,
        url: 'wss://ws.okx.com:8443/ws/v5/public',
      });
    });

    it('should work with different channels', () => {
      const channels = ['tickers', 'candle1m', 'books', 'trades'];

      channels.forEach((channel) => {
        renderHook(() =>
          usePublicSubscribe({
            url: 'placeholder',
            channel,
            params: { instId: 'BTC-USDT' },
          })
        );
      });

      expect(useSubscribe).toHaveBeenCalledTimes(channels.length);
    });
  });

  describe('useBusinessSubscribe', () => {
    it('should call useSubscribe with business OKX WebSocket URL', () => {
      const mockOptions: SubscribeOptions = {
        url: 'wss://test.com', // This will be overridden
        channel: 'orders',
        params: { instType: 'SPOT' },
      };

      renderHook(() => useBusinessSubscribe(mockOptions));

      expect(useSubscribe).toHaveBeenCalledWith({
        ...mockOptions,
        url: 'wss://ws.okx.com:8443/ws/v5/business',
      });
    });

    it('should pass all options to useSubscribe', () => {
      const mockOptions: SubscribeOptions = {
        url: 'placeholder',
        channel: 'account',
        params: { ccy: 'USDT' },
        onMessage: jest.fn(),
        onError: jest.fn(),
        enabled: true,
        reconnect: true,
      };

      renderHook(() => useBusinessSubscribe(mockOptions));

      expect(useSubscribe).toHaveBeenCalledWith({
        ...mockOptions,
        url: 'wss://ws.okx.com:8443/ws/v5/business',
      });
    });

    it('should handle enabled false', () => {
      const mockOptions: SubscribeOptions = {
        url: 'placeholder',
        channel: 'positions',
        params: { instType: 'FUTURES' },
        enabled: false,
      };

      renderHook(() => useBusinessSubscribe(mockOptions));

      expect(useSubscribe).toHaveBeenCalledWith({
        ...mockOptions,
        url: 'wss://ws.okx.com:8443/ws/v5/business',
      });
    });

    it('should work with different channels', () => {
      const channels = ['orders', 'account', 'positions', 'balance_and_position'];

      channels.forEach((channel) => {
        renderHook(() =>
          useBusinessSubscribe({
            url: 'placeholder',
            channel,
            params: { instType: 'SPOT' },
          })
        );
      });

      expect(useSubscribe).toHaveBeenCalledTimes(channels.length);
    });
  });

  describe('URL constants', () => {
    it('should use correct public WebSocket URL', () => {
      const mockOptions: SubscribeOptions = {
        url: 'test',
        channel: 'tickers',
        params: {},
      };

      renderHook(() => usePublicSubscribe(mockOptions));

      const callArgs = (useSubscribe as jest.Mock).mock.calls[0][0];
      expect(callArgs.url).toBe('wss://ws.okx.com:8443/ws/v5/public');
    });

    it('should use correct business WebSocket URL', () => {
      const mockOptions: SubscribeOptions = {
        url: 'test',
        channel: 'orders',
        params: {},
      };

      renderHook(() => useBusinessSubscribe(mockOptions));

      const callArgs = (useSubscribe as jest.Mock).mock.calls[0][0];
      expect(callArgs.url).toBe('wss://ws.okx.com:8443/ws/v5/business');
    });
  });

  describe('Type safety', () => {
    it('should accept generic type parameter for usePublicSubscribe', () => {
      interface TickerData {
        instId: string;
        last: string;
      }

      const mockOptions: SubscribeOptions = {
        url: 'test',
        channel: 'tickers',
        params: { instId: 'BTC-USDT' },
      };

      renderHook(() => usePublicSubscribe<TickerData>(mockOptions));

      expect(useSubscribe).toHaveBeenCalled();
    });

    it('should accept generic type parameter for useBusinessSubscribe', () => {
      interface OrderData {
        ordId: string;
        state: string;
      }

      const mockOptions: SubscribeOptions = {
        url: 'test',
        channel: 'orders',
        params: { instType: 'SPOT' },
      };

      renderHook(() => useBusinessSubscribe<OrderData>(mockOptions));

      expect(useSubscribe).toHaveBeenCalled();
    });
  });
});
