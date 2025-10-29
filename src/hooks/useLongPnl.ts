// hooks/use-long-pnl.ts
import { useMemo } from 'react';
import { LongPnlCalculator } from '@/services/pnlCalculator';
import { LongPosition, PnlOptions, PnlResult, FormattedPnlDisplay } from '@/types/services/pnl-calculator';

export interface UseLongPnlProps {
  position: LongPosition;
  currentPrice: number;
  options?: PnlOptions;
}

export interface UseLongPnlReturn {
  // 原始计算结果
  pnlResult: PnlResult;
  
  // 格式化显示
  formattedDisplay: FormattedPnlDisplay;
  
  // 风险指标
  riskMetrics: {
    safetyMargin: number;        // 安全边际百分比
    isAtRisk: boolean;           // 是否处于风险中
    distanceToLiquidation: number; // 距离强平价格的距离
  };
  
  // 状态标志
  flags: {
    isProfitable: boolean;       // 是否盈利
    isLiquidated: boolean;       // 是否已强平
    hasEnoughMargin: boolean;    // 保证金是否充足
  };
}

export const useLongPnl = ({
  position,
  currentPrice,
  options = {},
}: UseLongPnlProps): UseLongPnlReturn => {
  
  // 计算 PNL 结果
  const pnlResult = useMemo((): PnlResult => {
    return LongPnlCalculator.calculateLongPnl(position, currentPrice, options);
  }, [position, currentPrice, options]);

  // 格式化显示
  const formattedDisplay = useMemo((): FormattedPnlDisplay => {
    return LongPnlCalculator.formatPnlDisplay(pnlResult);
  }, [pnlResult]);

  // 计算安全边际
  const safetyMargin = useMemo((): number => {
    const { entryPrice } = position;
    const { liquidationPrice } = pnlResult;
    
    if (currentPrice <= liquidationPrice) {
      return 0; // 已经达到或超过强平价格
    }

    const priceRange = entryPrice - liquidationPrice;
    const currentRange = currentPrice - liquidationPrice;

    return (currentRange / priceRange) * 100;
  }, [position, pnlResult, currentPrice]);

  // 计算距离强平价格的距离
  const distanceToLiquidation = useMemo((): number => {
    return currentPrice - pnlResult.liquidationPrice;
  }, [currentPrice, pnlResult.liquidationPrice]);

  // 风险指标
  const riskMetrics = useMemo(() => ({
    safetyMargin,
    isAtRisk: safetyMargin < 30, // 安全边际低于30%认为有风险
    distanceToLiquidation,
  }), [safetyMargin, distanceToLiquidation]);

  // 状态标志
  const flags = useMemo(() => ({
    isProfitable: pnlResult.unrealizedPnl > 0,
    isLiquidated: currentPrice <= pnlResult.liquidationPrice,
    hasEnoughMargin: safetyMargin > 10, // 安全边际大于10%认为保证金充足
  }), [pnlResult.unrealizedPnl, currentPrice, pnlResult.liquidationPrice, safetyMargin]);

  return {
    pnlResult,
    formattedDisplay,
    riskMetrics,
    flags,
  };
};