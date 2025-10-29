'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, Time } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';

// which is kline point flatterned
type KlineArray = [number, number, number, number, number, number];

export interface KlinePoint {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface KlineChartProps {
  symbol: string;
  interval?: string; // e.g. "1m", "5m", "1h", "1d"
  limit?: number;
  data?: KlineArray[];
  height?: number | string;
}

function toCandlestickData(item: unknown): CandlestickData | null {
  const TZ_OFFSET_SEC = 8 * 60 * 60; // 东八区偏移（+08:00）
  try {
    if (Array.isArray(item)) {
      const [ts, open, high, low, close] = item;
      if (ts == null || open == null || high == null || low == null || close == null) return null;

      // ts should be timestamp.
      const tsNum = typeof ts === 'number' ? ts : Number(ts);
      if (isNaN(tsNum)) return null;

      // format milliseconds. 
      const time = tsNum > 1e12 ? Math.floor(tsNum / 1000) : tsNum;

      return {
        // 转为东八区时间
        time: (time + TZ_OFFSET_SEC) as Time,
        open: Number(open),
        high: Number(high),
        low: Number(low),
        close: Number(close),
      } as CandlestickData;
    }

    // object case format.
    // FIXME: no use after adapter.
    if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>;
      // possible keys: time, timestamp, t, open, high, low, close
      const maybeTime = (obj.time ?? obj.timestamp ?? obj.t) as unknown;
      const maybeOpen = obj.open ?? obj.o;
      const maybeHigh = obj.high ?? obj.h;
      const maybeLow = obj.low ?? obj.l;
      const maybeClose = obj.close ?? obj.c;

      if (
        maybeTime == null ||
        maybeOpen == null ||
        maybeHigh == null ||
        maybeLow == null ||
        maybeClose == null
      ) {
        return null;
      }

      const tsNum = typeof maybeTime === 'number' ? maybeTime : parseInt(String(maybeTime), 10);
      const time = tsNum > 1e12 ? Math.floor(tsNum / 1000) : tsNum;
      return {
        // 转为东八区时间
        time: (time + TZ_OFFSET_SEC) as Time,
        open: Number(maybeOpen),
        high: Number(maybeHigh),
        low: Number(maybeLow),
        close: Number(maybeClose),
      } as CandlestickData;
    }
  } catch (e) {
    console.warn('toCandlestickData parse error:', e, item);
  }
  return null;
}

export default function KlineChart({
  symbol,
  interval = '1d',
  limit = 200,
  data,
  height = 520,
}: KlineChartProps) {

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [computedHeight, setComputedHeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // determine initial height: prefer computedHeight (from parent), else prop height or fallback
    const resolvedHeight = computedHeight ?? (typeof height === 'number' ? height : 520);

    // create chart instance
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: resolvedHeight,
      layout: {
        background: { color: 'transparent' },
        textColor: '#d1d8e0',
      },
      // make grid / axis lines subtle (浅色), apperance should looks good.
      grid: {
        vertLines: { color: 'rgba(209,216,224,0.06)' },
        horzLines: { color: 'rgba(209,216,224,0.06)' },
      },
      rightPriceScale: { borderVisible: false, borderColor: 'transparent' },
      timeScale: { borderVisible: false, timeVisible: true, borderColor: 'transparent' },
      crosshair: {
        vertLine: { color: 'rgba(209,216,224,0.06)', width: 1, style: 0 },
        horzLine: { color: 'rgba(209,216,224,0.06)', width: 1, style: 0 },
      },
      localization: { dateFormat: 'yyyy-MM-dd' },
    });

    chartRef.current = chart;

    // candle series config
    const candleSeries = (
      chart as { addCandlestickSeries: (options: object) => ISeriesApi<'Candlestick'> }
    ).addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    seriesRef.current = candleSeries;

    const handleResize = () => {
      if (!containerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      try {
        chart.remove();
      } catch {
        // ignore
      }
      chartRef.current = null;
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // observe parent element size to compute a dynamic height for the chart
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const parent = el.parentElement;
    if (!parent) return;

    // set initial
    setComputedHeight(parent.clientHeight || null);

    const ro = new ResizeObserver(() => {
      // update height when parent resizes
      setComputedHeight(parent.clientHeight || null);
    });
    ro.observe(parent);

    return () => {
      try {
        ro.disconnect();
      } catch {}
    };
  }, []);

  // when computedHeight changes, apply it to chart instance
  useEffect(() => {
    if (!chartRef.current) return;
    if (computedHeight == null) return;
    try {
      chartRef.current.applyOptions({ height: computedHeight });
    } catch {
      // ignore
    }
  }, [computedHeight]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (!mounted) return;
        const raw = Array.isArray(data) ? data : [];

        // format data and sort by time ascending
        const candlesticks = raw
          .map(toCandlestickData)
          .filter((v): v is CandlestickData => v !== null)
          .sort((a, b) => Number(a.time) - Number(b.time));

        seriesRef.current?.setData(candlesticks);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      } finally {
        setLoading(false);
      }
    }

    // main
    load();

    return () => {
      mounted = false;
    };
  }, [symbol, interval, limit, data]);

  return (
    <div style={{ width: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height }} />
      {loading && <div style={{ color: '#9aa7b2', padding: 8 }}>加载中...</div>}
      {error && <div style={{ color: '#ff7675', padding: 8 }}>错误: {error}</div>}
    </div>
  );
}