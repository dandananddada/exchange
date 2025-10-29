import { UnifiedMarketData, OrderRequest, UnifiedOrder, UnifiedBalance } from '@/types/adapter.types';
import { BaseAdapter } from './BaseAdapter';

export class BybitAdapter extends BaseAdapter {
  readonly name = 'ByBit';

  getTicker(symbol: string): Promise<UnifiedMarketData> {
    throw new Error('Method not implemented.');
  }
  getKlines(symbol: string, interval: string, limit?: number): Promise<unknown[]> {
    throw new Error('Method not implemented.');
  }
  getOrderBook(symbol: string, limit?: number): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
  createOrder(order: OrderRequest): Promise<UnifiedOrder> {
    throw new Error('Method not implemented.');
  }
  cancelOrder(orderId: string, symbol: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  getOrder(orderId: string, symbol: string): Promise<UnifiedOrder> {
    throw new Error('Method not implemented.');
  }
  getOpenOrders(symbol?: string): Promise<UnifiedOrder[]> {
    throw new Error('Method not implemented.');
  }
  getBalance(): Promise<UnifiedBalance> {
    throw new Error('Method not implemented.');
  }
  getAccountInfo(): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
}