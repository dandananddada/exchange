'use client';

import { Box, Table } from '@chakra-ui/react';

import { TradeOrder } from '@/types/trade';

export const OpenOrders: React.FC<{
  datasource: TradeOrder[]
}> = ({
  datasource = []
}) => {
  return (
    <Box p={4}>
      <Table.Root size="sm" stickyHeader  showColumnBorder={false}>
        <Table.Header>
          <Table.Row bg="transparent">
            <Table.ColumnHeader>交易币对</Table.ColumnHeader>
            <Table.ColumnHeader>交易方向</Table.ColumnHeader>
            <Table.ColumnHeader>价格</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">数量</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {datasource.map((item) => (
            <Table.Row key={item.id} bg="transparent">
              <Table.Cell>{item.symbol}</Table.Cell>
              <Table.Cell>{item.side === 'buy' ? '买入' : '卖出'}</Table.Cell>
              <Table.Cell>{item.price}</Table.Cell>
              <Table.Cell textAlign="end">{item.amount}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}