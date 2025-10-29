'use client';

import { useMemo } from 'react';
import { Tabs } from '@chakra-ui/react';

import { useOrderTrade } from '@/hooks/useOrderTrade';
import { useMarketData } from '@/hooks/useMarketData';

import { OpenOrders } from './OpenOrders';
import { Positions } from './Positions';

export default function Transcations({ symbol } : {
  symbol: string;
}) {
  const { data: marketData } = useMarketData(symbol)
  const tradeInfo = useOrderTrade();

  const openOrders = useMemo(() => {
    return tradeInfo.openOrders.filter(order => order.symbol === symbol);
  }, [tradeInfo.openOrders, symbol]);

  const positions = useMemo(() => {
    return tradeInfo.positions.filter(item => item.symbol === symbol);
  }, [tradeInfo.positions, symbol]);

  return (
    <Tabs.Root defaultValue="orders">
      <Tabs.List >
        <Tabs.Trigger value="orders">当前委托</Tabs.Trigger>
        <Tabs.Trigger value="positions">持仓</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="orders">
        <OpenOrders datasource={openOrders} />
      </Tabs.Content>
      <Tabs.Content value="positions">
        <Positions datasource={positions} marketPrice={marketData?.price} />
      </Tabs.Content>
    </Tabs.Root>
  );
}
