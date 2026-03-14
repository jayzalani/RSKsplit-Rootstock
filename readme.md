# RSK-Split — On-Chain Peer-to-Peer Bill Splitting on Rootstock

> Split expenses with friends in rBTC. No intermediaries. No custody. No trust required.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: Rootstock Testnet](https://img.shields.io/badge/Network-Rootstock%20Testnet-orange)](https://explorer.testnet.rsk.co)
[![Built with: Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow)](https://hardhat.org)
[![Frontend: Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black)](https://nextjs.org)

---

## What is RSK-Split?

RSK-Split is a decentralized bill-splitting application built on the **Rootstock (RSK)** network. One user — the **Payer** — creates a bill on-chain with a list of participant wallet addresses and a total amount. The smart contract automatically calculates equal shares and each participant pays their portion in **rBTC** directly. Funds are forwarded instantly to the Payer with zero custody by the protocol.

No backend. No database. No middleman. Just a smart contract and a frontend.

---

## Live Demo

| Resource | Link |
|---|---|
| Frontend (Vercel) | `https://your-vercel-url.vercel.app` |
| Smart Contract | [`0x2ede00e732bda9304a70b514671912b6ce4d7a7e`](https://explorer.testnet.rsk.co/address/0x2ede00e732bda9304a70b514671912b6ce4d7a7e) |
| RSK Explorer (Verified) | [View on Explorer](https://explorer.testnet.rsk.co/address/0x2ede00e732bda9304a70b514671912b6ce4d7a7e) |
| Network | Rootstock Testnet (Chain ID: 31) |

---

## Features

- **Smart Bill Creation** — Payer sets total amount + participant addresses; contract auto-calculates equal share per person
- **Direct rBTC Settlement** — Each payment is instantly forwarded to the Payer; no funds ever sit in the contract
- **Point of No Return** — Once any participant has paid, the Payer cannot cancel the bill, protecting participants from rug-pulls
- **Live Receipt** — Frontend shows real-time payment status: who has paid, who hasn't, and the remaining balance
- **Gas Optimized** — Uses `mapping` instead of arrays for participant tracking, keeping transaction costs minimal on RSK
- **Participant Protection** — Custom errors (`CancellationProhibited`, `AlreadyPaid`, `NotAParticipant`) enforce strict on-chain rules

---

## Architecture

```
rsk-split/
├── blockchain/                  # Smart contract layer (Hardhat)
│   ├── contracts/
│   │   └── RSKSplit.sol         # Core smart contract
│   ├── test/
│   │   └── RSKSplit.test.js     # Full test suite (Hardhat + Chai)
│   ├── scripts/
│   │   └── deploy.js            # Deployment script
│   ├── hardhat.config.js        # Hardhat config with RSK networks
│   └── package.json
│
└── frontend/                    # Next.js 14 App Router frontend
    ├── app/
    │   ├── globals.css          # Tailwind v4 theme + base styles
    │   ├── layout.tsx           # Root layout with wagmi providers
    │   └── page.tsx             # Main dashboard (3 tabs)
    ├── components/
    │   ├── Providers.tsx        # wagmi + react-query setup
    │   ├── Header.tsx           # Wallet connect / balance display
    │   ├── ConnectPrompt.tsx    # Gated view prompt
    │   ├── BillReceipt.tsx      # Live receipt card (read + pay + cancel)
    │   ├── BillLookup.tsx       # Look up any bill by ID
    │   ├── CreateBillForm.tsx   # Create bill form with validation
    │   └── MyBills.tsx          # Bills where connected wallet is payer
    ├── lib/
    │   ├── contract.ts          # ABI + Rootstock chain config
    │   ├── wagmi.ts             # wagmi v2 config with MetaMask connector
    │   └── utils.ts             # formatRBTC, shortenAddress, helpers
    └── package.json
```

---

## Smart Contract

### `RSKSplit.sol`

Deployed on Rootstock Testnet and **verified on RSK Explorer**.

#### Key Design Decisions

| Decision | Reasoning |
|---|---|
| `mapping` for participant tracking | O(1) lookup vs O(n) array search — cheaper gas on every `payShare` call |
| Packed struct with `uint32`/`uint128` | Fits bill data in fewer storage slots, reducing SSTORE costs |
| Instant fund forwarding | No funds accumulate in contract — eliminates custody risk entirely |
| Custom errors over `require` strings | Saves gas on revert, provides typed error handling on the frontend |
| `unchecked` loop increment | Safe pattern for gas savings on participant registration loop |

#### Contract Interface

```solidity
// Create a new bill
function createBill(
    address[] calldata participants,
    uint256 totalAmount,
    string calldata description
) external returns (uint256 billId);

// Pay your share (payable — send exact sharePerPerson)
function payShare(uint256 billId) external payable;

// Cancel a bill (only payer, only if paidCount == 0)
function cancelBill(uint256 billId) external;

// Read bill state
function getBillStatus(uint256 billId) external view returns (...);
function getRemainingAmount(uint256 billId) external view returns (uint256);
```

#### Bill Lifecycle

```
createBill()
     │
     ▼
  ACTIVE ──── payShare() ──── all paid? ──── YES ──▶ SETTLED
     │                                               (auto, no tx)
     │
     └── cancelBill() ── paidCount == 0? ── YES ──▶ CANCELLED
                                └── NO ──▶ revert CancellationProhibited
```

#### Custom Errors

| Error | Trigger |
|---|---|
| `ZeroTotalAmount` | `totalAmount == 0` |
| `TooFewParticipants` | Less than 2 participants |
| `TooManyParticipants` | More than 50 participants |
| `AmountNotDivisible` | `totalAmount % participants.length != 0` |
| `DuplicateParticipant` | Same address added twice |
| `PayerCannotBeParticipant` | Payer tries to add themselves |
| `BillNotActive` | Action on settled/cancelled bill |
| `NotAParticipant` | Non-participant tries to pay |
| `AlreadyPaid` | Participant tries to pay twice |
| `IncorrectPaymentAmount` | `msg.value != sharePerPerson` |
| `NotThePayer` | Non-payer tries to cancel |
| `CancellationProhibited` | Cancel attempted after first payment |
| `TransferFailed` | rBTC forward to payer fails |

---

## Smart Contract Tests

Built with **Hardhat** + **Chai**. Tests cover the full contract surface including all happy paths, edge cases, and custom error reverts.

```bash
cd blockchain
npm install
npx hardhat test
```

#### Test Coverage

| Scenario | Covered |
|---|---|
| Bill creation (valid) | ✓ |
| Bill creation (zero amount) | ✓ |
| Bill creation (indivisible amount) | ✓ |
| Bill creation (duplicate participant) | ✓ |
| Bill creation (payer as participant) | ✓ |
| Too few / too many participants | ✓ |
| Pay share (valid) | ✓ |
| Pay share (wrong amount) | ✓ |
| Pay share (already paid) | ✓ |
| Pay share (non-participant) | ✓ |
| Pay share (bill not active) | ✓ |
| Auto-settle when all paid | ✓ |
| Cancel before any payment | ✓ |
| Cancel after payment (Point of No Return) | ✓ |
| Cancel by non-payer | ✓ |
| Fund forwarding to payer | ✓ |
| Event emissions | ✓ |

---

## Deployment

### Prerequisites

- Node.js 18+
- MetaMask with Rootstock Testnet configured
- Test rBTC from [faucet.rootstock.io](https://faucet.rootstock.io)

### Rootstock Testnet Network Config (MetaMask)

| Field | Value |
|---|---|
| Network Name | Rootstock Testnet |
| RPC URL | `https://public-node.testnet.rsk.co` |
| Chain ID | 31 |
| Symbol | tRBTC |
| Explorer | `https://explorer.testnet.rsk.co` |

### Deploy Smart Contract

This project uses the **RSK Hardhat Starter Kit** provided by Rootstock.

```bash
cd blockchain
npm install

# Copy env file and add your private key
cp .env.example .env

# Deploy to RSK Testnet
npx hardhat run scripts/deploy.js --network rskTestnet

# Verify on RSK Explorer
npx hardhat verify --network rskTestnet <DEPLOYED_ADDRESS>
```

After deployment, update the contract address in the frontend:

```ts
// frontend/lib/contract.ts
export const CONTRACT_ADDRESS = '0xyour_deployed_address_lowercase' as `0x${string}`;
```

> **Note:** Use the full lowercase address (after `0x`). Rootstock uses a different checksum format than Ethereum — mixed-case addresses will fail validation in viem/wagmi.

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity ^0.8.24 |
| Contract Framework | Hardhat + RSK Starter Kit |
| Contract Testing | Hardhat + Chai + Ethers.js |
| Network | Rootstock Testnet (EVM-compatible Bitcoin sidechain) |
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS v4 |
| Blockchain Hooks | wagmi v2 + viem |
| State / Caching | TanStack React Query v5 |
| Wallet | MetaMask (via wagmi MetaMask connector) |
| Deployment | Vercel (frontend) |

---

## Why Rootstock?

- **Bitcoin-backed security** — RSK is merge-mined with Bitcoin, giving it the security of the Bitcoin network
- **EVM compatible** — Full Solidity support, standard tooling (Hardhat, ethers, wagmi) works out of the box
- **Low fees** — Micro-transactions like bill splits are practical on RSK in a way they aren't on Ethereum L1
- **rBTC** — Native currency is pegged 1:1 to BTC, making it ideal for real-value peer-to-peer payments

---

## Security Considerations

- **No custody** — The contract never holds funds. Every `payShare` call immediately forwards rBTC to the Payer via `.call{value: msg.value}("")`
- **Point of No Return** — `cancelBill` reverts with `CancellationProhibited` if `paidCount > 0`, preventing the Payer from cancelling after receiving partial payments
- **Exact payment enforcement** — `IncorrectPaymentAmount` error ensures participants can only pay the precise share amount, preventing over/underpayment
- **Reentrancy consideration** — State is updated before the external `.call` transfer (checks-effects-interactions pattern)

---

## License

MIT — see [LICENSE](./LICENSE)

---

*Built for Hacktivator Hackathon · Rootstock Ecosystem*