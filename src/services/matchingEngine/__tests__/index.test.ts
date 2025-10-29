import { MatchingEngine } from '../index';
import { OrderBook } from '@/types/order-book';

describe('MatchingEngine', () => {
  let orderBook: OrderBook;
  let engine: MatchingEngine;

  beforeEach(() => {
    orderBook = {
      bids: [
        [50000, 1],
        [49900, 2],
        [49800, 3],
      ],
      asks: [
        [50100, 1],
        [50200, 2],
        [50300, 3],
      ],
    };
    engine = new MatchingEngine(orderBook);
  });

  describe('初始化', () => {
    it('应该使用订单簿创建引擎', () => {
      expect(engine).toBeInstanceOf(MatchingEngine);
    });
  });

  describe('买单撮合', () => {
    it('应该完全撮合买单', () => {
      const order = {
        id: 'test-1',
        price: 50200,
        amount: 1,
        side: 'buy' as const,
        timestamp: Date.now(),
      };

      const result = engine.executeOrder(order);

      expect(result.filled.length).toBeGreaterThan(0);
      expect(result.executedAmount).toBe(1);
      expect(result.filled[0].price).toBe(50100);
    });

    it('应该部分撮合买单', () => {
      const order = {
        id: 'test-2',
        price: 50150,
        amount: 5,
        side: 'buy' as const,
        timestamp: Date.now(),
      };

      const result = engine.executeOrder(order);

      expect(result.executedAmount).toBe(1);
      expect(result.remaining).toBeDefined();
      expect(result.remaining?.amount).toBe(4);
    });

    it('应该计算买单平均价格', () => {
      const order = {
        id: 'test-3',
        price: 50300,
        amount: 3,
        side: 'buy' as const,
        timestamp: Date.now(),
      };

      const result = engine.executeOrder(order);

      expect(result.averagePrice).toBeGreaterThan(0);
      expect(result.executedAmount).toBe(3);
    });

    it('当价格过低时不应撮合', () => {
      const order = {
        id: 'test-4',
        price: 50000,
        amount: 1,
        side: 'buy' as const,
        timestamp: Date.now(),
      };

      const result = engine.executeOrder(order);

      expect(result.executedAmount).toBe(0);
      expect(result.filled.length).toBe(0);
      expect(result.remaining).toBeDefined();
      expect(result.remaining?.amount).toBe(1);
    });
  });

  describe('卖单撮合', () => {
    it('应该完全撮合卖单', () => {
      const order = {
        id: 'test-5',
        price: 49900,
        amount: 1,
        side: 'sell' as const,
        timestamp: Date.now(),
      };

      const result = engine.executeOrder(order);

      expect(result.filled.length).toBeGreaterThan(0);
      expect(result.executedAmount).toBe(1);
      expect(result.filled[0].price).toBe(50000);
    });

    it('应该部分撮合卖单', () => {
      const order = {
        id: 'test-6',
        price: 49950,
        amount: 5,
        side: 'sell' as const,
        timestamp: Date.now(),
      };

      const result = engine.executeOrder(order);

      expect(result.executedAmount).toBe(1);
      expect(result.remaining).toBeDefined();
      expect(result.remaining?.amount).toBe(4);
    });

    it('应该计算卖单平均价格', () => {
      const order = {
        id: 'test-7',
        price: 49800,
        amount: 3,
        side: 'sell' as const,
        timestamp: Date.now(),
      };

      const result = engine.executeOrder(order);

      expect(result.averagePrice).toBeGreaterThan(0);
      expect(result.executedAmount).toBe(3);
    });

    it('当价格过高时不应撮合', () => {
      const order = {
        id: 'test-8',
        price: 50100,
        amount: 1,
        side: 'sell' as const,
        timestamp: Date.now(),
      };

      const result = engine.executeOrder(order);

      expect(result.executedAmount).toBe(0);
      expect(result.filled.length).toBe(0);
      expect(result.remaining).toBeDefined();
      expect(result.remaining?.amount).toBe(1);
    });
  });

  describe('交易内容管理', () => {
    it('应该返回交易内容', () => {
      const content = engine.getTradeContent();
      
      expect(content).toHaveProperty('openOrders');
      expect(content).toHaveProperty('positions');
      expect(Array.isArray(content.openOrders)).toBe(true);
      expect(Array.isArray(content.positions)).toBe(true);
    });

    it('应该在买单后更新持仓', () => {
      const order = {
        id: 'test-9',
        price: 50200,
        amount: 1,
        side: 'buy' as const,
        timestamp: Date.now(),
      };

      engine.executeOrder(order);
      const content = engine.getTradeContent();

      expect(content.positions.length).toBeGreaterThan(0);
    });

    it('应该清空交易内容', () => {
      const order = {
        id: 'test-10',
        price: 50200,
        amount: 1,
        side: 'buy' as const,
        timestamp: Date.now(),
      };

      engine.executeOrder(order);
      engine.clearTradeContent();
      
      const content = engine.getTradeContent();
      expect(content.openOrders.length).toBe(0);
      expect(content.positions.length).toBe(0);
    });
  });

  describe('订单簿更新', () => {
    it('应该更新订单簿', () => {
      const newOrderBook: OrderBook = {
        bids: [
          [51000, 1],
          [50900, 2],
        ],
        asks: [
          [51100, 1],
          [51200, 2],
        ],
      };

      engine.updateOrderBook(newOrderBook);

      const order = {
        id: 'test-11',
        price: 51200,
        amount: 1,
        side: 'buy' as const,
        timestamp: Date.now(),
      };

      const result = engine.executeOrder(order);
      
      expect(result.filled[0].price).toBe(51100);
    });
  });

  describe('订单 ID 生成', () => {
    it('应该生成唯一的订单 ID', () => {
      const id1 = engine.generateOrderId();
      const id2 = engine.generateOrderId();

      expect(id1).toContain('order_');
      expect(id2).toContain('order_');
      expect(id1).not.toBe(id2);
    });

    it('生成的 ID 应该包含时间戳', () => {
      const id = engine.generateOrderId();
      expect(id).toMatch(/^order_\d+_[a-z0-9]+$/);
    });
  });

  describe('边界情况', () => {
    it('应该处理零数量订单', () => {
      const order = {
        id: 'test-12',
        price: 50200,
        amount: 0,
        side: 'buy' as const,
        timestamp: Date.now(),
      };

      const result = engine.executeOrder(order);

      expect(result.executedAmount).toBe(0);
      expect(result.filled.length).toBe(0);
    });

    it('应该处理空订单簿', () => {
      const emptyOrderBook: OrderBook = {
        bids: [],
        asks: [],
      };

      const emptyEngine = new MatchingEngine(emptyOrderBook);

      const order = {
        id: 'test-13',
        price: 50000,
        amount: 1,
        side: 'buy' as const,
        timestamp: Date.now(),
      };

      const result = emptyEngine.executeOrder(order);

      expect(result.executedAmount).toBe(0);
      expect(result.remaining).toBeDefined();
    });

    it('应该处理大额订单', () => {
      const order = {
        id: 'test-14',
        price: 51000,
        amount: 100,
        side: 'buy' as const,
        timestamp: Date.now(),
      };

      const result = engine.executeOrder(order);

      expect(result.executedAmount).toBeLessThanOrEqual(100);
      expect(result.remaining).toBeDefined();
    });
  });
});
