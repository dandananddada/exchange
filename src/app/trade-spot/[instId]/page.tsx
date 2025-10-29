import Layout from '@/app/trade-spot/components/layout';
import Header from '@/app/trade-spot/components/Header';
import KlineChart from '@/app/trade-spot/components/KlineChart';
import OrderBook from '@/app/trade-spot/components/orderBook';
import PlaceOrder from '@/app/trade-spot/components/PlaceOrder';
import Transcation from '@/app/trade-spot/components/Transcation';


type PageProps = {
  params: { instId?: string };
};

export default async function SpotTrade({ params }: PageProps) {
  const { instId } = await params;
  const symbol = instId?.toLocaleUpperCase();

  if (!symbol) {
    return <div>交易对不存在</div>;
  }

  return (
    <Layout
      header={
        <Header symbol={symbol} />
      }
      klineChart={
        <KlineChart symbol={symbol} interval="1m" />
      }
      orderBook={<OrderBook symbol={symbol} />}
      placeOrder={<PlaceOrder symbol={symbol} />}
      transcation={<Transcation symbol={symbol} />}
    />
  );
}
