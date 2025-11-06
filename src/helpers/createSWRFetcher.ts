// lib/swr-fetcher.ts
'use client';
import { IExchangeAdapter } from '@/types/adapter.types';

// SWR 键类型
export type SWRKey = string | [string, ...unknown[]];

// 通用的数据获取函数
export const createFetcher = (adapter: IExchangeAdapter) => {
  // Support both SWR calling styles:
  // 1) swr calls fetcher(key) where key is an array: fetcher(['klines', symbol, ...])
  // 2) swr spreads array and calls fetcher(...key): fetcher('klines', symbol, ...)
  return async <T = unknown>(...keyArgs: unknown[]): Promise<T> => {
    // normalize to array key
    const key = keyArgs.length === 1 && Array.isArray(keyArgs[0]) ? (keyArgs[0] as SWRKey) : (keyArgs as SWRKey);

    if (typeof key === 'string') {
      throw new Error('Invalid SWR key format');
    }
    const [endpoint, ...args] = key as unknown[];

    switch (endpoint) {
      case 'ticker':
        return adapter.getTicker(args[0] as string) as Promise<T>;
      
      case 'klines':
        return adapter.getKlines(args[0] as string, args[1] as string, args[2] as number) as Promise<T>;

      case 'orderBook':
        return adapter.getOrderBook(args[0] as string, args[1] as number) as Promise<T>;

      case 'balance':
        return adapter.getBalance() as Promise<T>;
      
      case 'openOrders':
        return adapter.getOpenOrders(args[0] as string) as Promise<T>;
      
      case 'accountInfo':
        return adapter.getAccountInfo() as Promise<T>;
      
      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }
  };
};
