'use client';

import { Box, Table, Flex, Text } from '@chakra-ui/react';

import { useLongPnl } from '@/hooks/useLongPnl';

import { LongPosition } from '@/types/services/pnl-calculator';

import { TradeOrder } from '@/types/trade';
import Empty from '@/components/Empty';

interface PnlRowProps {
  position: LongPosition;
  price: number;
}
const PnlRow: React.FC<PnlRowProps> = ({ position, price }) => {
  const { pnlResult, formattedDisplay } = useLongPnl({
    position,
    currentPrice: price,
    options: {
      maintenanceMarginRate: 0.05,
      feeRate: 0.1,
    },
  });

  return (
    <Flex justifyContent='end' color={pnlResult.unrealizedPnl > 0 ? 'red.600' : 'green.700'}>
      {formattedDisplay.pnl}
      <Text ml='2' fontSize='xs'>
        {formattedDisplay.pnlPercentage}
      </Text>
    </Flex>
  );
};

export const Positions: React.FC<{
  datasource: TradeOrder[];
  marketPrice?: number;
}> = ({ datasource = [], marketPrice }) => {
  return (
    <Box p={4}>
      <Table.Root>
        <Table.Header>
          <Table.Row bg="transparent">
            <Table.Cell>交易币对</Table.Cell>
            <Table.Cell>开仓价格</Table.Cell>
            <Table.Cell>持仓数量</Table.Cell>
            <Table.Cell textAlign="end">未实现盈亏</Table.Cell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {datasource.map((position) => (
            <Table.Row key={position.id} width="full" bg="transparent">
              <Table.Cell aria-label="交易币对">{position.symbol}</Table.Cell>
              <Table.Cell aria-label="开仓价格">{position.price}</Table.Cell>
              <Table.Cell aria-label="持仓数量">{position.amount}</Table.Cell>
              <Table.Cell aria-label="未实现盈亏" textAlign='end'>
                {marketPrice ? (
                  <PnlRow
                    position={{
                      entryPrice: position.price,
                      quantity: position.amount,
                      leverage: 1,
                    }}
                    price={marketPrice}
                  />
                ) : (
                  '--'
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      {datasource.length === 0 && (
        <Empty />
      )}
    </Box>
  );
};
