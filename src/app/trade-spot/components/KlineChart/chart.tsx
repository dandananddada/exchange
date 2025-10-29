"use client";

import KLineChart from '@/components/KlineChart';
import { useKlines } from '@/hooks/useSWR';

interface Props {
  symbol: string;
  interval?: string;
  limit?: number;
  height?: number | string;
}

export default function KlineChartClient({ symbol, interval = '1m', limit = 200, height }: Props) {
  const { data, error } = useKlines({ symbol, interval, limit });

  if (error) {
    return <div style={{ color: 'red' }}>Kline 加载失败: {String(error)}</div>;
  }

  return (
    <KLineChart symbol={symbol} interval={interval} data={data} height={height} />
  );
}
