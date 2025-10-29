import useSWR from "swr";

export const useTicker = (symbol: string) => 
  useSWR(
    ['ticker', symbol]
  );

export const useKlines = ({ symbol, interval, limit = 100 }: { symbol: string; interval: string; limit?: number }) => 
  useSWR(
    ['klines', symbol, interval, limit]
  );

export const useOrderBook = ({ symbol, limit = 20 }: { symbol: string; limit?: number }) => 
  useSWR(
    ['orderBook', symbol, limit]
  );
