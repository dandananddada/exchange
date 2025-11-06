/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFetcher } from '../createSWRFetcher';
import { IExchangeAdapter } from '@/types/adapter.types';

describe('createSWRFetcher', () => {
  let mockAdapter: jest.Mocked<IExchangeAdapter>;

  beforeEach(() => {
    mockAdapter = {
      getTicker: jest.fn(),
      getKlines: jest.fn(),
      getOrderBook: jest.fn(),
      getBalance: jest.fn(),
      getOpenOrders: jest.fn(),
      getAccountInfo: jest.fn(),
      subOrderBook: jest.fn(),
    } as any;
  });

  describe('createFetcher', () => {
    it('应该创建一个 fetcher 函数', () => {
      const fetcher = createFetcher(mockAdapter);
      expect(typeof fetcher).toBe('function');
    });

    it('应该处理 ticker 端点', async () => {
      const fetcher = createFetcher(mockAdapter);
      const mockData = { symbol: 'BTC-USDT', price: 50000 };
      mockAdapter.getTicker.mockResolvedValue(mockData);

      const result = await fetcher(['ticker', 'BTC-USDT']);
      
      expect(mockAdapter.getTicker).toHaveBeenCalledWith('BTC-USDT');
      expect(result).toEqual(mockData);
    });

    it('应该处理 klines 端点', async () => {
      const fetcher = createFetcher(mockAdapter);
      const mockData = [[1234567890, 50000, 51000, 49000, 50500, 100]];
      mockAdapter.getKlines.mockResolvedValue(mockData);

      const result = await fetcher(['klines', 'BTC-USDT', '1m', 100]);
      
      expect(mockAdapter.getKlines).toHaveBeenCalledWith('BTC-USDT', '1m', 100);
      expect(result).toEqual(mockData);
    });

    it('应该处理 orderBook 端点', async () => {
      const fetcher = createFetcher(mockAdapter);
      const mockData = { 
        bids: [[50000, 1]], 
        asks: [[50100, 1]] 
      };
      mockAdapter.getOrderBook.mockResolvedValue(mockData);

      const result = await fetcher(['orderBook', 'BTC-USDT', 20]);
      
      expect(mockAdapter.getOrderBook).toHaveBeenCalledWith('BTC-USDT', 20);
      expect(result).toEqual(mockData);
    });

    it('应该处理 balance 端点', async () => {
      const fetcher = createFetcher(mockAdapter);
      const mockData = { USDT: 10000, BTC: 0.5 };
      mockAdapter.getBalance.mockResolvedValue(mockData);

      const result = await fetcher(['balance']);
      
      expect(mockAdapter.getBalance).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('应该处理 openOrders 端点', async () => {
      const fetcher = createFetcher(mockAdapter);
      const mockData = [{ id: '123', symbol: 'BTC-USDT', price: 50000 }];
      mockAdapter.getOpenOrders.mockResolvedValue(mockData);

      const result = await fetcher(['openOrders', 'BTC-USDT']);
      
      expect(mockAdapter.getOpenOrders).toHaveBeenCalledWith('BTC-USDT');
      expect(result).toEqual(mockData);
    });

    it('应该处理 accountInfo 端点', async () => {
      const fetcher = createFetcher(mockAdapter);
      const mockData = { userId: '123', verified: true };
      mockAdapter.getAccountInfo.mockResolvedValue(mockData);

      const result = await fetcher(['accountInfo']);
      
      expect(mockAdapter.getAccountInfo).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('应该处理数组形式的参数', async () => {
      const fetcher = createFetcher(mockAdapter);
      const mockData = { symbol: 'BTC-USDT', price: 50000 };
      mockAdapter.getTicker.mockResolvedValue(mockData);

      const result = await fetcher(['ticker', 'BTC-USDT']);
      
      expect(result).toEqual(mockData);
    });

    it('应该处理展开的参数', async () => {
      const fetcher = createFetcher(mockAdapter);
      const mockData = { symbol: 'BTC-USDT', price: 50000 };
      mockAdapter.getTicker.mockResolvedValue(mockData);

      const result = await fetcher('ticker', 'BTC-USDT');
      
      expect(result).toEqual(mockData);
    });

    it('应该在未知端点时抛出错误', async () => {
      const fetcher = createFetcher(mockAdapter);
      
      await expect(fetcher(['unknown', 'param'])).rejects.toThrow('Unknown endpoint: unknown');
    });
  });
});
