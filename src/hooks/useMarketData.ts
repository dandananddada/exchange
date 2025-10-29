// hooks/useMarketData.ts
import { useEffect, useMemo } from 'react';
import { useMarketStore } from '@/stores/marketStore';
import { useTicker } from '@/hooks/useSWR';
import { MarketData } from '@/types/market.types';

export const useMarketData = (symbol: string) => {
  const {
    marketData,
    loading,
    error,
    lastUpdated,
    setMarketData,
    setLoading,
    setError,
    getMarketData,
  } = useMarketStore();

  // 获取特定交易对的数据
  const { data } = useTicker(symbol);

  const currentData = useMemo(() => {
    return symbol ? getMarketData(symbol) : undefined;
  }, [symbol, getMarketData, marketData]);

  // 手动刷新数据
  const refreshData = async (data: MarketData, refreshSymbol?: string, ) => {

    const targetSymbol = refreshSymbol || symbol;
    if (!targetSymbol) return;

    try {
      setLoading(true);
      setMarketData(targetSymbol, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!symbol) return;
    refreshData(data, symbol);
  }, [symbol, data]);

  return {
    // 状态
    data: currentData,
    loading,
    error,
    lastUpdated,
    
    // 计算属性
    hasData: !!currentData,
    isPositiveChange: currentData ? (currentData.change || 0) > 0 : false,
    isNegativeChange: currentData ? (currentData.change || 0) < 0 : false,
    
    // 获取所有数据
    allMarketData: marketData,
  };
};