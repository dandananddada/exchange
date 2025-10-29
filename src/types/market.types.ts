// types/market.ts
export interface MarketData {
  price: number;          // 当前价格
  topSellPrice: number;   // 最高卖出价
  topBuyPrice: number;    // 最高买入价
  symbol: string;         // 交易对符号
  timestamp: number;      // 时间戳
  change?: number;        // 涨跌幅
  volume?: number;        // 交易量
}

export interface MarketState {
  // 按交易对存储市场数据
  marketData: Record<string, MarketData>;
  // 加载状态
  loading: boolean;
  // 错误信息
  error: string | null;
  // 最后更新时间
  lastUpdated: number;
}