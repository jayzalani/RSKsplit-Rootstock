import { ethers } from "hardhat";

async function main() {
  console.log("Deploying RSKSplit...");

  // Get the contract factory
  const RSKSplit = await ethers.getContractFactory("RSKSplit");
  
  // Deploy the contract
  const rskSplit = await RSKSplit.deploy();

  await rskSplit.waitForDeployment();

  const address = await rskSplit.getAddress();
  console.log(`RSKSplit deployed to: ${address}`);
}

// Standard pattern for running the script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});