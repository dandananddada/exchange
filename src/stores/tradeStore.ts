import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MatchingEngine } from '@/services/matchingEngine';
import { LocalStorageService } from '@/services/storage';
import { OrderBook } from '@/types/order-book';
import { TradeStoreState } from '@/types/stores/trade';
import { TradeOrder, TradeResult } from '@/types/trade';

const storageService = new LocalStorageService();
const createStorage = (storageService: LocalStorageService) => {
  return {
    getItem: (name: string) => {
      const item = storageService.getItem(name);
      return Promise.resolve(item ? JSON.stringify(item) : null);
    },
    setItem: (name: string, value: string) => {
      storageService.setItem(name, JSON.parse(value));
      return Promise.resolve();
    },
    removeItem: (name: string) => {
      storageService.removeItem(name);
      return Promise.resolve();
    },
  };
};


export const useTradeStore = create<TradeStoreState<MatchingEngine>>()(
  persist(
    (set, get) => ({
      openOrders: [],
      positions: [],
      orderHistory: [],
      engine: null,

      initializeEngine: (orderBook: OrderBook) => {
        const engine = new MatchingEngine(orderBook);
        set({ engine });
      },

      executeOrder: (orderParams): TradeResult => {
        const { engine, openOrders, positions, orderHistory } = get();
        const { symbol } = orderParams;
        
        if (!engine) {
          throw new Error('Matching engine not initialized');
        }

        const order: TradeOrder = {
          ...orderParams,
          id: engine.generateOrderId(),
          symbol: symbol,
          status: 'open',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        // 执行撮合
        const result = engine.executeOrder(order);
        
        // 更新状态
        const updatedOpenOrders = [...openOrders];
        const updatedPositions = [...positions];
        const updatedOrderHistory = [...orderHistory];

        // 处理成交部分
        if (result.filled.length > 0) {
          result.filled.forEach(fill => {
            const position: TradeOrder = {
              id: engine.generateOrderId(),
              symbol: symbol,
              price: fill.price,
              amount: fill.amount,
              side: order.side,
              createdAt: Date.now(),
              status: 'filled',
            };
            updatedPositions.push(position);
          });

          // 更新订单状态
          if (result.remaining) {
            order.status = 'partial';
            order.amount = result.remaining.amount;
            order.updatedAt = Date.now();
            updatedOpenOrders.push(order);
          } else {
            order.status = 'filled';
            order.updatedAt = Date.now();
          }
        } else {
          // 完全没有成交
          updatedOpenOrders.push(order);
        }

        // 添加到历史
        updatedOrderHistory.push(order);

        // 更新状态
        set({
          openOrders: updatedOpenOrders,
          positions: updatedPositions,
          orderHistory: updatedOrderHistory,
        });

        return {
          order,
          filled: result.filled.map(fill => ({
            ...fill,
            id: engine.generateOrderId(),
            side: order.side,
            filledAt: Date.now(),
            orderId: order.id,
          })),
          remainingAmount: result.remaining?.amount || 0,
          averagePrice: result.averagePrice || 0,
          totalFilled: result.executedAmount,
        };
      },

      cancelOrder: (orderId: string) => {
        const { openOrders, orderHistory } = get();
        
        const updatedOpenOrders = openOrders.filter(order => order.id !== orderId);
        const updatedOrderHistory = orderHistory.map(order => 
          order.id === orderId 
            ? { ...order, status: 'cancelled', updatedAt: Date.now() }
            : order
        );

        set({
          openOrders: updatedOpenOrders,
          orderHistory: updatedOrderHistory,
        });
      },

      updateOrderBook: (orderBook: OrderBook) => {
        const { engine } = get();
        if (engine) {
          engine.updateOrderBook(orderBook);
        }
      },

      clearStore: () => {
        set({
          openOrders: [],
          positions: [],
          orderHistory: [],
        });
      },

      getOpenOrdersBySide: (side) => {
        const { openOrders } = get();
        return openOrders.filter(order => order.side === side);
      },

      getPositionsBySide: (side) => {
        const { positions } = get();
        return positions.filter(position => position.side === side);
      },

      getTotalPositionValue: () => {
        const { positions } = get();
        return positions.reduce((total, position) => {
          return total + (position.price * position.amount);
        }, 0);
      },
    }),
    {
      name: 'trade-store',
      storage: createJSONStorage(() => createStorage(storageService)),
      partialize: (state) => ({
        openOrders: state.openOrders,
        positions: state.positions,
        orderHistory: state.orderHistory,
      }),
    }
  )
);