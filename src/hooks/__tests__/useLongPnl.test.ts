import { renderHook } from '@testing-library/react';
import { useLongPnl } from '../useLongPnl';
import { LongPosition } from '@/types/services/pnl-calculator';

// Mock the calculator
jest.mock('@/services/pnlCalculator', () => ({
  LongPnlCalculator: {
    calculateLongPnl: jest.fn(),
    formatPnlDisplay: jest.fn(),
  },
}));

import { LongPnlCalculator } from '@/services/pnlCalculator';

describe('useLongPnl', () => {
  const mockPosition: LongPosition = {
    entryPrice: 30000,
    quantity: 1,
    leverage: 10,
  };

  const mockPnlResult = {
    unrealizedPnl: 500,
    unrealizedPnlPercentage: 1.67,
    liquidationPrice: 27000,
    currentValue: 31000,
    marginRatio: 0.0968,
  };

  const mockFormattedDisplay = {
    unrealizedPnl: '+$500.00',
    unrealizedPnlPercentage: '+1.67%',
    liquidationPrice: '$27,000.00',
    marginRatio: '9.68%',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (LongPnlCalculator.calculateLongPnl as jest.Mock).mockReturnValue(mockPnlResult);
    (LongPnlCalculator.formatPnlDisplay as jest.Mock).mockReturnValue(mockFormattedDisplay);
  });

  it('should calculate PNL correctly', () => {
    const { result } = renderHook(() =>
      useLongPnl({
        position: mockPosition,
        currentPrice: 31000,
      })
    );

    expect(LongPnlCalculator.calculateLongPnl).toHaveBeenCalledWith(
      mockPosition,
      31000,
      {}
    );
    expect(result.current.pnlResult).toEqual(mockPnlResult);
  });

  it('should format PNL display correctly', () => {
    const { result } = renderHook(() =>
      useLongPnl({
        position: mockPosition,
        currentPrice: 31000,
      })
    );

    expect(LongPnlCalculator.formatPnlDisplay).toHaveBeenCalledWith(mockPnlResult);
    expect(result.current.formattedDisplay).toEqual(mockFormattedDisplay);
  });

  it('should calculate risk metrics correctly', () => {
    const { result } = renderHook(() =>
      useLongPnl({
        position: mockPosition,
        currentPrice: 31000,
      })
    );

    const { riskMetrics } = result.current;
    
    // Safety margin = (31000 - 27000) / (30000 - 27000) * 100 = 133.33%
    expect(riskMetrics.safetyMargin).toBeCloseTo(133.33, 1);
    expect(riskMetrics.isAtRisk).toBe(false); // > 30%
    expect(riskMetrics.distanceToLiquidation).toBe(4000); // 31000 - 27000
  });

  it('should detect at-risk position', () => {
    const { result } = renderHook(() =>
      useLongPnl({
        position: mockPosition,
        currentPrice: 27500, // Close to liquidation
      })
    );

    const { riskMetrics } = result.current;
    
    // Safety margin = (27500 - 27000) / (30000 - 27000) * 100 = 16.67%
    expect(riskMetrics.safetyMargin).toBeCloseTo(16.67, 1);
    expect(riskMetrics.isAtRisk).toBe(true); // < 30%
  });

  it('should return zero safety margin when at liquidation price', () => {
    const { result } = renderHook(() =>
      useLongPnl({
        position: mockPosition,
        currentPrice: 27000,
      })
    );

    expect(result.current.riskMetrics.safetyMargin).toBe(0);
  });

  it('should set correct flags for profitable position', () => {
    const { result } = renderHook(() =>
      useLongPnl({
        position: mockPosition,
        currentPrice: 31000,
      })
    );

    const { flags } = result.current;
    
    expect(flags.isProfitable).toBe(true); // unrealizedPnl > 0
    expect(flags.isLiquidated).toBe(false); // currentPrice > liquidationPrice
    expect(flags.hasEnoughMargin).toBe(true); // safetyMargin > 10%
  });

  it('should set correct flags for losing position', () => {
    (LongPnlCalculator.calculateLongPnl as jest.Mock).mockReturnValue({
      ...mockPnlResult,
      unrealizedPnl: -200,
    });

    const { result } = renderHook(() =>
      useLongPnl({
        position: mockPosition,
        currentPrice: 29500,
      })
    );

    const { flags } = result.current;
    
    expect(flags.isProfitable).toBe(false);
  });

  it('should detect liquidated position', () => {
    const { result } = renderHook(() =>
      useLongPnl({
        position: mockPosition,
        currentPrice: 26000, // Below liquidation price
      })
    );

    const { flags } = result.current;
    
    expect(flags.isLiquidated).toBe(true);
    expect(flags.hasEnoughMargin).toBe(false);
  });

  it('should recalculate when position changes', () => {
    const { result, rerender } = renderHook(
      ({ position, currentPrice }) =>
        useLongPnl({ position, currentPrice }),
      {
        initialProps: {
          position: mockPosition,
          currentPrice: 31000,
        },
      }
    );

    expect(LongPnlCalculator.calculateLongPnl).toHaveBeenCalledTimes(1);

    // Change position
    const newPosition = { ...mockPosition, size: 2 };
    rerender({ position: newPosition, currentPrice: 31000 });

    expect(LongPnlCalculator.calculateLongPnl).toHaveBeenCalledTimes(2);
  });

  it('should recalculate when current price changes', () => {
    const { result, rerender } = renderHook(
      ({ position, currentPrice }) =>
        useLongPnl({ position, currentPrice }),
      {
        initialProps: {
          position: mockPosition,
          currentPrice: 31000,
        },
      }
    );

    expect(LongPnlCalculator.calculateLongPnl).toHaveBeenCalledTimes(1);

    // Change price
    rerender({ position: mockPosition, currentPrice: 32000 });

    expect(LongPnlCalculator.calculateLongPnl).toHaveBeenCalledTimes(2);
  });

  it('should pass options to calculator', () => {
    const options = { feeRate: 0.001 };

    renderHook(() =>
      useLongPnl({
        position: mockPosition,
        currentPrice: 31000,
        options,
      })
    );

    expect(LongPnlCalculator.calculateLongPnl).toHaveBeenCalledWith(
      mockPosition,
      31000,
      options
    );
  });
});
