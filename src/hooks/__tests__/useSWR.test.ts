import { renderHook } from '@testing-library/react';
import { useTicker, useKlines, useOrderBook } from '../useSWR';
import useSWR from 'swr';

// Mock swr
jest.mock('swr');

describe('useSWR hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useTicker', () => {
    it('should call useSWR with correct key', () => {
      const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      renderHook(() => useTicker('BTC-USDT'));

      expect(useSWR).toHaveBeenCalledWith(['ticker', 'BTC-USDT']);
    });

    it('should handle different symbols', () => {
      const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      renderHook(() => useTicker('ETH-USDT'));

      expect(useSWR).toHaveBeenCalledWith(['ticker', 'ETH-USDT']);
    });
  });

  describe('useKlines', () => {
    it('should call useSWR with correct key and default limit', () => {
      const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      renderHook(() =>
        useKlines({
          symbol: 'BTC-USDT',
          interval: '1m',
        })
      );

      expect(useSWR).toHaveBeenCalledWith(['klines', 'BTC-USDT', '1m', 100]);
    });

    it('should call useSWR with custom limit', () => {
      const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      renderHook(() =>
        useKlines({
          symbol: 'ETH-USDT',
          interval: '5m',
          limit: 200,
        })
      );

      expect(useSWR).toHaveBeenCalledWith(['klines', 'ETH-USDT', '5m', 200]);
    });

    it('should handle different intervals', () => {
      const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      const intervals = ['1m', '5m', '15m', '1H', '1D'];

      intervals.forEach((interval) => {
        renderHook(() =>
          useKlines({
            symbol: 'BTC-USDT',
            interval,
          })
        );
      });

      intervals.forEach((interval) => {
        expect(useSWR).toHaveBeenCalledWith(['klines', 'BTC-USDT', interval, 100]);
      });
    });
  });

  describe('useOrderBook', () => {
    it('should call useSWR with correct key and default limit', () => {
      const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      renderHook(() =>
        useOrderBook({
          symbol: 'BTC-USDT',
        })
      );

      expect(useSWR).toHaveBeenCalledWith(['orderBook', 'BTC-USDT', 20]);
    });

    it('should call useSWR with custom limit', () => {
      const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      renderHook(() =>
        useOrderBook({
          symbol: 'ETH-USDT',
          limit: 50,
        })
      );

      expect(useSWR).toHaveBeenCalledWith(['orderBook', 'ETH-USDT', 50]);
    });

    it('should handle different symbols', () => {
      const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      const symbols = ['BTC-USDT', 'ETH-USDT', 'BNB-USDT'];

      symbols.forEach((symbol) => {
        renderHook(() => useOrderBook({ symbol }));
      });

      symbols.forEach((symbol) => {
        expect(useSWR).toHaveBeenCalledWith(['orderBook', symbol, 20]);
      });
    });
  });
});
