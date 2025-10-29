import { Order } from '@/types/order-book';

export interface MatchingTradeResult {
  filled: Order[]; // 已成交的订单
  remaining?: Order; // 未完全成交的剩余部分
  executedAmount: number; // 总成交数量
  averagePrice?: number; // 成交均价
}

export interface TradeContent {
  openOrders: (Order & { id: string; timestamp: number })[];
  positions: (Order & { id: string; timestamp: number })[];
}

export interface PlaceOrderPayload {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  time: string;
  orderType?: 'limit' | 'market'; // 扩展支持市价单
}

export interface OrderParams {
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  symbol: string;
}

export interface PlaceOrderResult {
  success: boolean;
  orderId?: string;
  filledAmount: number;
  averagePrice: number;
  remainingAmount: number;
  error?: string;
  timestamp: number;
}

export interface UsePlaceOrderReturn {
  placeOrder: (payload: PlaceOrderPayload) => Promise<PlaceOrderResult>;
  isPlacing: boolean;
  lastOrderResult: PlaceOrderResult | null;
  error: string | null;
  reset: () => void;
}

export interface TradeOrder extends Order {
  id: string;
  symbol: string;
  status: 'open' | 'filled' | 'cancelled' | 'partial';
  createdAt: number;
  updatedAt?: number;
}

export interface TradeResult {
  order: Order,
  filled: TradeOrder[];
  remaining?: TradeOrder;
  executedAmount: number;
  averagePrice?: number;
}