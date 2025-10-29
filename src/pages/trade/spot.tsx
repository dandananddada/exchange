import Provider from './provider';
import Layout from '../../app/trade-spot/components/layout';
import { useKlines } from '@/hooks/useSWR';
import KLineChart from '@/components/KlineChart';

// pages/about.tsx
export default function SpotTrade () {

  const {
    data: chartData,
  } = useKlines({ symbol: 'BTC-USDT', interval: '1m', limit: 100 });
  return (
    <Provider>
      <Layout  klineChart={<KLineChart data={chartData} />} />
    </Provider>
  );
}