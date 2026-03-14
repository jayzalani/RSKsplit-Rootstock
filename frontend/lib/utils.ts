import { formatUnits, parseUnits } from 'viem';

export function formatRBTC(wei: bigint): string {
  const val = parseFloat(formatUnits(wei, 18));
  if (val === 0) return '0';
  if (val < 0.000001) return '< 0.000001';
  return val.toPrecision(6).replace(/\.?0+$/, '');
}

export function parseRBTC(val: string): bigint {
  return parseUnits(val, 18);
}

export function shortenAddress(addr: string, chars = 4): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, chars + 2)}…${addr.slice(-chars)}`;
}

export function formatTimestamp(ts: bigint): string {
  return new Date(Number(ts) * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const STATUS_LABEL = ['ACTIVE', 'SETTLED', 'CANCELLED'] as const;

export function statusClasses(s: number): string {
  if (s === 0) return 'text-gold-400 bg-gold-900/30 border border-gold-900';
  if (s === 1) return 'text-emerald-400 bg-emerald-900/20 border border-emerald-900/40';
  return 'text-red-400 bg-red-900/20 border border-red-900/40';
}