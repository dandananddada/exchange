export interface WebSocketMessage {
  channel: string;
  data: unknown;
  timestamp: number;
}

export interface SubscribeOptions {
  channel: string;
  url?: string;
  params?: unknown;
  onMessage?: (data: unknown) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
  reconnect?: boolean;
}

export interface UseSubscribeReturn<T = unknown> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isConnected: boolean;
}