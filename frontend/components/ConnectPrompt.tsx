'use client';

import { useConnect } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { ROOTSTOCK_TESTNET } from '@/lib/contract';

export function ConnectPrompt({ message }: { message: string }) {
  const { connect, isPending } = useConnect();

  return (
    <div className="border border-dashed border-ink-600 rounded-sm p-12 flex flex-col items-center gap-4 text-center">
      <p className="text-ink-400 text-xs">{message}</p>
      <button
        onClick={() => connect({ connector: metaMask(), chainId: ROOTSTOCK_TESTNET.id })}
        disabled={isPending}
        className="px-5 py-2 text-[11px] font-bold tracking-widest uppercase bg-gold-400 text-ink-950 rounded-sm hover:bg-gold-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? 'Connecting…' : 'Connect Wallet'}
      </button>
    </div>
  );
}