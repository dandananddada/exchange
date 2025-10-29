import { LongPnlCalculator } from '../index';
import { LongPosition } from '@/types/services/pnl-calculator';

describe('LongPnlCalculator', () => {
  const basePosition: LongPosition = {
    entryPrice: 50000,
    quantity: 1,
    leverage: 10,
    symbol: 'BTC-USDT',
  };

  describe('calculateLongPnl', () => {
    it('应该计算盈利的多单 PnL', () => {
      const currentPrice = 55000;
      const result = LongPnlCalculator.calculateLongPnl(basePosition, currentPrice);

      expect(result.unrealizedPnl).toBeGreaterThan(0);
      expect(result.unrealizedPnlPercentage).toBeCloseTo(100, 0);
      expect(result.roe).toBeCloseTo(1000, 0);
    });

    it('应该计算亏损的多单 PnL', () => {
      const currentPrice = 45000;
      const result = LongPnlCalculator.calculateLongPnl(basePosition, currentPrice);

      expect(result.unrealizedPnl).toBeLessThan(0);
      expect(result.unrealizedPnlPercentage).toBeCloseTo(-100, 0);
      expect(result.roe).toBeCloseTo(-1000, 0);
    });

    it('应该计算持平的 PnL', () => {
      const currentPrice = 50000;
      const result = LongPnlCalculator.calculateLongPnl(basePosition, currentPrice);

      expect(result.unrealizedPnl).toBe(0);
      expect(result.unrealizedPnlPercentage).toBe(0);
      expect(result.roe).toBe(0);
    });

    it('应该正确计算保证金', () => {
      const currentPrice = 55000;
      const result = LongPnlCalculator.calculateLongPnl(basePosition, currentPrice);

      const expectedMargin = (basePosition.entryPrice * basePosition.quantity) / basePosition.leverage;
      expect(result.margin).toBeCloseTo(expectedMargin, 2);
    });

    it('应该计算强平价格', () => {
      const currentPrice = 55000;
      const result = LongPnlCalculator.calculateLongPnl(basePosition, currentPrice);

      expect(result.liquidationPrice).toBeLessThan(basePosition.entryPrice);
      expect(result.liquidationPrice).toBeGreaterThan(0);
    });

    it('应该包含手续费计算', () => {
      const currentPrice = 55000;
      const resultWithFees = LongPnlCalculator.calculateLongPnl(basePosition, currentPrice, {
        includeFees: true,
        feeRate: 0.001,
      });

      const resultWithoutFees = LongPnlCalculator.calculateLongPnl(basePosition, currentPrice, {
        includeFees: false,
      });

      expect(resultWithFees.unrealizedPnl).toBeLessThan(resultWithoutFees.unrealizedPnl);
    });

    it('应该使用自定义维持保证金率', () => {
      const currentPrice = 55000;
      const result1 = LongPnlCalculator.calculateLongPnl(basePosition, currentPrice, {
        maintenanceMarginRate: 0.05,
      });

      const result2 = LongPnlCalculator.calculateLongPnl(basePosition, currentPrice, {
        maintenanceMarginRate: 0.1,
      });

      expect(result1.liquidationPrice).not.toBe(result2.liquidationPrice);
    });

    it('应该处理不同的杠杆倍数', () => {
      const position5x: LongPosition = { ...basePosition, leverage: 5 };
      const position20x: LongPosition = { ...basePosition, leverage: 20 };
      
      const currentPrice = 55000;
      
      const result5x = LongPnlCalculator.calculateLongPnl(position5x, currentPrice);
      const result20x = LongPnlCalculator.calculateLongPnl(position20x, currentPrice);

      expect(result20x.roe).toBeGreaterThan(result5x.roe);
      expect(result5x.liquidationPrice).toBeLessThan(result20x.liquidationPrice);
    });
  });

  describe('calculateLongLiquidationPrice', () => {
    it('应该计算多单强平价格', () => {
      const liquidationPrice = LongPnlCalculator.calculateLongLiquidationPrice(basePosition);

      expect(liquidationPrice).toBeLessThan(basePosition.entryPrice);
      expect(liquidationPrice).toBeGreaterThan(0);
    });

    it('应该根据杠杆倍数调整强平价格', () => {
      const position5x: LongPosition = { ...basePosition, leverage: 5 };
      const position20x: LongPosition = { ...basePosition, leverage: 20 };

      const liq5x = LongPnlCalculator.calculateLongLiquidationPrice(position5x);
      const liq20x = LongPnlCalculator.calculateLongLiquidationPrice(position20x);

      expect(liq5x).toBeLessThan(liq20x);
    });

    it('应该使用自定义维持保证金率', () => {
      const liq1 = LongPnlCalculator.calculateLongLiquidationPrice(basePosition, 0.05);
      const liq2 = LongPnlCalculator.calculateLongLiquidationPrice(basePosition, 0.1);

      expect(liq1).not.toBe(liq2);
    });
  });

  describe('calculateMaintenanceMargin', () => {
    it('应该计算维持保证金', () => {
      const currentPrice = 55000;
      const maintenanceMargin = LongPnlCalculator.calculateMaintenanceMargin(
        basePosition,
        currentPrice
      );

      expect(maintenanceMargin).toBeGreaterThan(0);
      expect(maintenanceMargin).toBeLessThan(currentPrice * basePosition.quantity);
    });

    it('应该根据价格变化调整维持保证金', () => {
      const mm1 = LongPnlCalculator.calculateMaintenanceMargin(basePosition, 50000);
      const mm2 = LongPnlCalculator.calculateMaintenanceMargin(basePosition, 60000);

      expect(mm2).toBeGreaterThan(mm1);
    });

    it('应该使用自定义维持保证金率', () => {
      const currentPrice = 55000;
      const mm1 = LongPnlCalculator.calculateMaintenanceMargin(basePosition, currentPrice, 0.05);
      const mm2 = LongPnlCalculator.calculateMaintenanceMargin(basePosition, currentPrice, 0.1);

      expect(mm2).toBeCloseTo(mm1 * 2, 0);
    });
  });

  describe('formatPnlDisplay', () => {
    it('应该格式化盈利的 PnL 显示', () => {
      const currentPrice = 55000;
      const result = LongPnlCalculator.calculateLongPnl(basePosition, currentPrice);
      const formatted = LongPnlCalculator.formatPnlDisplay(result);

      expect(formatted.pnl).toContain('+');
      expect(formatted.pnlPercentage).toContain('+');
      expect(formatted.pnlPercentage).toContain('%');
      expect(formatted.roe).toContain('+');
      expect(formatted.roe).toContain('%');
    });

    it('应该格式化亏损的 PnL 显示', () => {
      const currentPrice = 45000;
      const result = LongPnlCalculator.calculateLongPnl(basePosition, currentPrice);
      const formatted = LongPnlCalculator.formatPnlDisplay(result);

      expect(formatted.pnl).toContain('-');
      expect(formatted.pnlPercentage).toContain('-');
      expect(formatted.roe).toContain('-');
    });

    it('应该格式化保证金', () => {
      const currentPrice = 55000;
      const result = LongPnlCalculator.calculateLongPnl(basePosition, currentPrice);
      const formatted = LongPnlCalculator.formatPnlDisplay(result);

      expect(typeof formatted.margin).toBe('string');
      expect(parseFloat(formatted.margin)).toBeGreaterThan(0);
    });

    it('应该使用两位小数', () => {
      const currentPrice = 55555.5555;
      const result = LongPnlCalculator.calculateLongPnl(basePosition, currentPrice);
      const formatted = LongPnlCalculator.formatPnlDisplay(result);

      const pnlDecimalPart = formatted.pnl.split('.')[1];
      if (pnlDecimalPart) {
        expect(pnlDecimalPart.length).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('边界情况', () => {
    it('应该处理零数量持仓', () => {
      const position: LongPosition = { ...basePosition, quantity: 0 };
      const currentPrice = 55000;
      const result = LongPnlCalculator.calculateLongPnl(position, currentPrice);

      expect(result.unrealizedPnl).toBe(0);
      expect(result.margin).toBe(0);
    });

    it('应该处理极高杠杆', () => {
      const position: LongPosition = { ...basePosition, leverage: 100 };
      const currentPrice = 55000;
      const result = LongPnlCalculator.calculateLongPnl(position, currentPrice);

      expect(result.roe).toBeGreaterThan(0);
      expect(result.liquidationPrice).toBeGreaterThan(basePosition.entryPrice);
    });

    it('应该处理极小价格变动', () => {
      const currentPrice = 50000.01;
      const result = LongPnlCalculator.calculateLongPnl(basePosition, currentPrice);

      expect(result.unrealizedPnl).toBeCloseTo(0, 0);
    });

    it('应该处理大额持仓', () => {
      const position: LongPosition = { ...basePosition, quantity: 1000 };
      const currentPrice = 55000;
      const result = LongPnlCalculator.calculateLongPnl(position, currentPrice);

      expect(result.unrealizedPnl).toBeGreaterThan(0);
      expect(result.margin).toBeGreaterThan(0);
    });
  });
});
