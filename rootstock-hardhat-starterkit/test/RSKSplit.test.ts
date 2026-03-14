import { expect } from "chai";
import { ethers } from "hardhat";
import { RSKSplit, RSKSplit__factory } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("RSKSplit", function () {
  let rskSplit: RSKSplit;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let participants: string[];

  const TOTAL_AMOUNT = ethers.parseEther("1.0"); // 1 ETH
  const DESCRIPTION = "Dinner with friends";

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const RSKSplitFactory = (await ethers.getContractFactory("RSKSplit")) as RSKSplit__factory;
    rskSplit = await RSKSplitFactory.deploy();
    participants = [addr1.address, addr2.address];
  });

  describe("Bill Creation", function () {
    it("Should set the correct bill data", async function () {
      await rskSplit.createBill(participants, TOTAL_AMOUNT, DESCRIPTION);
      
      const bill = await rskSplit.bills(1);
      expect(bill.payer).to.equal(owner.address);
      expect(bill.totalAmount).to.equal(TOTAL_AMOUNT);
      expect(bill.sharePerPerson).to.equal(ethers.parseEther("0.5"));
      expect(bill.status).to.equal(0); // 0 = Active
    });

    it("Should revert if the payer is included in participants", async function () {
      await expect(
        rskSplit.createBill([owner.address, addr1.address], TOTAL_AMOUNT, DESCRIPTION)
      ).to.be.revertedWithCustomError(rskSplit, "PayerCannotBeParticipant");
    });
  });

  describe("Payments & Cancellation", function () {
    beforeEach(async function () {
      await rskSplit.createBill(participants, TOTAL_AMOUNT, DESCRIPTION);
    });

    it("Should transfer funds to the payer immediately upon payment", async function () {
      const share = ethers.parseEther("0.5");

      // Check balance change for participant and payer
      await expect(
        rskSplit.connect(addr1).payShare(1, { value: share })
      ).to.changeEtherBalances(
        [addr1, owner],
        [-share, share]
      );
    });

    it("Should prevent cancellation after at least one person has paid", async function () {
      const share = ethers.parseEther("0.5");
      
      // First person pays
      await rskSplit.connect(addr1).payShare(1, { value: share });

      // Owner tries to cancel
      await expect(
        rskSplit.connect(owner).cancelBill(1)
      ).to.be.revertedWithCustomError(rskSplit, "CancellationProhibited");
    });

    it("Should allow cancellation if no payments are made", async function () {
      await expect(rskSplit.connect(owner).cancelBill(1))
        .to.emit(rskSplit, "BillCancelled")
        .withArgs(1, owner.address);

      const bill = await rskSplit.bills(1);
      expect(bill.status).to.equal(2); // 2 = Cancelled
    });
  });

  describe("Settlement", function () {
    it("Should mark the bill as settled when complete", async function () {
      const share = ethers.parseEther("0.5");
      
      await rskSplit.createBill(participants, TOTAL_AMOUNT, DESCRIPTION);
      
      await rskSplit.connect(addr1).payShare(1, { value: share });
      await rskSplit.connect(addr2).payShare(1, { value: share });

      const bill = await rskSplit.bills(1);
      expect(bill.status).to.equal(1); // 1 = Settled
    });
  });
});