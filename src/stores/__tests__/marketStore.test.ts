import { renderHook, act } from '@testing-library/react';
import { useMarketStore } from '../marketStore';

describe('marketStore', () => {
  beforeEach(() => {
    localStorage.clear();
    const { result } = renderHook(() => useMarketStore());
    act(() => {
      result.current.clearData();
    });
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const { result } = renderHook(() => useMarketStore());
      
      expect(result.current.marketData).toEqual({});
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.lastUpdated).toBe(0);
    });
  });

  describe('setMarketData', () => {
    it('应该设置单个交易对数据', () => {
      const { result } = renderHook(() => useMarketStore());
      
      act(() => {
        result.current.setMarketData('BTC-USDT', {
          price: 50000,
          topSellPrice: 50100,
          topBuyPrice: 49900,
          change: 5.5,
          volume: 1000000,
          timestamp: Date.now(),
        });
      });
      
      expect(result.current.marketData['BTC-USDT']).toEqual({
        symbol: 'BTC-USDT',
        price: 50000,
        topSellPrice: 50100,
        topBuyPrice: 49900,
        change: 5.5,
        volume: 1000000,
        timestamp: expect.any(Number),
      });
    });

    it('应该更新 lastUpdated', () => {
      const { result } = renderHook(() => useMarketStore());
      const beforeTime = Date.now();
      
      act(() => {
        result.current.setMarketData('BTC-USDT', {
          price: 50000,
          topSellPrice: 50100,
          topBuyPrice: 49900,
          change: 5.5,
          volume: 1000000,
          timestamp: Date.now(),
        });
      });
      
      expect(result.current.lastUpdated).toBeGreaterThanOrEqual(beforeTime);
    });

    it('应该清除错误', () => {
      const { result } = renderHook(() => useMarketStore());
      
      act(() => {
        result.current.setError('Test error');
      });
      
      expect(result.current.error).toBe('Test error');
      
      act(() => {
        result.current.setMarketData('BTC-USDT', {
          price: 50000,
          topSellPrice: 50100,
          topBuyPrice: 49900,
          change: 5.5,
          volume: 1000000,
          timestamp: Date.now(),
        });
      });
      
      expect(result.current.error).toBeNull();
    });
  });

  describe('setMultipleMarketData', () => {
    it('应该批量设置市场数据', () => {
      const { result } = renderHook(() => useMarketStore());
      
      const mockData = [
        {
          symbol: 'BTC-USDT',
          price: 50000,
          topSellPrice: 50100,
          topBuyPrice: 49900,
          change: 5.5,
          volume: 1000000,
          timestamp: Date.now(),
        },
        {
          symbol: 'ETH-USDT',
          price: 3000,
          topSellPrice: 3050,
          topBuyPrice: 2950,
          change: 3.2,
          volume: 500000,
          timestamp: Date.now(),
        },
      ];
      
      act(() => {
        result.current.setMultipleMarketData(mockData);
      });
      
      expect(result.current.marketData['BTC-USDT']).toBeDefined();
      expect(result.current.marketData['ETH-USDT']).toBeDefined();
      expect(result.current.marketData['BTC-USDT'].price).toBe(50000);
      expect(result.current.marketData['ETH-USDT'].price).toBe(3000);
    });

    it('应该保留现有数据', () => {
      const { result } = renderHook(() => useMarketStore());
      
      act(() => {
        result.current.setMarketData('BTC-USDT', {
          price: 50000,
          topSellPrice: 50100,
          topBuyPrice: 49900,
          change: 5.5,
          volume: 1000000,
          timestamp: Date.now(),
        });
      });
      
      act(() => {
        result.current.setMultipleMarketData([
          {
            symbol: 'ETH-USDT',
            price: 3000,
            topSellPrice: 3050,
            topBuyPrice: 2950,
            change: 3.2,
            volume: 500000,
            timestamp: Date.now(),
          },
        ]);
      });
      
      expect(result.current.marketData['BTC-USDT']).toBeDefined();
      expect(result.current.marketData['ETH-USDT']).toBeDefined();
    });
  });

  describe('updatePrice', () => {
    it('应该更新价格和变化百分比', () => {
      const { result } = renderHook(() => useMarketStore());
      
      act(() => {
        result.current.setMarketData('BTC-USDT', {
          price: 50000,
          topSellPrice: 50100,
          topBuyPrice: 49900,
          change: 5.5,
          volume: 1000000,
          timestamp: Date.now(),
        });
      });
      
      act(() => {
        result.current.updatePrice('BTC-USDT', 52000);
      });
      
      const marketData = result.current.marketData['BTC-USDT'];
      expect(marketData.price).toBe(52000);
      expect(marketData.change).toBeCloseTo(4, 1); // (52000 - 50000) / 50000 * 100 = 4
    });

    it('应该在交易对不存在时不做任何操作', () => {
      const { result } = renderHook(() => useMarketStore());
      
      const beforeMarketData = { ...result.current.marketData };
      
      act(() => {
        result.current.updatePrice('NON-EXISTENT', 10000);
      });
      
      expect(result.current.marketData).toEqual(beforeMarketData);
    });
  });

  describe('getMarketData', () => {
    it('应该返回指定交易对的数据', () => {
      const { result } = renderHook(() => useMarketStore());
      
      act(() => {
        result.current.setMarketData('BTC-USDT', {
          price: 50000,
          topSellPrice: 50100,
          topBuyPrice: 49900,
          change: 5.5,
          volume: 1000000,
          timestamp: Date.now(),
        });
      });
      
      const data = result.current.getMarketData('BTC-USDT');
      expect(data).toBeDefined();
      expect(data?.symbol).toBe('BTC-USDT');
      expect(data?.price).toBe(50000);
    });

    it('应该在交易对不存在时返回 undefined', () => {
      const { result } = renderHook(() => useMarketStore());
      
      const data = result.current.getMarketData('NON-EXISTENT');
      expect(data).toBeUndefined();
    });
  });

  describe('setLoading', () => {
    it('应该设置加载状态', () => {
      const { result } = renderHook(() => useMarketStore());
      
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.loading).toBe(true);
    });

    it('应该在开始加载时清除错误', () => {
      const { result } = renderHook(() => useMarketStore());
      
      act(() => {
        result.current.setError('Test error');
      });
      
      expect(result.current.error).toBe('Test error');
      
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.error).toBeNull();
    });
  });

  describe('setError', () => {
    it('应该设置错误信息', () => {
      const { result } = renderHook(() => useMarketStore());
      
      act(() => {
        result.current.setError('Connection failed');
      });
      
      expect(result.current.error).toBe('Connection failed');
      expect(result.current.loading).toBe(false);
    });

    it('应该清除错误信息', () => {
      const { result } = renderHook(() => useMarketStore());
      
      act(() => {
        result.current.setError('Test error');
      });
      
      expect(result.current.error).toBe('Test error');
      
      act(() => {
        result.current.setError(null);
      });
      
      expect(result.current.error).toBeNull();
    });
  });

  describe('clearData', () => {
    it('应该清空所有数据', () => {
      const { result } = renderHook(() => useMarketStore());
      
      act(() => {
        result.current.setMarketData('BTC-USDT', {
          price: 50000,
          topSellPrice: 50100,
          topBuyPrice: 49900,
          change: 5.5,
          volume: 1000000,
          timestamp: Date.now(),
        });
        result.current.setLoading(true);
        result.current.setError('Test error');
      });
      
      act(() => {
        result.current.clearData();
      });
      
      expect(result.current.marketData).toEqual({});
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.lastUpdated).toBe(0);
    });
  });

  describe('持久化', () => {
    it('应该持久化 marketData 和 lastUpdated', () => {
      const { result } = renderHook(() => useMarketStore());
      
      act(() => {
        result.current.setMarketData('BTC-USDT', {
          price: 50000,
          topSellPrice: 50100,
          topBuyPrice: 49900,
          change: 5.5,
          volume: 1000000,
          timestamp: Date.now(),
        });
      });
      
      const stored = localStorage.getItem('market-storage');
      expect(stored).toBeTruthy();
      
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.marketData['BTC-USDT']).toBeDefined();
        expect(parsed.state.lastUpdated).toBeGreaterThan(0);
      }
    });

    it('不应该持久化 loading 和 error', () => {
      const { result } = renderHook(() => useMarketStore());
      
      act(() => {
        result.current.setLoading(true);
        result.current.setError('Test error');
      });
      
      const stored = localStorage.getItem('market-storage');
      
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.loading).toBeUndefined();
        expect(parsed.state.error).toBeUndefined();
      }
    });
  });
});
