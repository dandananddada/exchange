import { renderHook, waitFor } from '@testing-library/react';
import { useMarketData } from '../useMarketData';
import { useMarketStore } from '@/stores/marketStore';
import { useTicker } from '@/hooks/useSWR';

// Mock dependencies
jest.mock('@/stores/marketStore');
jest.mock('@/hooks/useSWR');

describe('useMarketData', () => {
  const mockMarketData = {
    'BTC-USDT': {
      instId: 'BTC-USDT',
      last: '50000',
      open24h: '48000',
      high24h: '51000',
      low24h: '47000',
      vol24h: '1000',
      change: 2000,
      changePercent: 4.17,
    },
  };

  const mockStore = {
    marketData: mockMarketData,
    loading: false,
    error: null,
    lastUpdated: Date.now(),
    setMarketData: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
    getMarketData: jest.fn((symbol) => mockMarketData[symbol]),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useMarketStore as unknown as jest.Mock).mockReturnValue(mockStore);
    (useTicker as jest.Mock).mockReturnValue({ data: mockMarketData['BTC-USDT'] });
  });

  it('should return market data for specific symbol', () => {
    const { result } = renderHook(() => useMarketData('BTC-USDT'));

    expect(result.current.data).toEqual(mockMarketData['BTC-USDT']);
    expect(result.current.hasData).toBe(true);
  });

  it('should return undefined when no symbol provided', () => {
    const { result } = renderHook(() => useMarketData());

    expect(result.current.data).toBeUndefined();
    expect(result.current.hasData).toBe(false);
  });

  it('should detect positive change', () => {
    const { result } = renderHook(() => useMarketData('BTC-USDT'));

    expect(result.current.isPositiveChange).toBe(true);
    expect(result.current.isNegativeChange).toBe(false);
  });

  it('should detect negative change', () => {
    const negativeData = {
      ...mockMarketData['BTC-USDT'],
      change: -1000,
    };

    mockStore.getMarketData.mockReturnValue(negativeData);

    const { result } = renderHook(() => useMarketData('BTC-USDT'));

    expect(result.current.isPositiveChange).toBe(false);
    expect(result.current.isNegativeChange).toBe(true);
  });

  it('should return all market data', () => {
    const { result } = renderHook(() => useMarketData('BTC-USDT'));

    expect(result.current.allMarketData).toEqual(mockMarketData);
  });

  it('should call useTicker with correct symbol', () => {
    renderHook(() => useMarketData('ETH-USDT'));

    expect(useTicker).toHaveBeenCalledWith('ETH-USDT');
  });

  it('should refresh data when symbol changes', async () => {
    const { rerender } = renderHook(
      ({ symbol }) => useMarketData(symbol),
      { initialProps: { symbol: 'BTC-USDT' } }
    );

    await waitFor(() => {
      expect(mockStore.setMarketData).toHaveBeenCalled();
    });

    rerender({ symbol: 'ETH-USDT' });

    await waitFor(() => {
      expect(useTicker).toHaveBeenCalledWith('ETH-USDT');
    });
  });

  it('should expose loading state', () => {
    mockStore.loading = true;

    const { result } = renderHook(() => useMarketData('BTC-USDT'));

    expect(result.current.loading).toBe(true);
  });

  it('should expose error state', () => {
    mockStore.error = 'Failed to fetch';

    const { result } = renderHook(() => useMarketData('BTC-USDT'));

    expect(result.current.error).toBe('Failed to fetch');
  });

  it('should expose lastUpdated timestamp', () => {
    const timestamp = Date.now();
    mockStore.lastUpdated = timestamp;

    const { result } = renderHook(() => useMarketData('BTC-USDT'));

    expect(result.current.lastUpdated).toBe(timestamp);
  });

  it('should handle zero change', () => {
    const zeroChangeData = {
      ...mockMarketData['BTC-USDT'],
      change: 0,
    };

    mockStore.getMarketData.mockReturnValue(zeroChangeData);

    const { result } = renderHook(() => useMarketData('BTC-USDT'));

    expect(result.current.isPositiveChange).toBe(false);
    expect(result.current.isNegativeChange).toBe(false);
  });

  it('should handle undefined change', () => {
    const undefinedChangeData = {
      ...mockMarketData['BTC-USDT'],
      change: undefined,
    };

    mockStore.getMarketData.mockReturnValue(undefinedChangeData);

    const { result } = renderHook(() => useMarketData('BTC-USDT'));

    expect(result.current.isPositiveChange).toBe(false);
    expect(result.current.isNegativeChange).toBe(false);
  });
});
