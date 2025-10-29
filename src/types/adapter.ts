export interface GetKlinesParams {
  symbol: string;
  interval: string;
  limit?: number;
}

export interface UnifiedKlineData {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

export interface UnifiedOrderBookData {
  bids: [number, number][];
  asks: [number, number][];
}

export interface CreateOrderParams {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market';
  quantity: number;
  price?: number;
}

export interface CancelOrderParams {
  symbol: string;
  id: string;
}

export interface GetOrderParams {
  symbol: string;
  id: string;
}

export interface UnifiedOrderData {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market';
  price: number;
  quantity: number;
  status: string;
  timestamp: number;
}

export interface UnifiedBalanceData {
  [key: string]: {
    available: number;
    locked: number;
    total: number;
  };
}

export interface UnifiedMarketData {
  symbol: string;
  price: number;
  high: number;
  low: number;
  volume: number;
  timestamp: number;
}