'use client';
import { useMemo, useState } from 'react';
import KLineChart from '@/components/KlineChart';
import { useKlines } from '@/hooks/useSWR';
import { VStack, Button } from '@chakra-ui/react';
import { useBusinessSubscribe } from '@/hooks/useSubscribe/useOKXSubscribe';

const DEFAULT_INTERVALS = [
  { label: '1分钟', value: '1m' },
  { label: '5分钟', value: '5m' },
  { label: '1小时', value: '1H' },
  { label: '4小时', value: '4H' },
  { label: '1天', value: '1D' },
] as const;

export default function KlineChartWrapper({ symbol, interval }: { symbol: string, interval: string }) {
  const [currentInterval, setCurrentInterval] = useState<string>(interval);

  // include interval in the SWR key so changing it triggers a refetch
  const { data = [], error, isLoading } = useKlines({ symbol, interval: currentInterval, limit: 200 });

  const { data: wsData = [] } = useBusinessSubscribe<[]>({
    channel: `candle${currentInterval}`,
    params: { instId: symbol },
    enabled: true,
  });

  const chartData = useMemo(() => {
    if (!data.length) {
      return [];
    }
    return [
      ...data,
      ...wsData,
    ]
  }, [data, wsData]);

  const intervals = useMemo(() => Array.from(DEFAULT_INTERVALS), []);

  return (
    <VStack w="100%">
      <div role="tablist" aria-label="时间间隔切换" style={{ display: 'flex', gap: 8, width: '100%' }}>
        {intervals.map((it) => (
          <Button
            key={it.value}
            size="xs"
            variant="ghost"
            onClick={() => setCurrentInterval(it.value)}
            aria-selected={it.value === currentInterval}
            role="tab"
            color={it.value === currentInterval ? 'orange.400' : undefined}
            fontWeight={it.value === currentInterval ? 'semibold' : 'normal'}
            px={0}
            py={0}
            minW="0"
            bg="transparent"
          >
            {it.label}
          </Button>
        ))}
      </div>

      {/* Keep the same KLineChart mounted; it will update its series when `data` changes which
          is more performant than remounting the whole chart on every interval change. */}
      <KLineChart symbol={symbol} interval={currentInterval} data={chartData} />
      {/* lightweight indication for loading/error; KLineChart also shows loading state */}
      {isLoading && <VStack style={{ color: '#9aa7b2', padding: 6 }}>数据加载中...</VStack>}
      {error && <VStack style={{ color: '#ff7675', padding: 6 }}>加载失败</VStack>}
    </VStack>
  );
}