import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'RSK-Split · On-Chain Bill Splitting',
  description: 'Peer-to-peer bill splitting on Rootstock. Split rBTC. No middlemen.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-950 text-ink-100 font-mono antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}