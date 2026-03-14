'use client';

import { useState } from 'react';
import { BillReceipt } from './BillReceipt';

export function BillLookup() {
  const [inputId, setInputId] = useState('');
  const [billId, setBillId] = useState<bigint | null>(null);
  const [error, setError] = useState('');

  function handleLookup() {
    const trimmed = inputId.trim();
    const num = Number(trimmed);
    if (!trimmed || isNaN(num) || !Number.isInteger(num) || num <= 0) {
      setError('Please enter a valid bill ID (e.g. 1, 42).');
      return;
    }
    setError('');
    setBillId(BigInt(trimmed));
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-ink-400 tracking-[0.15em] uppercase">Bill ID</label>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            placeholder="e.g. 42"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            className="bg-ink-900 border border-ink-600 text-ink-100 font-mono text-xs px-3 py-2 rounded-sm outline-none focus:border-gold-500 placeholder:text-ink-500 transition-colors w-36"
          />
          <button
            onClick={handleLookup}
            className="px-4 py-2 text-[11px] font-bold tracking-widest uppercase bg-gold-400 text-ink-950 rounded-sm hover:bg-gold-300 transition-colors"
          >
            View
          </button>
          {billId !== null && (
            <button
              onClick={() => { setBillId(null); setInputId(''); }}
              className="px-3 py-2 text-[11px] tracking-widest uppercase text-ink-400 border border-ink-600 rounded-sm hover:text-ink-200 hover:border-ink-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        {error && <p className="text-red-400 text-[11px]">{error}</p>}
      </div>

      {billId !== null ? (
        <BillReceipt billId={billId} onClose={() => setBillId(null)} />
      ) : (
        <div className="border border-dashed border-ink-700 rounded-sm p-10 text-center text-ink-500 text-xs">
          Enter a bill ID to view the live receipt
        </div>
      )}
    </div>
  );
}