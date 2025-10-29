// adapters/AdapterFactory.ts
import { IExchangeAdapter, AdapterConfig } from '@/types/adapter.types';
import { BinanceAdapter } from './BinanceAdapter';
import { OKXAdapter } from './OKXAdapter';
import { BybitAdapter } from './ByBitAdapter';
import { OKXWebSocket } from './ws/OKXWebSocket';

export type ExchangeType = 'binance' | 'okx' | 'bybit';

export class AdapterFactory {
  static createAdapter(
    exchange: ExchangeType, 
    config?: AdapterConfig
  ): IExchangeAdapter {
    switch (exchange) {
      case 'binance':
        return new BinanceAdapter(config);
      case 'okx':
        return new OKXAdapter(config);
      case 'bybit':
        return new BybitAdapter(config);
      default:
        throw new Error(`Unsupported exchange: ${exchange}`);
    }
  }

  static createWsAdapter(
    exchange: ExchangeType, 
    config?: AdapterConfig
  ): IExchangeAdapter {
    switch (exchange) {
      case 'binance':
        return new BinanceAdapter(config);
      // FIXME: need socket adapter.
      case 'okx':
        return new OKXWebSocket() as unknown as IExchangeAdapter;
      case 'bybit':
        return new BybitAdapter(config);
      default:
        throw new Error(`Unsupported exchange: ${exchange}`);
    }
  }

  static createAllAdapters(configs: Partial<Record<ExchangeType, AdapterConfig>> = {}): Record<ExchangeType, IExchangeAdapter> {
    return {
      binance: this.createAdapter('binance', configs.binance),
      okx: this.createAdapter('okx', configs.okx),
      bybit: this.createAdapter('bybit', configs.bybit)
    };
  }
}