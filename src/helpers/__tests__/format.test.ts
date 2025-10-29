import { formatNumber } from '../format';

describe('formatNumber', () => {
  describe('基本功能', () => {
    it('应该格式化整数', () => {
      expect(formatNumber(1234)).toBe('1,234');
    });

    it('应该格式化小数', () => {
      expect(formatNumber(1234.5678)).toBe('1,234.5678');
    });

    it('应该处理负数', () => {
      expect(formatNumber(-1234)).toBe('-1,234');
      expect(formatNumber(-1234.56)).toBe('-1,234.56');
    });

    it('应该处理零', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('应该处理 Infinity', () => {
      expect(formatNumber(Infinity)).toBe('Infinity');
      expect(formatNumber(-Infinity)).toBe('-Infinity');
    });

    it('应该处理 NaN', () => {
      expect(formatNumber(NaN)).toBe('NaN');
    });
  });

  describe('precision 选项', () => {
    it('应该使用默认 precision (5)', () => {
      expect(formatNumber(12.3456789)).toBe('12.34568');
    });

    it('应该使用自定义 precision', () => {
      expect(formatNumber(12.3456789, { precision: 2 })).toBe('12.35');
      expect(formatNumber(12.3456789, { precision: 3 })).toBe('12.346');
      expect(formatNumber(12.3456789, { precision: 1 })).toBe('12.3');
    });

    it('应该不补零', () => {
      expect(formatNumber(12, { precision: 3 })).toBe('12');
      expect(formatNumber(12.5, { precision: 3 })).toBe('12.5');
    });

    it('应该处理 precision 为 0', () => {
      expect(formatNumber(12.3456, { precision: 0 })).toBe('12');
    });

    it('应该处理负数 precision', () => {
      expect(formatNumber(12.3456, { precision: -1 })).toBe('12');
    });
  });

  describe('compact 选项', () => {
    it('应该格式化千位数字为 k', () => {
      expect(formatNumber(1234, { compact: true })).toBe('1.234k');
      expect(formatNumber(5000, { compact: true })).toBe('5k');
    });

    it('应该格式化十亿位数字为 b', () => {
      expect(formatNumber(1234567890, { compact: true })).toBe('1.23457b');
      expect(formatNumber(2500000000, { compact: true })).toBe('2.5b');
    });

    it('应该保持小于 1000 的数字不变', () => {
      expect(formatNumber(999, { compact: true })).toBe('999');
      expect(formatNumber(100.5, { compact: true })).toBe('100.5');
    });

    it('应该使用 precision 与 compact 结合', () => {
      expect(formatNumber(1234, { compact: true, precision: 1 })).toBe('1.2k');
      expect(formatNumber(1234567890, { compact: true, precision: 2 })).toBe('1.23b');
    });

    it('应该处理负数的 compact 格式', () => {
      expect(formatNumber(-1234, { compact: true })).toBe('-1.234k');
      expect(formatNumber(-2500000000, { compact: true })).toBe('-2.5b');
    });

    it('应该在 compact 模式下不补零', () => {
      expect(formatNumber(1000, { compact: true, precision: 3 })).toBe('1k');
      expect(formatNumber(5000000000, { compact: true, precision: 2 })).toBe('5b');
    });
  });

  describe('locale 选项', () => {
    it('应该使用默认 locale', () => {
      const result = formatNumber(1234.56);
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('应该使用自定义 locale', () => {
      // 注意：locale 的具体格式取决于浏览器/环境
      const result = formatNumber(1234.56, { locale: 'en-US' });
      expect(result).toContain('1');
      expect(result).toContain('234');
    });
  });

  describe('组合选项', () => {
    it('应该同时使用 compact 和 precision', () => {
      expect(formatNumber(1234567, { compact: true, precision: 2 })).toBe('1,234.57k');
    });

    it('应该同时使用 compact、precision 和 locale', () => {
      const result = formatNumber(1234567, { 
        compact: true, 
        precision: 2,
        locale: 'en-US'
      });
      expect(result).toContain('1,234');
      expect(result).toContain('k');
    });

    it('应该处理边界情况', () => {
      expect(formatNumber(999.9999, { compact: true, precision: 1 })).toBe('1,000');
      expect(formatNumber(1000, { compact: true, precision: 0 })).toBe('1k');
    });
  });

  describe('边界情况', () => {
    it('应该处理非常小的数字', () => {
      expect(formatNumber(0.0001)).toBe('0.0001');
      expect(formatNumber(0.0001, { precision: 5 })).toBe('0.0001');
    });

    it('应该处理非常大的数字', () => {
      expect(formatNumber(999999999999, { compact: true })).toBe('1,000b');
    });

    it('应该处理接近阈值的数字', () => {
      expect(formatNumber(999.5, { compact: true, precision: 0 })).toBe('1,000');
      expect(formatNumber(999999999.5, { compact: true, precision: 0 })).toBe('1,000,000k');
    });
  });
});
