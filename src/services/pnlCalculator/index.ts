import { LongPosition, PnlResult, PnlOptions } from '@/types/services/pnl-calculator';

export class LongPnlCalculator {
  static calculateLongPnl(
    position: LongPosition,
    currentPrice: number,
    options: PnlOptions = {}
  ): PnlResult {
    const {
      maintenanceMarginRate = 0.05, // 5% 维持保证金
      includeFees = false,
      feeRate = 0.001, // 0.1% 手续费
    } = options;

    const { entryPrice, quantity, leverage } = position;

    const initialValue = entryPrice * quantity; // initial values 
    const currentValue = currentPrice * quantity; // current values 
    const margin = initialValue / leverage; // margin 

    const basePnl = currentValue - initialValue;
    const leveragedPnl = basePnl * leverage;

    // calc fee
    let fees = 0;
    if (includeFees) {
      const closeFee = currentValue * feeRate;
      fees = closeFee;
    }

    const unrealizedPnl = leveragedPnl - fees;
    const unrealizedPnlPercentage = (unrealizedPnl / initialValue) * 100;

    const roe = (unrealizedPnl / margin) * 100;

    // 计算强平价格
    const liquidationPrice = this.calculateLongLiquidationPrice(
      position,
      maintenanceMarginRate
    );

    return {
      unrealizedPnl,
      unrealizedPnlPercentage,
      roe,
      liquidationPrice,
      margin,
      currentValue: currentValue / leverage, // 杠杆后的当前价值
    };
  }

  // liquidation price
  static calculateLongLiquidationPrice(
    position: LongPosition,
    maintenanceMarginRate: number = 0.05
  ): number {
    const { entryPrice, leverage } = position;
    return entryPrice * (1 - (1 / leverage) + maintenanceMarginRate);
  }

  // calc margin
  static calculateMaintenanceMargin(
    position: LongPosition,
    currentPrice: number,
    maintenanceMarginRate: number = 0.05
  ): number {
    const { quantity, leverage } = position;
    const currentValue = currentPrice * quantity;
    return (currentValue / leverage) * maintenanceMarginRate;
  }

  static formatPnlDisplay(result: PnlResult): {
    pnl: string;
    pnlPercentage: string;
    roe: string;
    margin: string;
  } {
    return {
      pnl: `${result.unrealizedPnl >= 0 ? '+' : ''}${result.unrealizedPnl.toFixed(2)}`,
      pnlPercentage: `${result.unrealizedPnlPercentage >= 0 ? '+' : ''}${result.unrealizedPnlPercentage.toFixed(2)}%`,
      roe: `${result.roe >= 0 ? '+' : ''}${result.roe.toFixed(2)}%`,
      margin: `${result.margin.toFixed(2)}`,
    };
  }
}