// adapters/BaseAdapter.ts
import { 
  IExchangeAdapter, 
  AdapterConfig, 
  ResponseInterceptor,
  RequestConfig, 
  UnifiedMarketData,
  UnifiedOrder,
  OrderRequest,
  UnifiedBalance
} from '@/types/adapter.types';

export abstract class BaseAdapter implements IExchangeAdapter {
  abstract readonly name: string;
  
  protected config: AdapterConfig = {};
  protected responseInterceptors: Map<string, ResponseInterceptor> = new Map();
  protected baseURL: string = '';
  
  // 默认请求配置
  protected defaultRequestConfig: RequestConfig = {
    timeout: 10000,
    retryCount: 3,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  constructor(config?: AdapterConfig) {
    if (config) {
      this.configure(config);
    }
  }

  // 响应拦截器管理
  addResponseInterceptor<T, R>(endpoint: string, interceptor: ResponseInterceptor<T, R>): void {
    this.responseInterceptors.set(endpoint, interceptor as ResponseInterceptor);
  }

  removeResponseInterceptor(endpoint: string): void {
    this.responseInterceptors.delete(endpoint);
  }

  clearResponseInterceptors(): void {
    this.responseInterceptors.clear();
  }

  // 应用响应拦截器
  protected applyResponseInterceptors<T, R>(endpoint: string, data: T): R {
    const interceptor = this.responseInterceptors.get(endpoint);
    if (interceptor) {
      return interceptor(data) as R;
    }
    return data as unknown as R;
  }

  // 配置管理
  configure(config: AdapterConfig): void {
    this.config = { ...this.config, ...config };
    this.onConfigUpdate();
  }

  getConfig(): AdapterConfig {
    return { ...this.config };
  }

  // 子类可以重写的方法
  protected onConfigUpdate(): void {
    // 配置更新时的回调
  }

  // 通用的 HTTP 请求方法
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const requestConfig = { ...this.defaultRequestConfig, ...this.config.requestConfig };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestConfig.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          ...requestConfig.headers,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.applyResponseInterceptors(endpoint, data);

    } catch (error) {
      clearTimeout(timeoutId);
      
      // 重试逻辑
      if (requestConfig.retryCount && requestConfig.retryCount > 0) {
        return this.retryRequest(endpoint, options);
      }
      
      throw error;
    }
  }

  private async retryRequest<T>(
    endpoint: string, 
    options: RequestInit, 
  ): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return this.request(endpoint, options);
  }

  // 抽象方法 - 子类必须实现
  abstract getTicker(symbol: string): Promise<UnifiedMarketData>;
  abstract getKlines(symbol: string, interval: string, limit?: number): Promise<unknown[]>;
  abstract getOrderBook(symbol: string, limit?: number): Promise<unknown>;
  abstract createOrder(order: OrderRequest): Promise<UnifiedOrder>;
  abstract cancelOrder(orderId: string, symbol: string): Promise<boolean>;
  abstract getOrder(orderId: string, symbol: string): Promise<UnifiedOrder>;
  abstract getOpenOrders(symbol?: string): Promise<UnifiedOrder[]>;
  abstract getBalance(): Promise<UnifiedBalance>;
  abstract getAccountInfo(): Promise<unknown>;
}