import { BaseWebSocket, SubscribeMessage } from './BaseWebSocket';

export class OKXWebSocket extends BaseWebSocket {

  protected onWSOpen(): void {
  }

  constructor(url: string) {
    super({
      url,
      pingInterval: 15000
    });
    this.connect();
  }

  onWSMessage(data: { arg: unknown, data: unknown }): void {
    if (this.isSubscribeResponse(data)) return;
    const { channel = '' } = data?.arg as { channel: string };
    if (!channel) {
      return;
    }
    this.subscribers.get(channel)?.[1]?.forEach(listener => {
      listener(data?.data);
    });
  }

  protected formatSubscribeMessage(channel: string, args: object): SubscribeMessage {
    return {
      op: "subscribe",
      args: [{
        channel: channel,
        ...args
      }]
    };
  }

  protected formatUnsubscribeMessage(channel: string): SubscribeMessage {
    const [type, symbol] = channel.split(':');
    return {
      op: "unsubscribe",
      args: [{
        channel: type,
        instId: symbol
      }]
    };
  }

  connect(): void {
    super.connect();
  }

  private isSubscribeResponse(data: unknown): boolean {
    return typeof data === 'object' && data !== null && 'event' in data;
  }
}