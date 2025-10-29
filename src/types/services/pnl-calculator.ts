export interface LongPosition {
  entryPrice: number;    // 开仓均价
  quantity: number;      // 持仓数量（正数）
  leverage: number;      // 杠杆倍数
  symbol?: string;       // 交易对
}

export interface PnlResult {
  unrealizedPnl: number;     // 未实现盈亏
  unrealizedPnlPercentage: number; // 未实现盈亏百分比
  roe: number;              // 收益率 (Return on Equity)
  liquidationPrice: number; // 强平价格
  margin: number;          // 保证金
  currentValue: number;    // 当前持仓价值
}

export interface PnlOptions {
  maintenanceMarginRate?: number; // 维持保证金率，默认 0.05 (5%)
  includeFees?: boolean;         // 是否包含手续费
  feeRate?: number;              // 手续费率
}

export interface FormattedPnlDisplay {
  pnl: string;
  pnlPercentage: string;
  roe: string;
  margin: string;
}