import { Order, OrderBook } from "@/types/order-book";
import { TradeContent, MatchingTradeResult as TradeResult } from "@/types/trade";

export class MatchingEngine {
  private TradeContent: TradeContent = {
    openOrders: [],
    positions: []
  };

  constructor(private orderBook: OrderBook) {}

  public executeOrder(order: Order): TradeResult {
    const result: TradeResult = {
      filled: [],
      executedAmount: 0,
      averagePrice: 0
    };

    if (order.side === 'buy') {
      this.matchBuyOrder(order, result);
    } else {
      this.matchSellOrder(order, result);
    }

    this.updateTradeContent(order, result);
    return result;
  }

  private matchBuyOrder(order: Order, result: TradeResult): void {
    let remainingAmount = order.amount;
    let totalCost = 0;

    // sort price by asks price ascending
    const sortedAsks = [...this.orderBook.asks].sort((a, b) => a[0] - b[0]);

    for (const ask of sortedAsks) {
      if (remainingAmount <= 0) break;
      const [askPrice, askAmount] = ask;
      
      // buy order when order price >= ask price,
      if (order.price >= askPrice) {
        const fillAmount = Math.min(remainingAmount, askAmount);
        
        if (fillAmount > 0) {
          result.filled.push({
            price: askPrice,
            amount: fillAmount,
            side: 'buy'
          });
          
          remainingAmount -= fillAmount;
          totalCost += askPrice * fillAmount;
          result.executedAmount += fillAmount;
        }
      }
    }

    // calc average price
    if (result.executedAmount > 0) {
      result.averagePrice = totalCost / result.executedAmount;
    }

    // get open orders
    if (remainingAmount > 0) {
      result.remaining = {
        price: order.price,
        amount: remainingAmount,
        side: 'buy'
      };
    }
  }

  private matchSellOrder(order: Order, result: TradeResult): void {
    let remainingAmount = order.amount;
    let totalValue = 0;

    const sortedBids = [...this.orderBook.bids].sort((a, b) => b[0] - a[0]);

    for (const bid of sortedBids) {
      if (remainingAmount <= 0) break;

      const [bidPrice, bidAmount] = bid;
      
      // order price <= bid price,
      if (order.price <= bidPrice) {
        const fillAmount = Math.min(remainingAmount, bidAmount);
        
        if (fillAmount > 0) {
          result.filled.push({
            price: bidPrice,
            amount: fillAmount,
            side: 'sell'
          });
          
          remainingAmount -= fillAmount;
          totalValue += bidPrice * fillAmount;
          result.executedAmount += fillAmount;
        }
      }
    }

    if (result.executedAmount > 0) {
      result.averagePrice = totalValue / result.executedAmount;
    }

    // remain orders
    if (remainingAmount > 0) {
      result.remaining = {
        price: order.price,
        amount: remainingAmount,
        side: 'sell'
      };
    }
  }

  private updateTradeContent(order: Order, result: TradeResult): void {
    // add filled orders to positions
    if (order.side === 'buy') {
      result.filled.forEach(fill => {
        this.TradeContent.positions.push({
          ...fill,
          id: this.generateOrderId(),
          timestamp: Date.now()
        });
      });
    } else if (order.side === 'sell') {
      result.filled.forEach(filled => {
        this.TradeContent.positions = this.TradeContent.positions.filter((item) => {
          // mock storage selled.
          return item.price <= filled.price;
        });
      });
    }

    // handle remaining orders
    if (result.remaining) {
      this.TradeContent.openOrders.push({
        ...result.remaining,
        id: this.generateOrderId(),
        timestamp: Date.now()
      });
    }
  }

  // update order book, for extand.
  public updateOrderBook(orderBook: OrderBook): void {
    this.orderBook = orderBook;
  }

  public getTradeContent(): TradeContent {
    return { ...this.TradeContent };
  }

  public clearTradeContent(): void {
    this.TradeContent = {
      openOrders: [],
      positions: []
    };
  }

  public generateOrderId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}