// ─── UPDATE THIS after deployment ────────────────────────────────────────────
export const CONTRACT_ADDRESS = '0x2ede00e732bda9304a70b514671912b6ce4d7a7e' as `0x${string}`;
export const ROOTSTOCK_TESTNET = {
  id: 31,
  name: 'Rootstock Testnet',
  nativeCurrency: { name: 'Test RBTC', symbol: 'tRBTC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://public-node.testnet.rsk.co'] },
    public: { http: ['https://public-node.testnet.rsk.co'] },
  },
  blockExplorers: {
    default: { name: 'RSK Explorer', url: 'https://explorer.testnet.rsk.co' },
  },
} as const;

export const CONTRACT_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "caller",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "billId",
          "type": "uint256"
        }
      ],
      "name": "AlreadyPaid",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "totalAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "participantCount",
          "type": "uint256"
        }
      ],
      "name": "AmountNotDivisible",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "billId",
          "type": "uint256"
        }
      ],
      "name": "BillNotActive",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "CancellationProhibited",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "participant",
          "type": "address"
        }
      ],
      "name": "DuplicateParticipant",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "sent",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "required",
          "type": "uint256"
        }
      ],
      "name": "IncorrectPaymentAmount",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "caller",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "billId",
          "type": "uint256"
        }
      ],
      "name": "NotAParticipant",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "caller",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "billId",
          "type": "uint256"
        }
      ],
      "name": "NotThePayer",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PayerCannotBeParticipant",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TooFewParticipants",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TooManyParticipants",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TransferFailed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ZeroAddressParticipant",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ZeroTotalAmount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "billId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "payer",
          "type": "address"
        }
      ],
      "name": "BillCancelled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "billId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "payer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "sharePerPerson",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "participantCount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "description",
          "type": "string"
        }
      ],
      "name": "BillCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "billId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "payer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalAmount",
          "type": "uint256"
        }
      ],
      "name": "BillSettled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "billId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "participant",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "remainingCount",
          "type": "uint256"
        }
      ],
      "name": "SharePaid",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "MAX_PARTICIPANTS",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MIN_PARTICIPANTS",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "billCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "bills",
      "outputs": [
        {
          "internalType": "address",
          "name": "payer",
          "type": "address"
        },
        {
          "internalType": "enum RSKSplit.BillStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint32",
          "name": "participantCount",
          "type": "uint32"
        },
        {
          "internalType": "uint32",
          "name": "paidCount",
          "type": "uint32"
        },
        {
          "internalType": "uint128",
          "name": "totalAmount",
          "type": "uint128"
        },
        {
          "internalType": "uint128",
          "name": "sharePerPerson",
          "type": "uint128"
        },
        {
          "internalType": "uint128",
          "name": "totalReceived",
          "type": "uint128"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "createdAt",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "billId",
          "type": "uint256"
        }
      ],
      "name": "cancelBill",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "participants",
          "type": "address[]"
        },
        {
          "internalType": "uint256",
          "name": "totalAmount",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        }
      ],
      "name": "createBill",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "billId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "billId",
          "type": "uint256"
        }
      ],
      "name": "getBillStatus",
      "outputs": [
        {
          "internalType": "address",
          "name": "payer",
          "type": "address"
        },
        {
          "internalType": "enum RSKSplit.BillStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "totalAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "sharePerPerson",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "participantCount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "paidCount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalReceived",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "createdAt",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "billId",
          "type": "uint256"
        }
      ],
      "name": "getRemainingAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasPaid",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "isParticipant",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "participantBills",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "billId",
          "type": "uint256"
        }
      ],
      "name": "payShare",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "payerBills",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const;