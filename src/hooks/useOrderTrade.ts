import { useCallback } from 'react';
import { useTradeStore } from '@/stores/tradeStore';

import { OrderBook } from '@/types/order-book';
import { OrderParams } from '@/types/trade';

export const useOrderTrade = () => {
  const {
    engine,
    openOrders,
    positions,
    orderHistory,
    initializeEngine,
    executeOrder,
    cancelOrder,
    updateOrderBook,
    clearStore,
    getOpenOrdersBySide,
    getPositionsBySide,
    getTotalPositionValue,
  } = useTradeStore();

  const placeOrder = useCallback((orderParams: OrderParams) => {
    if (!engine) {
      throw new Error('Trading engine not initialized. Call initialize() first.');
    }
    return executeOrder(orderParams);
  }, [engine, executeOrder]);

  // update order book 
  const updateOrderBookData = useCallback((newOrderBook: OrderBook) => {
    updateOrderBook(newOrderBook);
  }, [updateOrderBook]);

  const buyOrders = getOpenOrdersBySide('buy');
  const sellOrders = getOpenOrdersBySide('sell');
  const longPositions = getPositionsBySide('buy');
  const shortPositions = getPositionsBySide('sell');

  return {
    engine: engine !== null,
    openOrders,
    positions,
    orderHistory,
    buyOrders,
    sellOrders,
    longPositions,
    shortPositions,
    totalPositionValue: getTotalPositionValue(),

    initializeEngine,
    placeOrder,
    cancelOrder,
    updateOrderBook: updateOrderBookData,
    clearStore,

    hasOpenOrders: openOrders.length > 0,
    hasPositions: positions.length > 0,
  };
};