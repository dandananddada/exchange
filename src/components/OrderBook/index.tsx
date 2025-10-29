import React, { useEffect, useMemo, useState } from "react";
import { Box, Flex, Text } from '@chakra-ui/react';

import VirtualList from "@/components/VirtualList";

import { formatNumber } from '@/helpers/format';
import { OKXOrderBook } from "@/types/okx";

type Order = {
  id: string;
  price: number;
  amount: number;
  side: "buy" | "sell";
  time: number; // unix ms
};

type Props = {
  price: number;
  buyOrders?: OKXOrderBook['asks']; // raw buy trades
  sellOrders?: OKXOrderBook['bids']; // raw sell trades
  maxItems?: number; // how many latest entries to show for each side (default 10)
  rowHeight?: number;
  listHeight?: number;
  className?: string;
};

const priceColor = (side: Order["side"]) => (side === "buy" ? "green.500" : "red.500");

/**
 * 将原始数组数据转换为 Order 类型
 * @param data 原始数据 [price, amount, side]
 * @returns Order 对象
 */
function toOrder(data: [string, string, string, string], side: "buy" | "sell"): Order | null {
  const [price, amount] = data;
  
  if (!price || !amount) return null;
  
  const numPrice = Number(price);
  const numAmount = Number(amount);
  
  if (isNaN(numPrice) || isNaN(numAmount)) return null;
  
  return {
    id: `${side}-${price}`, // 使用 side-price 作为唯一标识
    price: numPrice,
    amount: numAmount,
    side,
    time: Date.now(), // 使用当前时间作为时间戳
  };
}

/**
 * Row renderer (used by VirtualList children)
 */
const Row = ({ item, index }: { item: Order; index: number }) => {
  const total = item.price * item.amount;
  return (
    <Flex role="row" aria-rowindex={index + 1} px={2} height="100%">
      <Text flex="1" flexShrink={1} textAlign="left" color={priceColor(item.side)} fontSize="sm">{formatNumber(item.price)}</Text>
      <Text flex="1" flexShrink={1} textAlign="right" fontSize="sm">{formatNumber(item.amount)}</Text>
      <Text flex="1" flexShrink={1} textAlign="right" fontSize="sm">{formatNumber(total, { compact: true, precision: 2 })}</Text>
    </Flex>
  );
};

export const OrderBook: React.FC<Props> = ({
  price,
  buyOrders = [],
  sellOrders = [],
  maxItems = 10,
  rowHeight = 20,
  listHeight = 200,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // 转换原始数据为 Order 类型
  const convertedBuyOrders = useMemo(() => {
    return buyOrders
      .map(order => Array.isArray(order) ? toOrder(order as [string, string, string, string], "buy") : order)
      .filter((order): order is Order => order !== null)
  }, [buyOrders]);

  const convertedSellOrders = useMemo(() => {
    return sellOrders
      .map(order => Array.isArray(order) ? toOrder(order as [string, string, string, string], "sell") : order)
      .filter((order): order is Order => order !== null)
      .reverse();
  }, [sellOrders]);

  // 直接使用前 maxItems 个订单
  const latestBuys = useMemo(() => {
    return convertedBuyOrders.slice(0, maxItems);
  }, [convertedBuyOrders, maxItems]);

  const latestSells = useMemo(() => {
    return convertedSellOrders.slice(0, maxItems);
  }, [convertedSellOrders, maxItems]);


  const renderList = (items: Order[]) => {
    const height = Math.min(items.length * rowHeight + 10, listHeight);
    return (
      <VirtualList items={items} height={height} rowHeight={rowHeight} overscan={4}>
        {(item, index) => <Row key={item.id} item={item} index={index} />}
      </VirtualList>
    );
  };

  return (
    <Flex gap={4} align="flex-start">
      <Box display="flex" width={'100%'} flexDirection="column" gap={2}>
        <Flex px={2} py={1} fontSize="xs" mb={1}>
          <Text flex="1" textAlign="left" >价钱</Text>
          <Text flex="1" textAlign="right">数量</Text>
          <Text flex="1" textAlign="right">总计</Text>
        </Flex>
        {renderList(latestSells)}
        {mounted && price != null && !Number.isNaN(price) && (
          <Text fontSize="md" fontWeight="bold" ml="2" textAlign="left">{formatNumber(price, { locale: 'en-US' })}</Text>
        )}
        {renderList(latestBuys)}
      </Box>
    </Flex>
  );
};

export default OrderBook;