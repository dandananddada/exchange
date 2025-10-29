import { Order, OrderBook } from '@/types/order-book';
import { OrderParams, TradeOrder, TradeResult } from '@/types/trade';

export interface TradeStoreState<T> {
  openOrders: TradeOrder[];
  positions: TradeOrder[];
  orderHistory: TradeOrder[];

  engine: T | null;
  
  initializeEngine: (orderBook: OrderBook) => void;
  executeOrder: (orderParams: OrderParams) => TradeResult;
  cancelOrder: (orderId: string) => void;
  updateOrderBook: (orderBook: OrderBook) => void;
  clearStore: () => void;
  
  getOpenOrdersBySide: (side: 'buy' | 'sell') => Order[];
  getPositionsBySide: (side: 'buy' | 'sell') => Order[];
  getTotalPositionValue: () => number;
}