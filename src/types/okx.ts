export interface OKXResponse<T> {
  code: string;
  msg: string;
  data: T;
}

export interface OKXTicker {
  instType: string;
  instId: string;
  last: string;
  lastSz: string;
  askPx: string;
  askSz: string;
  bidPx: string;
  bidSz: string;
  open24h: string;
  high24h: string;
  low24h: string;
  volCcy24h: string;
  vol24h: string;
  ts: string;
  sodUtc0: string;
  sodUtc8: string;
}

export interface OKXKline {
  ts: string;
  o: string;
  h: string;
  l: string;
  c: string;
  vol: string;
  volCcy: string;
  volCcyQuote: string;
  confirm: string;
}

export interface OKXOrderBook {
  asks: [string, string, string, string][];
  bids: [string, string, string, string][];
  ts: string;
}

export interface OKXOrder {
  ordId: string;
  instId: string;
  side: 'buy' | 'sell';
  ordType: 'limit' | 'market';
  px: string;
  sz: string;
  state: string;
  cTime: string;
}

export interface OKXBalance {
  ccy: string;
  availBal: string;
  frozenBal: string;
}

export interface OKXBalanceData {
  adjEq: string;
  details: OKXBalance[];
  imr: string;
  isoEq: string;
  mgnRatio: string;
  mmr: string;
  notionalUsd: string;
  ordFroz: string;
  totalEq: string;
  upl: string;
}

export interface AdapterConfig {
  apiKey?: string;
  apiSecret?: string;
}