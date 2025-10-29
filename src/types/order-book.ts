export interface Order {
  price: number;    // 订单价格
  amount: number;   // 订单数量
  side: 'buy' | 'sell'; // 订单类型
}

export interface OrderBook {
  bids: [number, number][]; // [price, amount]
  asks: [number, number][];
}