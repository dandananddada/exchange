// stores/marketStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MarketState, MarketData } from '@/types/market.types';

interface MarketActions {
  // 设置单个交易对数据
  setMarketData: (symbol: string, data: Omit<MarketData, 'symbol'>) => void;
  // 批量设置市场数据
  setMultipleMarketData: (data: MarketData[]) => void;
  // 更新价格
  updatePrice: (symbol: string, price: number) => void;
  // 获取特定交易对数据
  getMarketData: (symbol: string) => MarketData | undefined;
  // 设置加载状态
  setLoading: (loading: boolean) => void;
  // 设置错误信息
  setError: (error: string | null) => void;
  // 清空数据
  clearData: () => void;
}

// 初始状态
const initialState: MarketState = {
  marketData: {},
  loading: false,
  error: null,
  lastUpdated: 0,
};

export const useMarketStore = create<MarketState & MarketActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 设置单个交易对数据
      setMarketData: (symbol: string, data: Omit<MarketData, 'symbol'>) => {
        set((state) => ({
          marketData: {
            ...state.marketData,
            [symbol]: {
              ...data,
              symbol,
            },
          },
          lastUpdated: Date.now(),
          error: null,
        }));
      },

      // 批量设置市场数据
      setMultipleMarketData: (data: MarketData[]) => {
        const newMarketData: Record<string, MarketData> = {};
        
        data.forEach((item) => {
          newMarketData[item.symbol] = item;
        });

        set((state) => ({
          marketData: {
            ...state.marketData,
            ...newMarketData,
          },
          lastUpdated: Date.now(),
          error: null,
        }));
      },

      // 更新价格
      updatePrice: (symbol: string, price: number) => {
        set((state) => {
          const currentData = state.marketData[symbol];
          if (!currentData) return state;

          const change = ((price - currentData.price) / currentData.price) * 100;

          return {
            marketData: {
              ...state.marketData,
              [symbol]: {
                ...currentData,
                price,
                change,
                timestamp: Date.now(),
              },
            },
            lastUpdated: Date.now(),
          };
        });
      },

      // 获取特定交易对数据
      getMarketData: (symbol: string) => {
        return get().marketData[symbol];
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ loading, error: loading ? null : get().error });
      },

      // 设置错误信息
      setError: (error: string | null) => {
        set({ error, loading: false });
      },

      // 清空数据
      clearData: () => {
        set(initialState);
      },
    }),
    {
      name: 'market-storage', // localStorage 的 key
      partialize: (state) => ({ 
        marketData: state.marketData,
        lastUpdated: state.lastUpdated,
      }), // 只持久化这些字段
    }
  )
);