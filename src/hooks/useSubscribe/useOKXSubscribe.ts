import { SubscribeOptions } from '@/types/websocket.types';
import { useSubscribe } from '.';

const OKX_WSS_PATH = {
  public: 'wss://ws.okx.com:8443/ws/v5/public',
  business: 'wss://ws.okx.com:8443/ws/v5/business',
}

export const usePublicSubscribe = <T>(args: SubscribeOptions) => {
  return useSubscribe<T>({
    ...args,
    url: OKX_WSS_PATH.public,
  });
}

export const useBusinessSubscribe = <T>(args: SubscribeOptions) => {
  return useSubscribe<T>({
    ...args,
    url: OKX_WSS_PATH.business,
  });
}