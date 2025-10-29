import useSWRSubscription from 'swr/subscription';
import { useRef, useEffect } from 'react';
import { OKXWebSocket } from '@/adapters/ws/OKXWebSocket';
import { SubscribeOptions, UseSubscribeReturn } from '@/types/websocket.types';

const wsInstances = new Map<string, OKXWebSocket>();

// create ws instance and store in map by url
const getOrCreateWSInstance = (url: string): OKXWebSocket => {
  if (!wsInstances.has(url)) {
    const ws = new OKXWebSocket(url);
    wsInstances.set(url, ws);
    return ws;
  }
  return wsInstances.get(url)!;
};

const cleanupWSInstance = (url: string) => {
  const instance = wsInstances.get(url);
  if (instance) {
    instance.close();
    wsInstances.delete(url);
  }
};

// subscribe hooks
export const useSubscribe = <T = unknown>(
  options: SubscribeOptions | null,
): UseSubscribeReturn<T> => {
  const { 
    url,
    channel, 
    params, 
    onMessage, 
    onError, 
    enabled = true,
    reconnect = true 
  } = options || {};

  if (!url) {
    throw new Error('WebSocket URL is required');
  }

  const messageCallbackRef = useRef<(data: unknown) => void>(undefined);

  useEffect(() => {
    messageCallbackRef.current = onMessage;
  }, [onMessage]);

  const { data, error } = useSWRSubscription<T, Error>(
    enabled && channel ? channel : null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_key: string, { next }: any) => {
      let isActive = true;
      let unsubscribe: (() => void) | null = null;

      const connectAndSubscribe = async () => {
        try {
          const wsInstance = getOrCreateWSInstance(url);
          
          // connect ws.
          if (!wsInstance.isConnected()) {
            await wsInstance.connect();
          }

          const handleMessage = (data: unknown) => {
            if (!isActive) return;
            next(null, data);
            messageCallbackRef.current?.(data);
          };

          unsubscribe = await wsInstance.subscribe(
            channel!,
            params || {},
            handleMessage,
          ) ?? null;
        } catch (err) {
          if (!isActive) return;
          next(err as Error);
          onError?.(err as Error);
        }
      };

      connectAndSubscribe();

      return () => {
        // clear.
        isActive = false;
        
        if (unsubscribe) {
          unsubscribe();
        }
        
        // clear instances.
        setTimeout(() => cleanupWSInstance(url), 100);
      };
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: reconnect,
      errorRetryInterval: 3000,
    }
  );

  const isConnected = (() => {
    if (!enabled || !channel) return false;
    const instance = wsInstances.get(url);
    return instance ? instance.isConnected() : false;
  })();

  return {
    data,
    error,
    isLoading: !data && !error && enabled,
    isConnected,
  };
};