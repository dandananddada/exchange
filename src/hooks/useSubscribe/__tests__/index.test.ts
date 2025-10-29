/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from '@testing-library/react';
import { useSubscribe } from '../index';
import useSWRSubscription from 'swr/subscription';

jest.mock('swr/subscription');
jest.mock('@/adapters/ws/OKXWebSocket');

describe('useSubscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本功能', () => {
    it('应该在 url 未提供时抛出错误', () => {
      const mockUseSWRSubscription = useSWRSubscription as jest.MockedFunction<typeof useSWRSubscription>;
      mockUseSWRSubscription.mockReturnValue({
        data: undefined,
        error: undefined,
      } as any);

      expect(() => {
        renderHook(() => useSubscribe({ channel: 'test', url: '' }));
      }).toThrow('WebSocket URL is required');
    });

    it('应该在选项为 null 时抛出错误', () => {
      const mockUseSWRSubscription = useSWRSubscription as jest.MockedFunction<typeof useSWRSubscription>;
      mockUseSWRSubscription.mockReturnValue({
        data: undefined,
        error: undefined,
      } as any);

      expect(() => {
        renderHook(() => useSubscribe(null));
      }).toThrow('WebSocket URL is required');
    });

    it('应该使用正确的参数调用 useSWRSubscription', () => {
      const mockUseSWRSubscription = useSWRSubscription as jest.MockedFunction<typeof useSWRSubscription>;
      mockUseSWRSubscription.mockReturnValue({
        data: undefined,
        error: undefined,
      } as any);

      renderHook(() =>
        useSubscribe({
          url: 'ws://localhost:8080',
          channel: 'books:BTC-USDT',
        })
      );

      expect(useSWRSubscription).toHaveBeenCalledWith(
        'books:BTC-USDT',
        expect.any(Function),
        expect.objectContaining({
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          shouldRetryOnError: true,
          errorRetryInterval: 3000,
        })
      );
    });

    it('当 enabled 为 false 时应该传递 null 作为 key', () => {
      const mockUseSWRSubscription = useSWRSubscription as jest.MockedFunction<typeof useSWRSubscription>;
      mockUseSWRSubscription.mockReturnValue({
        data: undefined,
        error: undefined,
      } as any);

      renderHook(() =>
        useSubscribe({
          url: 'ws://localhost:8080',
          channel: 'books:BTC-USDT',
          enabled: false,
        })
      );

      expect(useSWRSubscription).toHaveBeenCalledWith(
        null,
        expect.any(Function),
        expect.any(Object)
      );
    });
  });

  describe('返回值', () => {
    it('应该返回正确的初始状态', () => {
      const mockUseSWRSubscription = useSWRSubscription as jest.MockedFunction<typeof useSWRSubscription>;
      mockUseSWRSubscription.mockReturnValue({
        data: undefined,
        error: undefined,
      } as any);

      const { result } = renderHook(() =>
        useSubscribe({
          url: 'ws://localhost:8080',
          channel: 'books:BTC-USDT',
        })
      );

      expect(result.current).toEqual({
        data: undefined,
        error: undefined,
        isLoading: true,
        isConnected: false,
      });
    });

    it('应该在有数据时返回 isLoading 为 false', () => {
      const mockUseSWRSubscription = useSWRSubscription as jest.MockedFunction<typeof useSWRSubscription>;
      mockUseSWRSubscription.mockReturnValue({
        data: { test: 'data' },
        error: undefined,
      } as any);

      const { result } = renderHook(() =>
        useSubscribe({
          url: 'ws://localhost:8080',
          channel: 'books:BTC-USDT',
        })
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual({ test: 'data' });
    });

    it('应该在有错误时返回 isLoading 为 false', () => {
      const mockUseSWRSubscription = useSWRSubscription as jest.MockedFunction<typeof useSWRSubscription>;
      const mockError = new Error('Connection failed');
      mockUseSWRSubscription.mockReturnValue({
        data: undefined,
        error: mockError,
      } as any);

      const { result } = renderHook(() =>
        useSubscribe({
          url: 'ws://localhost:8080',
          channel: 'books:BTC-USDT',
        })
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(mockError);
    });

    it('当 enabled 为 false 时应该返回 isConnected 为 false', () => {
      const mockUseSWRSubscription = useSWRSubscription as jest.MockedFunction<typeof useSWRSubscription>;
      mockUseSWRSubscription.mockReturnValue({
        data: undefined,
        error: undefined,
      } as any);

      const { result } = renderHook(() =>
        useSubscribe({
          url: 'ws://localhost:8080',
          channel: 'books:BTC-USDT',
          enabled: false,
        })
      );

      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('配置选项', () => {
    it('应该支持自定义 reconnect 选项为 false', () => {
      const mockUseSWRSubscription = useSWRSubscription as jest.MockedFunction<typeof useSWRSubscription>;
      mockUseSWRSubscription.mockReturnValue({
        data: undefined,
        error: undefined,
      } as any);

      renderHook(() =>
        useSubscribe({
          url: 'ws://localhost:8080',
          channel: 'books:BTC-USDT',
          reconnect: false,
        })
      );

      expect(useSWRSubscription).toHaveBeenCalledWith(
        'books:BTC-USDT',
        expect.any(Function),
        expect.objectContaining({
          shouldRetryOnError: false,
        })
      );
    });

    it('应该使用默认的 reconnect 值为 true', () => {
      const mockUseSWRSubscription = useSWRSubscription as jest.MockedFunction<typeof useSWRSubscription>;
      mockUseSWRSubscription.mockReturnValue({
        data: undefined,
        error: undefined,
      } as any);

      renderHook(() =>
        useSubscribe({
          url: 'ws://localhost:8080',
          channel: 'books:BTC-USDT',
        })
      );

      expect(useSWRSubscription).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Function),
        expect.objectContaining({
          shouldRetryOnError: true,
        })
      );
    });
  });
});