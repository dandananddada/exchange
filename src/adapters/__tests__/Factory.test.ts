import { AdapterFactory, ExchangeType } from '../Factory';
import { BinanceAdapter } from '../BinanceAdapter';
import { OKXAdapter } from '../OKXAdapter';
import { BybitAdapter } from '../ByBitAdapter';
import { OKXWebSocket } from '../ws/OKXWebSocket';
import { IExchangeAdapter } from '@/types/adapter.types';

jest.mock('../BinanceAdapter');
jest.mock('../OKXAdapter');
jest.mock('../ByBitAdapter');
jest.mock('../ws/OKXWebSocket');

describe('AdapterFactory', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAdapter', () => {
    it('should create a BinanceAdapter instance', () => {
      const adapter = AdapterFactory.createAdapter('binance');
      expect(adapter).toBeInstanceOf(BinanceAdapter);
      expect(BinanceAdapter).toHaveBeenCalledWith(undefined);
    });

    it('should create an OKXAdapter instance', () => {
      const adapter = AdapterFactory.createAdapter('okx');
      expect(adapter).toBeInstanceOf(OKXAdapter);
      expect(OKXAdapter).toHaveBeenCalledWith(undefined);
    });

    it('should create a BybitAdapter instance', () => {
      const adapter = AdapterFactory.createAdapter('bybit');
      expect(adapter).toBeInstanceOf(BybitAdapter);
      expect(BybitAdapter).toHaveBeenCalledWith(undefined);
    });

    it('should throw an error for an unsupported exchange', () => {
      expect(() => {
        AdapterFactory.createAdapter('unsupported' as ExchangeType);
      }).toThrow('Unsupported exchange: unsupported');
    });

    it('should pass config to the adapter constructor', () => {
      const config = { apiKey: 'test-key' };
      AdapterFactory.createAdapter('binance', config);
      expect(BinanceAdapter).toHaveBeenCalledWith(config);
    });
  });

  describe('createAllAdapters', () => {
    it('should create all adapters with default configs', () => {
      const adapters = AdapterFactory.createAllAdapters();
      expect(adapters.binance).toBeInstanceOf(BinanceAdapter);
      expect(adapters.okx).toBeInstanceOf(OKXAdapter);
      expect(adapters.bybit).toBeInstanceOf(BybitAdapter);
      expect(BinanceAdapter).toHaveBeenCalledWith(undefined);
      expect(OKXAdapter).toHaveBeenCalledWith(undefined);
      expect(BybitAdapter).toHaveBeenCalledWith(undefined);
    });

    it('should create all adapters with provided configs', () => {
      const configs = {
        binance: { apiKey: 'binance-key' },
        okx: { apiKey: 'okx-key' },
      };
      const adapters = AdapterFactory.createAllAdapters(configs);
      expect(adapters.binance).toBeInstanceOf(BinanceAdapter);
      expect(adapters.okx).toBeInstanceOf(OKXAdapter);
      expect(adapters.bybit).toBeInstanceOf(BybitAdapter);
      expect(BinanceAdapter).toHaveBeenCalledWith(configs.binance);
      expect(OKXAdapter).toHaveBeenCalledWith(configs.okx);
      expect(BybitAdapter).toHaveBeenCalledWith(undefined);
    });
  });
});
