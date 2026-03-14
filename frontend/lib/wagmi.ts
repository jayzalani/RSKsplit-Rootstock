'use client';

import { createConfig, http } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { ROOTSTOCK_TESTNET } from './contract';

export const wagmiConfig = createConfig({
  chains: [ROOTSTOCK_TESTNET],
  connectors: [metaMask()],
  transports: {
    [ROOTSTOCK_TESTNET.id]: http('https://public-node.testnet.rsk.co'),
  },
  ssr: true,
});