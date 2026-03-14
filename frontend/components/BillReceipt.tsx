'use client';

import { useEffect } from 'react';
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { formatRBTC, shortenAddress, STATUS_LABEL, statusClasses, formatTimestamp } from '@/lib/utils';

const ZERO = '0x0000000000000000000000000000000000000000' as `0x${string}`;

interface Props {
  billId: bigint;
  onClose?: () => void;
}

export function BillReceipt({ billId, onClose }: Props) {
  const { address } = useAccount();

  const { data: billData, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getBillStatus',
    args: [billId],
  });

  const { data: hasPaid, refetch: refetchPaid } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasPaid',
    args: [billId, address ?? ZERO],
    query: { enabled: !!address },
  });

  const { data: isParticipant } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isParticipant',
    args: [billId, address ?? ZERO],
    query: { enabled: !!address },
  });

  const { writeContract: payShare, data: payHash, isPending: payPending, error: payError } = useWriteContract();
  const { isLoading: payConfirming, isSuccess: paySuccess } = useWaitForTransactionReceipt({ hash: payHash });

  const { writeContract: cancelBill, data: cancelHash, isPending: cancelPending, error: cancelError } = useWriteContract();
  const { isLoading: cancelConfirming, isSuccess: cancelSuccess } = useWaitForTransactionReceipt({ hash: cancelHash });

  useEffect(() => {
    if (paySuccess || cancelSuccess) {
      refetch();
      refetchPaid();
    }
  }, [paySuccess, cancelSuccess]);

  if (isLoading) {
    return (
      <div className="border border-ink-600 rounded-sm p-8 text-center text-ink-400 text-xs animate-pulse">
        Loading receipt…
      </div>
    );
  }

  if (!billData) {
    return (
      <div className="border border-ink-600 rounded-sm p-8 text-center text-red-400 text-xs">
        Bill #{billId.toString()} not found.
      </div>
    );
  }

  const [payer, status, totalAmount, sharePerPerson, participantCount, paidCount, totalReceived, description, createdAt] = billData;
  const statusNum = Number(status);
  const progress = participantCount > 0n ? Number((paidCount * 100n) / participantCount) : 0;
  const remaining = totalAmount - totalReceived;
  const isPayer = address?.toLowerCase() === payer.toLowerCase();
  const canPay = isParticipant && !hasPaid && statusNum === 0;
  const canCancel = isPayer && statusNum === 0 && paidCount === 0n;

  return (
    <div className="border border-ink-600 rounded-sm overflow-hidden animate-slide-up bg-ink-900">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-dashed border-ink-600">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display font-bold text-base text-ink-100">
              BILL #{billId.toString().padStart(4, '0')}
            </span>
            <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm ${statusClasses(statusNum)}`}>
              {STATUS_LABEL[statusNum]}
            </span>
          </div>
          <p className="text-ink-400 text-[11px]">{description || '(no description)'}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-ink-500 hover:text-ink-200 text-xl leading-none transition-colors flex-shrink-0 mt-0.5">
            ×
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex flex-col gap-4">
        {/* Amounts */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total', value: `${formatRBTC(totalAmount)} tRBTC` },
            { label: 'Per Person', value: `${formatRBTC(sharePerPerson)} tRBTC` },
            { label: 'Remaining', value: `${formatRBTC(remaining)} tRBTC` },
          ].map((item) => (
            <div key={item.label} className="bg-ink-950 border border-ink-700 rounded-sm px-3 py-2.5">
              <p className="text-ink-400 text-[9px] tracking-[0.15em] uppercase mb-1">{item.label}</p>
              <p className="text-gold-400 text-xs font-bold">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-[10px] text-ink-400 mb-1.5">
            <span className="tracking-wider uppercase">Payment Progress</span>
            <span className="text-ink-200">{paidCount.toString()} / {participantCount.toString()} paid</span>
          </div>
          <div className="h-0.5 bg-ink-700 rounded-full overflow-hidden">
            <div className="h-full bg-gold-400 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Meta */}
        <div className="border-t border-dashed border-ink-700 pt-3 flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-ink-400 tracking-wider uppercase text-[10px]">Payer</span>
            <span className="text-ink-200 font-mono">
              {shortenAddress(payer)}
              {isPayer && <span className="text-gold-400 ml-2 text-[10px]">(you)</span>}
            </span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-ink-400 tracking-wider uppercase text-[10px]">Created</span>
            <span className="text-ink-200">{formatTimestamp(createdAt)}</span>
          </div>
        </div>

        {/* Your status + pay */}
        {address && (
          <div className={`bg-ink-950 border rounded-sm px-3 py-2.5 flex items-center justify-between gap-3 ${canPay ? 'border-gold-900' : 'border-ink-700'}`}>
            <div>
              <p className="text-[9px] text-ink-400 tracking-[0.15em] uppercase mb-0.5">Your status</p>
              <p className={`text-xs ${!isParticipant && !isPayer ? 'text-ink-400' : isPayer ? 'text-ink-300' : hasPaid ? 'text-emerald-400' : 'text-gold-400'}`}>
                {!isParticipant && !isPayer ? 'Not a participant' : isPayer ? 'You are the payer' : hasPaid ? '✓ Paid' : '⧖ Awaiting your payment'}
              </p>
            </div>
            {canPay && (
              <button
                onClick={() => payShare({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'payShare', args: [billId], value: sharePerPerson })}
                disabled={payPending || payConfirming}
                className="flex-shrink-0 px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase bg-gold-400 text-ink-950 rounded-sm hover:bg-gold-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {payPending || payConfirming ? 'Confirming…' : `Pay ${formatRBTC(sharePerPerson)} tRBTC`}
              </button>
            )}
          </div>
        )}

        {/* Cancel */}
        {canCancel && (
          <button
            onClick={() => cancelBill({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'cancelBill', args: [billId] })}
            disabled={cancelPending || cancelConfirming}
            className="w-full py-2 text-[11px] font-bold tracking-widest uppercase text-red-400 border border-red-900/40 rounded-sm hover:bg-red-900/20 hover:border-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {cancelPending || cancelConfirming ? 'Cancelling…' : 'Cancel Bill'}
          </button>
        )}

        {/* Feedback */}
        {payError && <p className="text-red-400 text-[11px] text-center">{payError.message?.split('\n')[0]}</p>}
        {cancelError && <p className="text-red-400 text-[11px] text-center">{cancelError.message?.split('\n')[0]}</p>}
        {paySuccess && <p className="text-emerald-400 text-[11px] text-center">✓ Payment confirmed on-chain</p>}
        {cancelSuccess && <p className="text-red-400 text-[11px] text-center">Bill cancelled</p>}
      </div>
    </div>
  );
}