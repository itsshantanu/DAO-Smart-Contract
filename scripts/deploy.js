const hre = require('hardhat');
const { ethers } = require('hardhat');

async function main() {

  const [executor, proposer, voter1, voter2, voter3, voter4, voter5] = await ethers.getSigners();

  // For Deploying Token Deploy

  const MoonToken = await hre.ethers.getContractFactory('MoonToken');
  const initialSupply = ethers.utils.parseEther("1000.0");
  const moonToken = await MoonToken.deploy(initialSupply);

  await moonToken.deployed();  

  console.log('moonToken deployed to:', moonToken.address);

  const amount = ethers.utils.parseEther("50.0");
  await moonToken.transfer(voter1.address, amount, { from:executor.address});
  await moonToken.transfer(voter2.address, amount, { from:executor.address});
  await moonToken.transfer(voter3.address, amount, { from:executor.address});
  await moonToken.transfer(voter4.address, amount, { from:executor.address});
  await moonToken.transfer(voter5.address, amount, { from:executor.address});

  // For Deploying treasuryTimelock

  const timeDelay = 1; // Adds delay to the execution after a passed proposal

  const TreasuryTimelock = await hre.ethers.getContractFactory('treasuryTimelock');
  const treasuryTimelock = await TreasuryTimelock.deploy(timeDelay, [proposer.address], [executor.address]);

  await treasuryTimelock.deployed();

  console.log('treasuryTimelock deployed to:', treasuryTimelock.address);

  // For Deploying governanceContract

  const quorom = 5 // Percentage of tokens needed of total supply to aprove proposals (5%)
  const votingDelay = 0 // Number of blocks after proposal until voting becomes active
  const votingPeriod = 5 // Number of blocks to allow voters to vote after it becomes active

  const Governanace = await hre.ethers.getContractFactory('GovernanceContract'); 
  const governance = await Governanace.deploy(moonToken.address, treasuryTimelock.address, quorom, votingDelay, votingPeriod);

  await governance.deployed();

  console.log('governanceContract deployed to:', governance.address);

  // For Deploying Treasury

  const funds = ethers.utils.parseEther("25.0");

  const TokenTreasury = await hre.ethers.getContractFactory('tokenTreasury'); 
  const tokenTreasury = await TokenTreasury.deploy(executor.address, { value: funds });

  await tokenTreasury.deployed();

  console.log('tokenTreasury deployed to:', tokenTreasury.address);

  await tokenTreasury.transferOwnership(treasuryTimelock.address, { from: executor.address });

  // Assign roles

  const assignProposerRole = await treasuryTimelock.PROPOSER_ROLE();
  const assignExecutorRole = await treasuryTimelock.EXECUTOR_ROLE();

  await treasuryTimelock.grantRole(assignProposerRole, governance.address, { from: executor.address });
  await treasuryTimelock.grantRole(assignExecutorRole, governance.address, { from: executor.address });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
