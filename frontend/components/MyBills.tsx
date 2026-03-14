'use client';

import { useAccount, useReadContract } from 'wagmi';
import { useState } from 'react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { statusClasses, STATUS_LABEL, formatRBTC } from '@/lib/utils';
import { BillReceipt } from './BillReceipt';

function BillRow({
  billId,
  payerAddress,
  selected,
  onSelect,
}: {
  billId: bigint;
  payerAddress: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getBillStatus',
    args: [billId],
  });

  if (!data) return null;
  const [payer, status, totalAmount, , participantCount, paidCount, , description] = data;
  if (payer.toLowerCase() !== payerAddress.toLowerCase()) return null;

  const statusNum = Number(status);

  return (
    <button
      onClick={onSelect}
      className={[
        'w-full flex items-center justify-between gap-4 px-4 py-3 rounded-sm border text-left transition-colors',
        selected
          ? 'bg-gold-900/20 border-gold-900'
          : 'bg-ink-950 border-ink-700 hover:border-ink-500',
      ].join(' ')}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-display font-bold text-xs text-ink-100">
            #{billId.toString().padStart(4, '0')}
          </span>
          <span className="text-ink-400 text-[11px] truncate">
            {description || '(no description)'}
          </span>
        </div>
        <p className="text-[10px] text-ink-500">
          {paidCount.toString()}/{participantCount.toString()} paid · {formatRBTC(totalAmount)} tRBTC total
        </p>
      </div>
      <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm flex-shrink-0 ${statusClasses(statusNum)}`}>
        {STATUS_LABEL[statusNum]}
      </span>
    </button>
  );
}

export function MyBills() {
  const { address } = useAccount();
  const [selectedId, setSelectedId] = useState<bigint | null>(null);

  const { data: totalBillCount, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'billCount',
  });

  if (!address) return null;

  const count = Number(totalBillCount ?? 0n);
  const start = Math.max(1, count - 29);
  const ids = Array.from({ length: count - start + 1 }, (_, i) => BigInt(start + i)).reverse();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[10px] text-ink-400 tracking-[0.15em] uppercase">
        Bills you created
        {count > 30 && <span className="text-ink-600 ml-1">(showing last 30 of {count})</span>}
      </p>

      {isLoading && (
        <p className="text-ink-500 text-xs text-center py-8 animate-pulse">Loading…</p>
      )}

      {!isLoading && count === 0 && (
        <div className="border border-dashed border-ink-700 rounded-sm p-10 text-center text-ink-500 text-xs">
          No bills on contract yet.
        </div>
      )}

      {!isLoading && count > 0 && (
        <div className="flex flex-col gap-1.5">
          {ids.map((id) => (
            <BillRow
              key={id.toString()}
              billId={id}
              payerAddress={address}
              selected={selectedId === id}
              onSelect={() => setSelectedId(selectedId === id ? null : id)}
            />
          ))}
        </div>
      )}

      {selectedId !== null && (
        <div className="mt-2">
          <BillReceipt billId={selectedId} onClose={() => setSelectedId(null)} />
        </div>
      )}
    </div>
  );
}