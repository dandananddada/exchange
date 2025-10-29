import { renderHook, act } from '@testing-library/react';
import { useOrderTrade } from '../useOrderTrade';
import { useTradeStore } from '@/stores/tradeStore';
import { OrderParams } from '@/types/trade';
import { OrderBook } from '@/types/order-book';

// Mock the trade store
jest.mock('@/stores/tradeStore');

describe('useOrderTrade', () => {
  const mockEngine = {};
  
  const mockOpenOrders = [
    { id: '1', price: 30000, amount: 0.5, side: 'buy' as const, symbol: 'BTC-USDT', timestamp: Date.now() },
    { id: '2', price: 31000, amount: 0.3, side: 'sell' as const, symbol: 'BTC-USDT', timestamp: Date.now() },
  ];

  const mockPositions = [
    { id: '3', price: 30000, amount: 1, side: 'buy' as const, symbol: 'BTC-USDT', timestamp: Date.now() },
  ];

  const mockStore = {
    engine: mockEngine,
    openOrders: mockOpenOrders,
    positions: mockPositions,
    orderHistory: [],
    initializeEngine: jest.fn(),
    executeOrder: jest.fn(),
    cancelOrder: jest.fn(),
    updateOrderBook: jest.fn(),
    clearStore: jest.fn(),
    getOpenOrdersBySide: jest.fn((side) => 
      mockOpenOrders.filter(order => order.side === side)
    ),
    getPositionsBySide: jest.fn((side) => 
      mockPositions.filter(pos => pos.side === side)
    ),
    getTotalPositionValue: jest.fn(() => 30000),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTradeStore as unknown as jest.Mock).mockReturnValue(mockStore);
  });

  it('should return engine status', () => {
    const { result } = renderHook(() => useOrderTrade());

    expect(result.current.engine).toBe(true); // engine is not null
  });

  it('should return open orders', () => {
    const { result } = renderHook(() => useOrderTrade());

    expect(result.current.openOrders).toEqual(mockOpenOrders);
    expect(result.current.hasOpenOrders).toBe(true);
  });

  it('should return positions', () => {
    const { result } = renderHook(() => useOrderTrade());

    expect(result.current.positions).toEqual(mockPositions);
    expect(result.current.hasPositions).toBe(true);
  });

  it('should filter buy orders', () => {
    const { result } = renderHook(() => useOrderTrade());

    expect(mockStore.getOpenOrdersBySide).toHaveBeenCalledWith('buy');
    expect(result.current.buyOrders.length).toBe(1);
    expect(result.current.buyOrders[0].side).toBe('buy');
  });

  it('should filter sell orders', () => {
    const { result } = renderHook(() => useOrderTrade());

    expect(mockStore.getOpenOrdersBySide).toHaveBeenCalledWith('sell');
    expect(result.current.sellOrders.length).toBe(1);
    expect(result.current.sellOrders[0].side).toBe('sell');
  });

  it('should filter long positions', () => {
    const { result } = renderHook(() => useOrderTrade());

    expect(mockStore.getPositionsBySide).toHaveBeenCalledWith('buy');
    expect(result.current.longPositions.length).toBe(1);
  });

  it('should filter short positions', () => {
    const { result } = renderHook(() => useOrderTrade());

    expect(mockStore.getPositionsBySide).toHaveBeenCalledWith('sell');
  });

  it('should return total position value', () => {
    const { result } = renderHook(() => useOrderTrade());

    expect(result.current.totalPositionValue).toBe(30000);
  });

  it('should place order when engine is initialized', () => {
    const { result } = renderHook(() => useOrderTrade());

    const orderParams: OrderParams = {
      price: 30000,
      amount: 1,
      side: 'buy',
      symbol: 'BTC-USDT',
    };

    act(() => {
      result.current.placeOrder(orderParams);
    });

    expect(mockStore.executeOrder).toHaveBeenCalledWith(orderParams);
  });

  it('should throw error when placing order without initialized engine', () => {
    mockStore.engine = null;

    const { result } = renderHook(() => useOrderTrade());

    const orderParams: OrderParams = {
      price: 30000,
      amount: 1,
      side: 'buy',
      symbol: 'BTC-USDT',
    };

    expect(() => {
      result.current.placeOrder(orderParams);
    }).toThrow('Trading engine not initialized. Call initialize() first.');
  });

  it('should initialize engine', () => {
    const { result } = renderHook(() => useOrderTrade());

    act(() => {
      result.current.initializeEngine({} as OrderBook);
    });

    expect(mockStore.initializeEngine).toHaveBeenCalled();
  });

  it('should cancel order', () => {
    const { result } = renderHook(() => useOrderTrade());

    act(() => {
      result.current.cancelOrder('order-1');
    });

    expect(mockStore.cancelOrder).toHaveBeenCalledWith('order-1');
  });

  it('should update order book', () => {
    const { result } = renderHook(() => useOrderTrade());

    const newOrderBook: OrderBook = {
      bids: [[30000, 1]],
      asks: [[31000, 1]],
    };

    act(() => {
      result.current.updateOrderBook(newOrderBook);
    });

    expect(mockStore.updateOrderBook).toHaveBeenCalledWith(newOrderBook);
  });

  it('should clear store', () => {
    const { result } = renderHook(() => useOrderTrade());

    act(() => {
      result.current.clearStore();
    });

    expect(mockStore.clearStore).toHaveBeenCalled();
  });

  it('should return false for hasOpenOrders when no orders', () => {
    mockStore.openOrders = [];

    const { result } = renderHook(() => useOrderTrade());

    expect(result.current.hasOpenOrders).toBe(false);
  });

  it('should return false for hasPositions when no positions', () => {
    mockStore.positions = [];

    const { result } = renderHook(() => useOrderTrade());

    expect(result.current.hasPositions).toBe(false);
  });

  it('should return order history', () => {
    const mockHistory = [
      { id: '10', price: 29000, amount: 0.5, side: 'buy' as const, symbol: 'BTC-USDT', timestamp: Date.now() },
    ];
    mockStore.orderHistory = mockHistory;

    const { result } = renderHook(() => useOrderTrade());

    expect(result.current.orderHistory).toEqual(mockHistory);
  });
});
