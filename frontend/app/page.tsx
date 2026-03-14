'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Header } from '@/components/Header';
import { ConnectPrompt } from '@/components/ConnectPrompt';
import { CreateBillForm } from '@/components/CreateBillForm';
import { BillLookup } from '@/components/BillLookup';
import { MyBills } from '@/components/MyBills';

type Tab = 'lookup' | 'create' | 'mine';

const TABS: { id: Tab; label: string }[] = [
  { id: 'lookup', label: 'Look Up Bill' },
  { id: 'create', label: 'Create Bill' },
  { id: 'mine', label: 'My Bills' },
];

export default function Home() {
  const { isConnected } = useAccount();
  const [tab, setTab] = useState<Tab>('lookup');

  return (
    <main className="min-h-screen bg-ink-950">
      <Header />

      <div className="max-w-2xl mx-auto px-4 pb-24">
        {/* Hero */}
        <div className="pt-14 pb-10">
          <p className="text-ink-400 text-[10px] tracking-[0.2em] uppercase mb-3">
            Rootstock Testnet · rBTC
          </p>
          <h1
            className="font-display font-bold leading-tight tracking-tight text-ink-100"
            style={{ fontSize: 'clamp(28px, 6vw, 44px)' }}
          >
            Split Bills.<br />
            <span className="text-gold-400">On‑Chain.</span>
          </h1>
          <p className="text-ink-400 mt-3 text-xs max-w-sm leading-relaxed">
            Create a bill, share the ID. Friends pay their exact share in rBTC. funds go straight to you. No custody. No trust required.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-ink-600 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'px-4 py-2 text-[11px] tracking-widest uppercase font-mono transition-colors border-b-2 -mb-px',
                tab === t.id
                  ? 'text-gold-400 border-gold-400'
                  : 'text-ink-400 border-transparent hover:text-ink-200',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div key={tab} className="animate-fade-in">
          {tab === 'lookup' && <BillLookup />}
          {tab === 'create' &&
            (isConnected ? (
              <CreateBillForm />
            ) : (
              <ConnectPrompt message="Connect your wallet to create a bill." />
            ))}
          {tab === 'mine' &&
            (isConnected ? (
              <MyBills />
            ) : (
              <ConnectPrompt message="Connect your wallet to view your bills." />
            ))}
        </div>
      </div>
    </main>
  );
}