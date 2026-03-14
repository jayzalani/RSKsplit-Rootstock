'use client';

import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { shortenAddress, formatRBTC } from '@/lib/utils';
import { ROOTSTOCK_TESTNET } from '@/lib/contract';

export function Header() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address, chainId: ROOTSTOCK_TESTNET.id });

  const wrongNetwork = isConnected && chainId !== ROOTSTOCK_TESTNET.id;

  return (
    <header className="border-b border-ink-600 bg-ink-950">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-gold-400 rounded-sm flex items-center justify-center flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1.5 2.5h10M1.5 6.5h10M1.5 10.5h6" stroke="#0a0a08" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </div>
          <span className="font-display font-bold text-sm tracking-wide text-ink-100">
            RSK<span className="text-gold-400">-SPLIT</span>
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {wrongNetwork && (
            <button
              onClick={() => switchChain({ chainId: ROOTSTOCK_TESTNET.id })}
              className="px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-red-400 border border-red-900/50 rounded-sm hover:bg-red-900/20 transition-colors"
            >
              ⚠ Wrong Network
            </button>
          )}

          {isConnected && !wrongNetwork ? (
            <div className="flex items-center gap-3">
              {balance && (
                <span className="hidden sm:block text-ink-400 text-[11px]">
                  {formatRBTC(balance.value)} tRBTC
                </span>
              )}
              <button
                onClick={() => disconnect()}
                title={address}
                className="px-3 py-1.5 text-[11px] tracking-widest uppercase text-ink-300 border border-ink-600 rounded-sm hover:text-ink-100 hover:border-ink-400 transition-colors"
              >
                {shortenAddress(address ?? '')}
              </button>
            </div>
          ) : !wrongNetwork ? (
            <button
              onClick={() => connect({ connector: metaMask(), chainId: ROOTSTOCK_TESTNET.id })}
              disabled={isPending}
              className="px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase bg-gold-400 text-ink-950 rounded-sm hover:bg-gold-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? 'Connecting…' : 'Connect Wallet'}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}