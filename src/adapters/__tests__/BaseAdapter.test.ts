import { BaseAdapter } from '../BaseAdapter';
import { UnifiedMarketData, OrderRequest, UnifiedOrder, UnifiedBalance, AdapterConfig, ResponseInterceptor } from '@/types/adapter.types';

// A concrete implementation of BaseAdapter for testing purposes
class TestAdapter extends BaseAdapter {
  readonly name = 'TestAdapter';
  baseURL = 'https://api.test.com';

  getTicker(symbol: string): Promise<UnifiedMarketData> {
    return this.request(`/ticker?symbol=${symbol}`);
  }

  // Implement other abstract methods for the sake of compilation
  getKlines(symbol: string, interval: string, limit?: number): Promise<unknown[]> {
    return Promise.resolve([]);
  }
  getOrderBook(symbol: string, limit?: number): Promise<unknown> {
    return Promise.resolve({});
  }
  createOrder(order: OrderRequest): Promise<UnifiedOrder> {
    throw new Error('Method not implemented.');
  }
  cancelOrder(orderId: string, symbol: string): Promise<boolean> {
    return Promise.resolve(false);
  }
  getOrder(orderId: string, symbol: string): Promise<UnifiedOrder> {
    throw new Error('Method not implemented.');
  }
  getOpenOrders(symbol?: string): Promise<UnifiedOrder[]> {
    return Promise.resolve([]);
  }
  getBalance(): Promise<UnifiedBalance> {
    throw new Error('Method not implemented.');
  }
  getAccountInfo(): Promise<unknown> {
    return Promise.resolve({});
  }
}

// Mock fetch
global.fetch = jest.fn();

describe('BaseAdapter', () => {
  let adapter: TestAdapter;

  beforeEach(() => {
    adapter = new TestAdapter();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Configuration', () => {
    it('should be configurable', () => {
      const config: AdapterConfig = { apiKey: 'test-key', testnet: true };
      adapter.configure(config);
      expect(adapter.getConfig()).toEqual(config);
    });

    it('should merge configurations', () => {
      adapter.configure({ apiKey: 'initial-key' });
      adapter.configure({ apiSecret: 'secret' });
      expect(adapter.getConfig()).toEqual({
        apiKey: 'initial-key',
        apiSecret: 'secret',
      });
    });
  });

  describe('Response Interceptors', () => {
    it('should add and apply a response interceptor', async () => {
      const mockResponse = { data: 'original' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const interceptor: ResponseInterceptor<{ data: string }, { data: string }> = (data) => ({
        data: data.data.toUpperCase(),
      });
      adapter.addResponseInterceptor('getTicker', interceptor);

      const result = await adapter.getTicker('BTC-USDT');
      expect(result).toEqual({ data: 'original' });
    });

    it('should remove a response interceptor', async () => {
      const mockResponse = { data: 'original' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const interceptor: ResponseInterceptor<{ data: string }, { data: string }> = (data) => ({
        data: data.data.toUpperCase(),
      });
      adapter.addResponseInterceptor('getTicker', interceptor);
      adapter.removeResponseInterceptor('getTicker');

      const result = await adapter.getTicker('BTC-USDT');
      expect(result).toEqual(mockResponse);
    });

    it('should clear all response interceptors', async () => {
      const mockResponse = { data: 'original' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const interceptor: ResponseInterceptor<{ data: string }, { data: string }> = (data) => ({
        data: data.data.toUpperCase(),
      });
      adapter.addResponseInterceptor('getTicker', interceptor);
      adapter.clearResponseInterceptors();

      const result = await adapter.getTicker('BTC-USDT');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Request Handling', () => {
    it('should make a successful request', async () => {
      const mockResponse = { success: true };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await adapter.getTicker('BTC-USDT');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/ticker?symbol=BTC-USDT',
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
