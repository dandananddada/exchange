import { EventEmitter } from 'events';

export interface WebSocketConfig {
  url: string;
  pingInterval?: number;
  reconnectDelay?: number;
}

export interface SubscribeMessage {
  op: string;
  args: unknown[];
}

export abstract class BaseWebSocket extends EventEmitter {
  protected ws: WebSocket | null = null;
  protected pingInterval: NodeJS.Timeout | null = null;
  protected subscribers = new Map<string, [SubscribeMessage, Set<(data: unknown) => void>]>();
  
  constructor(private config: WebSocketConfig) {
    super();
    this.config.pingInterval = this.config.pingInterval || 15000;
    this.config.reconnectDelay = this.config.reconnectDelay || 3000;
    this.connect();
  }

  protected connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.config.url);
    const send = this.ws.send.bind(this.ws);
    
    this.ws.onopen = () => {
      this.setupPing();
      this.onWSOpen();
      
      // 重新订阅所有活跃的channel
      this.subscribers.forEach((_, channel) => {
        const msg = this.subscribers.get(channel)?.[0];
        send(JSON.stringify(msg));
        
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onWSMessage(data);
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket closed, reconnecting...');
      this.cleanup();
      setTimeout(() => this.connect(), this.config.reconnectDelay);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.cleanup();
    };
  }

  protected abstract onWSOpen(): void;
  protected abstract onWSMessage(data: unknown): void;
  protected abstract formatSubscribeMessage(channel: string, args?: unknown): SubscribeMessage;
  protected abstract formatUnsubscribeMessage(channel: string, args?: unknown): SubscribeMessage;

  protected setupPing() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ op: 'ping' }));
      }
    }, this.config.pingInterval);
  }

  protected cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  protected addSubscriber(channel: string, msg: SubscribeMessage, listener: (data: unknown) => void) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, [msg, new Set()]);
    }
    this.subscribers.get(channel)?.[1].add(listener);
  }

  protected removeSubscriber(channel: string, listener: (data: unknown) => void) {
    const channelListeners = this.subscribers.get(channel)?.[1];
    if (!channelListeners) return;

    channelListeners.delete(listener);
    
    if (channelListeners.size === 0) {
      this.subscribers.delete(channel);
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  subscribe(channel: string, args?: unknown, callback: (data: unknown) => void = () => {}) {
    const msg = this.formatSubscribeMessage(channel, args);
    this.addSubscriber(channel, msg, callback);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  unsubscribe(channel: string, cb: (data: unknown) => void) {
    const msg = this.formatUnsubscribeMessage(channel);
    this.removeSubscriber(channel, cb);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  close() {
    this.cleanup();
    this.ws?.close();
  }
}