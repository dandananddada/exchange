// types/adapter.types.ts

// 响应拦截器类型
export interface ResponseInterceptor<T = unknown, R = unknown> {
  (data: T): R;
}

// 请求配置
export interface RequestConfig {
  timeout?: number;
  retryCount?: number;
  headers?: Record<string, string>;
}

// 统一的市场数据接口
export interface UnifiedMarketData {
  symbol: string;
  price: number;
  high24h: number;
  low24h: number;
  volume: number;
  priceChange: number;
  priceChangePercent: number;
  topSellPrice: number;
  topBuyPrice: number;
  timestamp: number;
}

// 统一的订单数据
export interface UnifiedOrder {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market';
  price: number;
  quantity: number;
  status: 'open' | 'filled' | 'cancelled' | 'partial';
  timestamp: number;
}

// 统一的余额数据
export interface UnifiedBalance {
  [asset: string]: {
    available: number;
    locked: number;
    total: number;
  };
}

// 订单请求
export interface OrderRequest {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market';
  quantity: number;
  price?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
}

// 适配器配置
export interface AdapterConfig {
  apiKey?: string;
  apiSecret?: string;
  passphrase?: string; // For OKX
  testnet?: boolean;
  requestConfig?: RequestConfig;
}

// 核心适配器接口
export interface IExchangeAdapter {
  readonly name: string;
  
  // 市场数据方法
  getTicker(symbol: string): Promise<UnifiedMarketData>;
  getKlines(symbol: string, interval: string, limit?: number): Promise<unknown[]>;
  getOrderBook(symbol: string, limit?: number): Promise<unknown>;
  
  // 交易方法
  createOrder(order: OrderRequest): Promise<UnifiedOrder>;
  cancelOrder(orderId: string, symbol: string): Promise<boolean>;
  getOrder(orderId: string, symbol: string): Promise<UnifiedOrder>;
  getOpenOrders(symbol?: string): Promise<UnifiedOrder[]>;
  
  // 账户方法
  getBalance(): Promise<UnifiedBalance>;
  getAccountInfo(): Promise<unknown>;
  
  // 响应拦截器管理
  addResponseInterceptor<T, R>(
    endpoint: string, 
    interceptor: ResponseInterceptor<T, R>
  ): void;
  removeResponseInterceptor(endpoint: string): void;
  clearResponseInterceptors(): void;
  
  // 配置管理
  configure(config: AdapterConfig): void;
  getConfig(): AdapterConfig;
}
