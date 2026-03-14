'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, isAddress } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { BillReceipt } from './BillReceipt';

export function CreateBillForm() {
  const [description, setDescription] = useState('');
  const [totalAmountStr, setTotalAmountStr] = useState('');
  const [participantInput, setParticipantInput] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdBillId, setCreatedBillId] = useState<bigint | null>(null);

  const { writeContract, data: hash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: confirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess && receipt) {
      for (const log of receipt.logs) {
        if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase() && log.topics.length >= 2) {
          try {
            const id = BigInt(log.topics[1] as string);
            if (id > 0n) { setCreatedBillId(id); break; }
          } catch {}
        }
      }
    }
  }, [isSuccess, receipt]);

  const sharePreview = (() => {
    try {
      if (!totalAmountStr || participants.length < 2) return null;
      const wei = parseUnits(totalAmountStr, 18);
      if (wei % BigInt(participants.length) !== 0n) return null;
      const share = wei / BigInt(participants.length);
      return parseFloat((Number(share) / 1e18).toFixed(10)).toString().replace(/\.?0+$/, '');
    } catch { return null; }
  })();

  function addParticipant() {
    const addr = participantInput.trim();
    if (!isAddress(addr)) { setErrors((e) => ({ ...e, participant: 'Invalid address.' })); return; }
    if (participants.map((p) => p.toLowerCase()).includes(addr.toLowerCase())) { setErrors((e) => ({ ...e, participant: 'Already added.' })); return; }
    if (participants.length >= 50) { setErrors((e) => ({ ...e, participant: 'Max 50 participants.' })); return; }
    setParticipants((p) => [...p, addr.toLowerCase()]);
    setParticipantInput('');
    setErrors((e) => ({ ...e, participant: '' }));
  }

  function handleCreate() {
    const errs: Record<string, string> = {};
    if (!description.trim()) errs.description = 'Required.';
    const amount = parseFloat(totalAmountStr);
    if (!totalAmountStr || isNaN(amount) || amount <= 0) errs.amount = 'Enter a valid positive amount.';
    if (participants.length < 2) errs.participants = 'Minimum 2 participants required.';
    if (!errs.amount && !errs.participants) {
      try {
        const wei = parseUnits(totalAmountStr, 18);
        if (wei % BigInt(participants.length) !== 0n)
          errs.amount = `Amount must be divisible by ${participants.length} (number of participants).`;
      } catch { errs.amount = 'Invalid amount format.'; }
    }
    if (Object.values(errs).some(Boolean)) { setErrors(errs); return; }
    setErrors({});
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'createBill',
      args: [participants as `0x${string}`[], parseUnits(totalAmountStr, 18), description],
    });
  }

  function handleReset() {
    reset();
    setCreatedBillId(null);
    setDescription('');
    setTotalAmountStr('');
    setParticipants([]);
    setErrors({});
  }

  if (isSuccess && createdBillId !== null) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-emerald-400 text-xs flex items-center gap-2"><span>✓</span> Bill created on-chain</p>
        <BillReceipt billId={createdBillId} />
        <button onClick={handleReset} className="self-start px-4 py-2 text-[11px] tracking-widest uppercase text-ink-400 border border-ink-600 rounded-sm hover:text-ink-200 hover:border-ink-400 transition-colors">
          Create Another
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-ink-400 tracking-[0.15em] uppercase">Description</label>
        <input
          type="text"
          placeholder="e.g. Dinner at Sushi Bar"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-ink-900 border border-ink-600 text-ink-100 font-mono text-xs px-3 py-2 rounded-sm outline-none focus:border-gold-500 placeholder:text-ink-500 transition-colors"
        />
        {errors.description && <p className="text-red-400 text-[11px]">{errors.description}</p>}
      </div>

      {/* Total amount */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-ink-400 tracking-[0.15em] uppercase">Total Amount (tRBTC)</label>
        <input
          type="number"
          min="0"
          step="any"
          placeholder="e.g. 0.006"
          value={totalAmountStr}
          onChange={(e) => setTotalAmountStr(e.target.value)}
          className="bg-ink-900 border border-ink-600 text-ink-100 font-mono text-xs px-3 py-2 rounded-sm outline-none focus:border-gold-500 placeholder:text-ink-500 transition-colors w-48"
        />
        {sharePreview && participants.length >= 2 && (
          <p className="text-ink-400 text-[10px]">→ {sharePreview} tRBTC per person</p>
        )}
        {errors.amount && <p className="text-red-400 text-[11px]">{errors.amount}</p>}
      </div>

      {/* Participants */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-ink-400 tracking-[0.15em] uppercase">
          Participants ({participants.length}/50, min 2)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="0x… wallet address"
            value={participantInput}
            onChange={(e) => setParticipantInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
            className="bg-ink-900 border border-ink-600 text-ink-100 font-mono text-xs px-3 py-2 rounded-sm outline-none focus:border-gold-500 placeholder:text-ink-500 transition-colors flex-1"
          />
          <button
            onClick={addParticipant}
            className="flex-shrink-0 px-4 py-2 text-[11px] tracking-widest uppercase text-ink-300 border border-ink-600 rounded-sm hover:text-ink-100 hover:border-ink-400 transition-colors"
          >
            Add
          </button>
        </div>
        {errors.participant && <p className="text-red-400 text-[11px]">{errors.participant}</p>}
        {errors.participants && <p className="text-red-400 text-[11px]">{errors.participants}</p>}

        {participants.length > 0 && (
          <div className="flex flex-col gap-1 mt-1">
            {participants.map((addr, i) => (
              <div key={addr} className="flex items-center justify-between bg-ink-950 border border-ink-700 px-3 py-2 rounded-sm">
                <span className="text-[11px] text-ink-400 font-mono truncate">
                  <span className="text-ink-600 mr-2">#{i + 1}</span>{addr}
                </span>
                <button
                  onClick={() => setParticipants((p) => p.filter((x) => x !== addr))}
                  className="text-ink-600 hover:text-ink-200 text-base leading-none ml-3 flex-shrink-0 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-ink-700" />

      {/* Submit */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleCreate}
          disabled={isPending || confirming}
          className="w-full py-2.5 text-[11px] font-bold tracking-widest uppercase bg-gold-400 text-ink-950 rounded-sm hover:bg-gold-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Awaiting wallet…' : confirming ? 'Confirming on-chain…' : 'Create Bill'}
        </button>
        {writeError && (
          <p className="text-red-400 text-[11px] text-center">
            {writeError.message?.split('\n')[0] ?? 'Transaction failed'}
          </p>
        )}
      </div>
    </div>
  );
}