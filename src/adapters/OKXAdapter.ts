// adapters/OKXAdapter.ts
import { BaseAdapter } from './BaseAdapter';
import { 
  UnifiedMarketData, 
  UnifiedOrder, 
  UnifiedBalance, 
  OrderRequest, 
  AdapterConfig
} from '@/types/adapter.types';

export class OKXAdapter extends BaseAdapter {
  readonly name = 'OKX';

  constructor(config?: AdapterConfig) {
    super(config);
    this.baseURL = 'https://www.okx.com';
  }

  async getTicker(symbol: string): Promise<UnifiedMarketData> {
    const data = await this.request<unknown>(`/api/v5/market/ticker?instId=${symbol}`);
    const ticker = data.data[0];

    return this.applyResponseInterceptors('getTicker', {
      symbol: ticker.instId,
      price: parseFloat(ticker.last),
      high24h: parseFloat(ticker.high24h),
      low24h: parseFloat(ticker.low24h),
      volume: parseFloat(ticker.vol24h),
      topSellPrice: parseFloat(ticker.askPx),
      topBuyPrice: parseFloat(ticker.bidPx),
      priceChange: parseFloat(ticker.last) - parseFloat(ticker.open24h),
      priceChangePercent: (parseFloat(ticker.last) - parseFloat(ticker.open24h)) / parseFloat(ticker.open24h) * 100,
      timestamp: Date.now()
    });
  }

  async getKlines(symbol: string, interval: string, limit: number = 100): Promise<unknown[]> {
    const data = await this.request<unknown>(
      `/api/v5/market/candles?instId=${symbol}&bar=${interval}&limit=${limit}`
    );

    return this.applyResponseInterceptors('getKlines', data.data);
  }

  async getOrderBook(symbol: string, limit: number = 20): Promise<unknown> {
    const data = await this.request<unknown>(
      `/api/v5/market/books?instId=${symbol}&sz=${limit}`
    );

    return this.applyResponseInterceptors('getOrderBook', {
      bids: data.data[0].bids.map(([price, quantity]: [string, string]) => 
        [parseFloat(price), parseFloat(quantity)]
      ),
      asks: data.data[0].asks.map(([price, quantity]: [string, string]) => 
        [parseFloat(price), parseFloat(quantity)]
      ),
      timestamp: Date.now()
    });
  }

  async createOrder(order: OrderRequest): Promise<UnifiedOrder> {
    const orderData = {
      instId: order.symbol,
      tdMode: 'cash',
      side: order.side,
      ordType: order.type,
      sz: order.quantity.toString(),
      px: order.price?.toString()
    };

    const data = await this.request<unknown>('/api/v5/trade/order', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });

    return this.applyResponseInterceptors('createOrder', {
      id: data.data[0].ordId,
      symbol: order.symbol,
      side: order.side,
      type: order.type,
      price: order.price || 0,
      quantity: order.quantity,
      status: 'open',
      timestamp: Date.now()
    });
  }

  async cancelOrder(orderId: string, symbol: string): Promise<boolean> {
    try {
      await this.request('/api/v5/trade/cancel-order', {
        method: 'POST',
        body: JSON.stringify({
          instId: symbol,
          ordId: orderId
        })
      });
      return true;
    } catch {
      return false;
    }
  }

  async getOrder(orderId: string, symbol: string): Promise<UnifiedOrder> {
    const data = await this.request<unknown>(
      `/api/v5/trade/order?instId=${symbol}&ordId=${orderId}`
    );
    const order = data.data[0];

    return this.applyResponseInterceptors('getOrder', {
      id: order.ordId,
      symbol: order.instId,
      side: order.side as 'buy' | 'sell',
      type: order.ordType as 'limit' | 'market',
      price: parseFloat(order.px),
      quantity: parseFloat(order.sz),
      status: this.mapOrderStatus(order.state),
      timestamp: parseInt(order.cTime)
    });
  }

  async getOpenOrders(symbol?: string): Promise<UnifiedOrder[]> {
    const endpoint = symbol 
      ? `/api/v5/trade/orders-pending?instId=${symbol}`
      : '/api/v5/trade/orders-pending';

    const data = await this.request<unknown>(endpoint);

    return this.applyResponseInterceptors('getOpenOrders', data.data.map((order: unknown) => ({
      id: order.ordId,
      symbol: order.instId,
      side: order.side as 'buy' | 'sell',
      type: order.ordType as 'limit' | 'market',
      price: parseFloat(order.px),
      quantity: parseFloat(order.sz),
      status: this.mapOrderStatus(order.state),
      timestamp: parseInt(order.cTime)
    })));
  }

  async getBalance(): Promise<UnifiedBalance> {
    const data = await this.request<unknown>('/api/v5/account/balance');
    const balanceData = data.data[0];

    const balance: UnifiedBalance = {};
    balanceData.details.forEach((asset: unknown) => {
      const available = parseFloat(asset.availBal);
      const locked = parseFloat(asset.frozenBal);
      
      balance[asset.ccy] = {
        available,
        locked,
        total: available + locked
      };
    });

    return this.applyResponseInterceptors('getBalance', balance);
  }

  async getAccountInfo(): Promise<unknown> {
    const data = await this.request<unknown>('/api/v5/account/balance');
    return this.applyResponseInterceptors('getAccountInfo', {
      totalEquity: parseFloat(data.data[0].totalEq),
      updateTime: Date.now()
    });
  }

  private mapOrderStatus(state: string): UnifiedOrder['status'] {
    const statusMap: Record<string, UnifiedOrder['status']> = {
      'live': 'open',
      'partially_filled': 'partial',
      'filled': 'filled',
      'canceled': 'cancelled'
    };
    return statusMap[state] || 'open';
  }
}