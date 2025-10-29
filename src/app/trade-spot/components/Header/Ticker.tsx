'use client';

import { Flex, Text, Box, SkeletonText } from '@chakra-ui/react';
import { memo } from 'react';

import { formatNumber } from '@/helpers/format';
import { UnifiedMarketData } from '@/types/adapter.types';

// 涨跌幅样式
const getChangeColor = (change: number) => {
  if (change > 0) return 'green.500';
  if (change < 0) return 'red.500';
  return 'gray.500';
};

interface Props {
  ticker: UnifiedMarketData;
}

export function Ticker({ ticker }: Props) {
  if (!ticker?.price) {
    return <SkeletonText noOfLines={1} />
  }

  const { priceChangePercent } = ticker;

  return (
    <Flex gap={8} alignItems="center">
      {/* 最新价 */}
      <Box>
        <Text fontSize="sm" fontWeight="bold" color={getChangeColor(priceChangePercent)}>
          {formatNumber(ticker?.price ?? '--', { precision: 2 })}
        </Text>
        <Text fontSize="xs" color={getChangeColor(priceChangePercent)}>
          {priceChangePercent > 0 ? '+' : ''}{formatNumber(priceChangePercent, { precision: 2 })}%
        </Text>
      </Box>

      {/* 24h 最高价 */}
      <Flex gap={8} hideBelow="md">
        <Box>
          <Text fontSize="sm">{ticker?.high24h ?? '--'}</Text>
          <Text fontSize="xs" color="gray.500">24h 最高</Text>
        </Box>

        {/* 24h 最低价 */}
        <Box>
          <Text fontSize="sm">{ticker?.low24h ?? '--'}</Text>
          <Text fontSize="xs" color="gray.500">24h 最低</Text>
        </Box>

        {/* 24h 成交量 */}
        <Box>
          <Text fontSize="sm">{ticker?.volume ?? '--' }</Text>
          <Text fontSize="xs" color="gray.500">24h 成交量</Text>
        </Box>

        {/* 最优买价 */}
        <Box>
          <Text fontSize="sm" color="green.500">{ticker?.topBuyPrice ?? '--'}</Text>
          <Text fontSize="xs" color="gray.500">买一价</Text>
        </Box>

        {/* 最优卖价 */}
        <Box>
          <Text fontSize="sm" color="red.500">{ticker?.topSellPrice ?? '--'}</Text>
          <Text fontSize="xs" color="gray.500">卖一价</Text>
        </Box>
      </Flex>
    </Flex>
  );
}

export default memo(Ticker);
