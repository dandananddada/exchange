import { OKXAdapter } from '../OKXAdapter';
import { OrderRequest } from '@/types/adapter.types';

// Mock the fetch function
global.fetch = jest.fn();

describe('OKXAdapter', () => {
  let adapter: OKXAdapter;

  beforeEach(() => {
    adapter = new OKXAdapter();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should have the correct name and baseURL', () => {
    expect(adapter.name).toBe('OKX');
    // @ts-expect-error protected property
    expect(adapter.baseURL).toBe('https://www.okx.com');
  });

  describe('getTicker', () => {
    it('should fetch and format ticker data correctly', async () => {
      const mockApiResponse = {
        code: '0',
        msg: '',
        data: [
          {
            instId: 'BTC-USDT',
            last: '60000',
            high24h: '61000',
            low24h: '59000',
            vol24h: '1000',
            askPx: '60001',
            bidPx: '59999',
            open24h: '59500',
          },
        ],
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      const ticker = await adapter.getTicker('BTC-USDT');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT',
        expect.any(Object)
      );
      expect(ticker).toEqual({
        symbol: 'BTC-USDT',
        price: 60000,
        high24h: 61000,
        low24h: 59000,
        volume: 1000,
        topSellPrice: 60001,
        topBuyPrice: 59999,
        priceChange: 500,
        priceChangePercent: (500 / 59500) * 100,
        timestamp: expect.any(Number),
      });
    });
  });

  describe('getKlines', () => {
    it('should fetch and format kline data correctly', async () => {
      const mockApiResponse = {
        code: '0',
        msg: '',
        data: [
          ['1622505600000', '50000', '51000', '49000', '50500', '100', '5000000'],
        ],
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      const klines = await adapter.getKlines('BTC-USDT', '1m', 1);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.okx.com/api/v5/market/candles?instId=BTC-USDT&bar=1m&limit=1',
        expect.any(Object)
      );
      expect(klines).toEqual([
        [
          '1622505600000',
          '50000',
          '51000',
          '49000',
          '50500',
          '100',
          '5000000',
        ]
      ]);
    });
  });

  describe('getOrderBook', () => {
    it('should fetch and format order book data', async () => {
        const mockApiResponse = {
            code: '0',
            msg: '',
            data: [{
                asks: [['50001', '1']],
                bids: [['50000', '2']],
            }]
        };
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApiResponse),
        });

        const orderBook = await adapter.getOrderBook('BTC-USDT', 1);
        expect(orderBook).toEqual({
            asks: [[50001, 1]],
            bids: [[50000, 2]],
            timestamp: expect.any(Number),
        });
    });
  });

  describe('createOrder', () => {
    it('should send a create order request and format the response', async () => {
        const order: OrderRequest = { symbol: 'BTC-USDT', side: 'buy', type: 'limit', quantity: 1, price: 50000 };
        const mockApiResponse = {
            code: '0',
            msg: '',
            data: [{ ordId: '12345' }]
        };
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApiResponse),
        });

        const result = await adapter.createOrder(order);
        expect(result).toEqual({
            id: '12345',
            symbol: 'BTC-USDT',
            side: 'buy',
            type: 'limit',
            price: 50000,
            quantity: 1,
            status: 'open',
            timestamp: expect.any(Number),
        });
    });
  });
});
