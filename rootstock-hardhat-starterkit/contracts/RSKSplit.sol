// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title RSKSplit
 * @author RSK-Split Team
 * @notice A peer-to-peer bill splitter with "Point of No Return" cancellation logic.
 */
contract RSKSplit {
    // ─── Enums ───────────────────────────────────────────────────

    enum BillStatus {
        Active,    // 0
        Settled,   // 1
        Cancelled  // 2
    }

    // ─── Structs ─────────────────────────────────────────────────

    struct Bill {
        address payer;
        BillStatus status;
        uint32 participantCount;
        uint32 paidCount;
        uint128 totalAmount;
        uint128 sharePerPerson;
        uint128 totalReceived;
        string description;
        uint256 createdAt;
    }

    // ─── State ───────────────────────────────────────────────────

    uint256 public billCount;
    mapping(uint256 => Bill) public bills;
    mapping(uint256 => mapping(address => bool)) public hasPaid;
    mapping(uint256 => mapping(address => bool)) public isParticipant;
    mapping(address => uint256[]) public payerBills;
    mapping(address => uint256[]) public participantBills;

    // ─── Events ──────────────────────────────────────────────────

    event BillCreated(uint256 indexed billId, address indexed payer, uint256 totalAmount, uint256 sharePerPerson, uint256 participantCount, string description);
    event SharePaid(uint256 indexed billId, address indexed participant, uint256 amount, uint256 remainingCount);
    event BillSettled(uint256 indexed billId, address indexed payer, uint256 totalAmount);
    event BillCancelled(uint256 indexed billId, address indexed payer);

    // ─── Custom Errors ────────────────────────────────────────────

    error ZeroTotalAmount();
    error TooFewParticipants();
    error TooManyParticipants();
    error DuplicateParticipant(address participant);
    error ZeroAddressParticipant();
    error PayerCannotBeParticipant();
    error BillNotActive(uint256 billId);
    error NotAParticipant(address caller, uint256 billId);
    error AlreadyPaid(address caller, uint256 billId);
    error IncorrectPaymentAmount(uint256 sent, uint256 required);
    error NotThePayer(address caller, uint256 billId);
    error TransferFailed();
    error AmountNotDivisible(uint256 totalAmount, uint256 participantCount);
    
    /// @dev New Error: Triggered if Payer tries to cancel after someone has already paid.
    error CancellationProhibited();

    // ─── Constants ───────────────────────────────────────────────

    uint256 public constant MAX_PARTICIPANTS = 50;
    uint256 public constant MIN_PARTICIPANTS = 2;

    // ─────────────────────────────────────────────────────────────
    // EXTERNAL FUNCTIONS
    // ─────────────────────────────────────────────────────────────

    function createBill(
        address[] calldata participants,
        uint256 totalAmount,
        string calldata description
    ) external returns (uint256 billId) {
        if (totalAmount == 0) revert ZeroTotalAmount();
        if (participants.length < MIN_PARTICIPANTS) revert TooFewParticipants();
        if (participants.length > MAX_PARTICIPANTS) revert TooManyParticipants();
        if (totalAmount % participants.length != 0)
            revert AmountNotDivisible(totalAmount, participants.length);

        uint256 share = totalAmount / participants.length;
        billId = ++billCount;

        for (uint256 i = 0; i < participants.length; ) {
            address p = participants[i];
            if (p == address(0)) revert ZeroAddressParticipant();
            if (p == msg.sender) revert PayerCannotBeParticipant();
            if (isParticipant[billId][p]) revert DuplicateParticipant(p);

            isParticipant[billId][p] = true;
            participantBills[p].push(billId);
            unchecked { ++i; }
        }

        bills[billId] = Bill({
            payer: msg.sender,
            status: BillStatus.Active,
            participantCount: uint32(participants.length),
            paidCount: 0,
            totalAmount: uint128(totalAmount),
            sharePerPerson: uint128(share),
            totalReceived: 0,
            description: description,
            createdAt: block.timestamp
        });

        payerBills[msg.sender].push(billId);
        emit BillCreated(billId, msg.sender, totalAmount, share, participants.length, description);
    }

    function payShare(uint256 billId) external payable {
        Bill storage bill = bills[billId];

        if (bill.status != BillStatus.Active) revert BillNotActive(billId);
        if (!isParticipant[billId][msg.sender]) revert NotAParticipant(msg.sender, billId);
        if (hasPaid[billId][msg.sender]) revert AlreadyPaid(msg.sender, billId);
        if (msg.value != bill.sharePerPerson) revert IncorrectPaymentAmount(msg.value, bill.sharePerPerson);

        hasPaid[billId][msg.sender] = true;
        bill.paidCount += 1;
        bill.totalReceived += uint128(msg.value);

        uint256 remaining = bill.participantCount - bill.paidCount;
        emit SharePaid(billId, msg.sender, msg.value, remaining);

        if (bill.paidCount == bill.participantCount) {
            bill.status = BillStatus.Settled;
            emit BillSettled(billId, bill.payer, bill.totalAmount);
        }

        (bool success, ) = bill.payer.call{value: msg.value}("");
        if (!success) revert TransferFailed();
    }

    /**
     * @notice Cancel a bill ONLY if no payments have been made.
     * @dev Protects participants from a payer "cancelling" a bill after receiving funds.
     */
    function cancelBill(uint256 billId) external {
        Bill storage bill = bills[billId];

        if (bill.payer != msg.sender) revert NotThePayer(msg.sender, billId);
        if (bill.status != BillStatus.Active) revert BillNotActive(billId);
        
        // --- POINT OF NO RETURN CHECK ---
        if (bill.paidCount > 0) revert CancellationProhibited();

        bill.status = BillStatus.Cancelled;
        emit BillCancelled(billId, msg.sender);
    }

    // ─── VIEW FUNCTIONS ──────────────────────────────────────────

    function getBillStatus(uint256 billId) external view returns (
        address payer, BillStatus status, uint256 totalAmount, uint256 sharePerPerson,
        uint256 participantCount, uint256 paidCount, uint256 totalReceived,
        string memory description, uint256 createdAt
    ) {
        Bill storage bill = bills[billId];
        return (bill.payer, bill.status, bill.totalAmount, bill.sharePerPerson,
                bill.participantCount, bill.paidCount, bill.totalReceived,
                bill.description, bill.createdAt);
    }

    function getRemainingAmount(uint256 billId) external view returns (uint256) {
        Bill storage bill = bills[billId];
        return bill.totalAmount - bill.totalReceived;
    }
}