import { renderHook } from '@testing-library/react';
import { useInstrument } from '../useInstrument';
import { useParams } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

describe('useInstrument', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return uppercase instId from params', () => {
    (useParams as jest.Mock).mockReturnValue({ instId: 'btc-usdt' });

    const { result } = renderHook(() => useInstrument());

    expect(result.current.instId).toBe('BTC-USDT');
  });

  it('should handle already uppercase instId', () => {
    (useParams as jest.Mock).mockReturnValue({ instId: 'ETH-USDT' });

    const { result } = renderHook(() => useInstrument());

    expect(result.current.instId).toBe('ETH-USDT');
  });

  it('should return default BTC-USDT when instId is undefined', () => {
    (useParams as jest.Mock).mockReturnValue({ instId: undefined });

    const { result } = renderHook(() => useInstrument());

    expect(result.current.instId).toBe('BTC-USDT');
  });

  it('should return default BTC-USDT when instId is null', () => {
    (useParams as jest.Mock).mockReturnValue({ instId: null });

    const { result } = renderHook(() => useInstrument());

    expect(result.current.instId).toBe('BTC-USDT');
  });

  it('should return default BTC-USDT when params is empty', () => {
    (useParams as jest.Mock).mockReturnValue({});

    const { result } = renderHook(() => useInstrument());

    expect(result.current.instId).toBe('BTC-USDT');
  });

  it('should handle mixed case instId', () => {
    (useParams as jest.Mock).mockReturnValue({ instId: 'Btc-UsDt' });

    const { result } = renderHook(() => useInstrument());

    expect(result.current.instId).toBe('BTC-USDT');
  });

  it('should convert number instId to string and uppercase', () => {
    (useParams as jest.Mock).mockReturnValue({ instId: 123 });

    const { result } = renderHook(() => useInstrument());

    expect(result.current.instId).toBe('123');
  });
});
