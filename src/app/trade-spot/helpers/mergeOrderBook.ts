import { OKXOrderBook } from "@/types/okx";

type DataType = OKXOrderBook['asks'] | OKXOrderBook['bids'];
export default function mergeOrderBook(fromData: DataType, toData: DataType, limit = 20) {
    const map = new Map<number, string[]>();
    for (const level of [...toData, ...fromData]) {
      const priceNum = Number(level[0]);
      if (!Number.isFinite(priceNum)) continue;
      if (!map.has(priceNum)) {
        map.set(priceNum, level);
      }
    }
    const merged = Array.from(map.values());
    merged.sort((a, b) => Number(b[0]) - Number(a[0]));
    return merged.slice(0, limit);
}