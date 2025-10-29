import mergeOrderBook from '../mergeOrderBook';
import { OKXOrderBook } from '@/types/okx';

type OrderBookLevel = OKXOrderBook['asks'] | OKXOrderBook['bids'];

describe('mergeOrderBook', () => {
  describe('基本功能', () => {
    it('应该合并两个空数组', () => {
      const fromData: OrderBookLevel = [];
      const toData: OrderBookLevel = [];
      const result = mergeOrderBook(fromData, toData);
      
      expect(result).toEqual([]);
    });

    it('应该返回单个订单簿数据', () => {
      const fromData: OrderBookLevel = [];
      const toData: OrderBookLevel = [
        ['100', '1', '0', '1'],
        ['99', '2', '0', '2'],
      ];
      const result = mergeOrderBook(fromData, toData);
      
      expect(result).toEqual([
        ['100', '1', '0', '1'],
        ['99', '2', '0', '2'],
      ]);
    });

    it('应该合并两个不重叠的订单簿', () => {
      const fromData: OrderBookLevel = [
        ['102', '1', '0', '1'],
        ['101', '2', '0', '2'],
      ];
      const toData: OrderBookLevel = [
        ['100', '3', '0', '3'],
        ['99', '4', '0', '4'],
      ];
      const result = mergeOrderBook(fromData, toData);
      
      expect(result).toEqual([
        ['102', '1', '0', '1'],
        ['101', '2', '0', '2'],
        ['100', '3', '0', '3'],
        ['99', '4', '0', '4'],
      ]);
    });

    it('应该合并有重叠价格的订单簿（保留第一个出现的）', () => {
      const fromData: OrderBookLevel = [
        ['100', '5', '0', '5'],
      ];
      const toData: OrderBookLevel = [
        ['100', '3', '0', '3'],
        ['99', '4', '0', '4'],
      ];
      const result = mergeOrderBook(fromData, toData);
      
      // toData 中的价格先被添加，所以会保留 toData 的值
      expect(result).toEqual([
        ['100', '3', '0', '3'],
        ['99', '4', '0', '4'],
      ]);
    });
  });

  describe('排序功能', () => {
    it('应该按价格从高到低排序', () => {
      const fromData: OrderBookLevel = [
        ['95', '1', '0', '1'],
        ['105', '2', '0', '2'],
      ];
      const toData: OrderBookLevel = [
        ['100', '3', '0', '3'],
        ['90', '4', '0', '4'],
      ];
      const result = mergeOrderBook(fromData, toData);
      
      expect(result).toEqual([
        ['105', '2', '0', '2'],
        ['100', '3', '0', '3'],
        ['95', '1', '0', '1'],
        ['90', '4', '0', '4'],
      ]);
    });

    it('应该处理浮点数价格', () => {
      const fromData: OrderBookLevel = [
        ['100.5', '1', '0', '1'],
        ['99.5', '2', '0', '2'],
      ];
      const toData: OrderBookLevel = [
        ['100.1', '3', '0', '3'],
        ['99.9', '4', '0', '4'],
      ];
      const result = mergeOrderBook(fromData, toData);
      
      expect(result).toEqual([
        ['100.5', '1', '0', '1'],
        ['100.1', '3', '0', '3'],
        ['99.9', '4', '0', '4'],
        ['99.5', '2', '0', '2'],
      ]);
    });
  });

  describe('限制数量功能', () => {
    it('应该限制返回的订单簿层级数量（默认20）', () => {
      const fromData: OrderBookLevel = Array.from({ length: 15 }, (_, i) => [
        String(100 + i),
        '1',
        '0',
        '1',
      ]);
      const toData: OrderBookLevel = Array.from({ length: 15 }, (_, i) => [
        String(85 + i),
        '1',
        '0',
        '1',
      ]);
      const result = mergeOrderBook(fromData, toData);
      
      expect(result.length).toBe(20);
      // 应该保留价格最高的20个
      expect(result[0][0]).toBe('114');
      expect(result[19][0]).toBe('95');
    });

    it('应该支持自定义限制数量', () => {
      const fromData: OrderBookLevel = Array.from({ length: 10 }, (_, i) => [
        String(100 + i),
        '1',
        '0',
        '1',
      ]);
      const toData: OrderBookLevel = Array.from({ length: 10 }, (_, i) => [
        String(90 + i),
        '1',
        '0',
        '1',
      ]);
      const result = mergeOrderBook(fromData, toData, 5);
      
      expect(result.length).toBe(5);
      expect(result[0][0]).toBe('109');
      expect(result[4][0]).toBe('105');
    });

    it('当数据少于限制时应该返回所有数据', () => {
      const fromData: OrderBookLevel = [
        ['100', '1', '0', '1'],
      ];
      const toData: OrderBookLevel = [
        ['99', '2', '0', '2'],
      ];
      const result = mergeOrderBook(fromData, toData, 10);
      
      expect(result.length).toBe(2);
    });

    it('应该处理限制为0的情况', () => {
      const fromData: OrderBookLevel = [
        ['100', '1', '0', '1'],
      ];
      const toData: OrderBookLevel = [
        ['99', '2', '0', '2'],
      ];
      const result = mergeOrderBook(fromData, toData, 0);
      
      expect(result).toEqual([]);
    });
  });

  describe('边界情况', () => {
    it('应该过滤无效的价格（NaN）', () => {
      const fromData: OrderBookLevel = [
        ['invalid', '1', '0', '1'],
        ['100', '2', '0', '2'],
      ];
      const toData: OrderBookLevel = [
        ['99', '3', '0', '3'],
      ];
      const result = mergeOrderBook(fromData, toData);
      
      expect(result).toEqual([
        ['100', '2', '0', '2'],
        ['99', '3', '0', '3'],
      ]);
    });

    it('应该过滤无限大的价格', () => {
      const fromData: OrderBookLevel = [
        ['Infinity', '1', '0', '1'],
        ['100', '2', '0', '2'],
      ];
      const toData: OrderBookLevel = [
        ['99', '3', '0', '3'],
      ];
      const result = mergeOrderBook(fromData, toData);
      
      expect(result).toEqual([
        ['100', '2', '0', '2'],
        ['99', '3', '0', '3'],
      ]);
    });

    it('应该处理负数价格', () => {
      const fromData: OrderBookLevel = [
        ['-100', '1', '0', '1'],
      ];
      const toData: OrderBookLevel = [
        ['-99', '2', '0', '2'],
      ];
      const result = mergeOrderBook(fromData, toData);
      
      expect(result).toEqual([
        ['-99', '2', '0', '2'],
        ['-100', '1', '0', '1'],
      ]);
    });

    it('应该处理零价格', () => {
      const fromData: OrderBookLevel = [
        ['0', '1', '0', '1'],
      ];
      const toData: OrderBookLevel = [
        ['1', '2', '0', '2'],
      ];
      const result = mergeOrderBook(fromData, toData);
      
      expect(result).toEqual([
        ['1', '2', '0', '2'],
        ['0', '1', '0', '1'],
      ]);
    });

    it('应该处理非常大的数字', () => {
      const fromData: OrderBookLevel = [
        ['999999999', '1', '0', '1'],
      ];
      const toData: OrderBookLevel = [
        ['1000000000', '2', '0', '2'],
      ];
      const result = mergeOrderBook(fromData, toData);
      
      expect(result).toEqual([
        ['1000000000', '2', '0', '2'],
        ['999999999', '1', '0', '1'],
      ]);
    });

    it('应该处理非常小的数字', () => {
      const fromData: OrderBookLevel = [
        ['0.00001', '1', '0', '1'],
      ];
      const toData: OrderBookLevel = [
        ['0.00002', '2', '0', '2'],
      ];
      const result = mergeOrderBook(fromData, toData);
      
      expect(result).toEqual([
        ['0.00002', '2', '0', '2'],
        ['0.00001', '1', '0', '1'],
      ]);
    });
  });

  describe('真实场景', () => {
    it('应该正确合并 asks（卖单）数据', () => {
      const fromData: OrderBookLevel = [
        ['50100', '0.5', '0', '1'],
        ['50200', '1.0', '0', '2'],
      ];
      const toData: OrderBookLevel = [
        ['50000', '2.0', '0', '3'],
        ['50050', '1.5', '0', '4'],
        ['50100', '0.8', '0', '5'], // 重复价格
      ];
      const result = mergeOrderBook(fromData, toData);
      
      expect(result.length).toBe(4);
      expect(result[0][0]).toBe('50200');
      expect(result[1][0]).toBe('50100');
      expect(result[2][0]).toBe('50050');
      expect(result[3][0]).toBe('50000');
    });

    it('应该正确合并 bids（买单）数据', () => {
      const fromData: OrderBookLevel = [
        ['49900', '0.5', '0', '1'],
        ['49800', '1.0', '0', '2'],
      ];
      const toData: OrderBookLevel = [
        ['50000', '2.0', '0', '3'],
        ['49950', '1.5', '0', '4'],
        ['49900', '0.8', '0', '5'], // 重复价格
      ];
      const result = mergeOrderBook(fromData, toData);
      
      expect(result.length).toBe(4);
      expect(result[0][0]).toBe('50000');
      expect(result[1][0]).toBe('49950');
      expect(result[2][0]).toBe('49900');
      expect(result[3][0]).toBe('49800');
    });

    it('应该处理增量更新场景', () => {
      // 初始订单簿
      const initialBook: OrderBookLevel = [
        ['100', '1.0', '0', '1'],
        ['99', '2.0', '0', '2'],
        ['98', '3.0', '0', '3'],
      ];
      
      // 增量更新（包含新价格和更新的价格）
      const update: OrderBookLevel = [
        ['101', '0.5', '0', '4'], // 新价格
        ['99', '2.5', '0', '5'],  // 更新现有价格
      ];
      
      const result = mergeOrderBook(update, initialBook);
      
      expect(result.length).toBe(4);
      expect(result).toEqual([
        ['101', '0.5', '0', '4'],
        ['100', '1.0', '0', '1'],
        ['99', '2.0', '0', '2'], // 保留原始值（toData 优先）
        ['98', '3.0', '0', '3'],
      ]);
    });
  });

  describe('性能相关', () => {
    it('应该高效处理大量数据', () => {
      const fromData: OrderBookLevel = Array.from({ length: 100 }, (_, i) => [
        String(10000 + i),
        '1',
        '0',
        '1',
      ]);
      const toData: OrderBookLevel = Array.from({ length: 100 }, (_, i) => [
        String(10000 - i),
        '1',
        '0',
        '1',
      ]);
      
      const start = Date.now();
      const result = mergeOrderBook(fromData, toData, 50);
      const end = Date.now();
      
      expect(result.length).toBe(50);
      expect(end - start).toBeLessThan(100); // 应该在100ms内完成
    });
  });
});
