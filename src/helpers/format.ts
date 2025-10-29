export function formatNumber(
  n: number,
  options: {
    compact?: boolean;
    locale?: string | string[] | undefined;
    // precision 控制最大小数位（不补零）
    precision?: number;
  } = {}
): string {
  const { compact = false, locale = undefined, precision = 5 } = options;

  if (!isFinite(n)) return String(n);

  // 规范 precision 为整数且 >= 0
  const p = Number.isFinite(precision) ? Math.max(0, Math.floor(precision)) : 2;

  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);

  // 不使用 minimumFractionDigits，以避免补零；只设置 maximumFractionDigits
  if (compact) {
    if (abs >= 1e9) {
      const scaled = abs / 1e9;
      return `${sign}${scaled.toLocaleString(locale, { maximumFractionDigits: p })}b`;
    }
    if (abs >= 1e3) {
      const scaled = abs / 1e3;
      return `${sign}${scaled.toLocaleString(locale, { maximumFractionDigits: p })}k`;
    }
    return `${sign}${abs.toLocaleString(locale, { maximumFractionDigits: p })}`;
  } else {
    return `${sign}${abs.toLocaleString(locale, { maximumFractionDigits: p })}`;
  }
}

/*
示例：
formatNumber(1234, { compact: true, precision: 1 }) -> "1.2k"
formatNumber(2500000000, { compact: true, precision: 2 }) -> "2.5b" (如果四舍五入后为整数则不补零)
formatNumber(12.3456, { precision: 3 }) -> "12.346"
formatNumber(12, { precision: 3 }) -> "12"
formatNumber(Infinity) -> "Infinity"
*/