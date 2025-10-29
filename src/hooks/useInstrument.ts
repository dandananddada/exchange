'use client';

import { useParams } from 'next/navigation';

/**
 * 从当前路径中获取交易对 ID 并标准化
 * 例如: /trade-spot/btc-usdt -> BTC-USDT
 */
export const useInstrument = () => {
  const params = useParams();
  const instId = params?.instId;

  return {
    instId: instId ? String(instId).toUpperCase() : 'BTC-USDT',
  };
};

export default useInstrument;
