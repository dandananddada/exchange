"use client";

import OrderBook from '@/components/OrderBook';
import { useMarketData } from '@/hooks/useMarketData';
import { useOrderBook } from '@/hooks/useSWR';
import type { OKXOrderBook } from '@/types/okx';
import { useEffect, useMemo, useRef, useState } from 'react';

import mergeOrderBook from '@/app/trade-spot/helpers/mergeOrderBook';
import { usePublicSubscribe } from '@/hooks/useSubscribe/useOKXSubscribe';
import { useOrderTrade } from '@/hooks/useOrderTrade';

interface Props {
  symbol: string;
  limit?: number;
  depth?: number;
}

export default function OrderBookClient({ symbol, limit = 20, depth = 100 }: Props) {
  const { data, error } = useOrderBook({ symbol, limit });
  const [wsResThrottled, setWsResThrottled] = useState<OKXOrderBook[] | undefined>(undefined);
  const lastMsgRef = useRef<OKXOrderBook[] | undefined>(undefined);
  const timerRef = useRef<number | null>(null);

  // 卸载时清理定时器
  useEffect(() => () => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const { data: marketData } = useMarketData(symbol);
  const { initializeEngine } = useOrderTrade();
  const { price } = marketData || {};

  useEffect(() => {
    initializeEngine(data);
  }, [initializeEngine, data]);

  const { data: wsRes } = usePublicSubscribe<OKXOrderBook[]>({
    channel: 'books',
    params: { instId: symbol, sz: depth },
    enabled: false,
    onMessage: (incoming) => {
      // 300ms 截流：记录最新消息，仅在窗口结束时提交一次
      lastMsgRef.current = incoming as OKXOrderBook[];
      if (timerRef.current == null) {
        timerRef.current = window.setTimeout(() => {
          setWsResThrottled(lastMsgRef.current);
          timerRef.current = null;
        }, 1000);
      }
    },
  });

  // 以截流后的数据优先
  const wsSource = wsResThrottled ?? wsRes;

  const buyOrders = useMemo(() => {
    const wsData = wsSource?.[0];
    const wsBids = wsData?.bids ?? [];
    const restBids = data?.bids ?? [];
    return mergeOrderBook(wsBids, restBids, limit);
  }, [wsSource, data, limit]);

  const sellOrders = useMemo(() => {
    const wsData = wsSource?.[0];
    const wsAsks = wsData?.asks ?? [];
    const restAsks = data?.asks ?? [];
    return mergeOrderBook(wsAsks, restAsks, limit);
  }, [wsSource, data, limit]);


  if (error) {
    return <div style={{ color: 'red' }}>OrderBook 加载失败: {String(error)}</div>;
  }

  return (
    <OrderBook price={price} buyOrders={buyOrders} sellOrders={sellOrders} />
  );
}
