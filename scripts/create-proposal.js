const hre = require('hardhat');
const { ethers } = require('hardhat');

async function main() {

    const [executor, proposer, voter1, voter2, voter3, voter4, voter5] = await ethers.getSigners(); 

    let  blockNumber, totalFunds, isReleased, proposalState, vote

    const provider = ethers.getDefaultProvider(); // Getting default providers

    const moonTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

    const amount = ethers.utils.parseEther("5");

    const moonToken = await hre.ethers.getContractAt("MoonToken", moonTokenAddress); // Fetching moontToken contract 

    // Delegating voters 
    await moonToken.connect(voter1).delegate(voter1.address);
    await moonToken.connect(voter2).delegate(voter2.address);
    await moonToken.connect(voter3).delegate(voter3.address);
    await moonToken.connect(voter4).delegate(voter4.address);
    await moonToken.connect(voter5).delegate(voter5.address);

    const tokenTreasuryAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6"

    const tokenTreasury = await hre.ethers.getContractAt("tokenTreasury", tokenTreasuryAddress); // Fetching tokenTreasury contract

    isReleased = await tokenTreasury.isReleased();  // checking fund release status
    console.log(`Has funds released? ${isReleased}`);

    totalFunds = await tokenTreasury.getBalance(); // checking total funds
    console.log(`Total funds inside treasury: ${ethers.utils.formatEther(totalFunds)} ETH\n`);

    const governanceAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";

    const governance = await hre.ethers.getContractAt("GovernanceContract", governanceAddress); // Fetching GovernanceContract contract
    
    // Creating proposal by fetching the tokenTreasury function inside governance function
    const createProposal = await governance.propose([tokenTreasuryAddress],[0],
      [
        tokenTreasury.interface.encodeFunctionData('releaseFunds', [proposer.address])
      ],
      'Releasing funds from tokenTreasury'
    );

    const tx = await createProposal.wait(1);

    const prop_Id = tx.events[0].args.proposalId; // Fetching propasal ID
    console.log(`Created Proposal: ${prop_Id.toString()}\n`);

    proposalState = await governance.state(prop_Id); // Checking proposal State
    console.log(`Current proposal state: ${proposalState.toString()} (Pending) \n`); // 0 -> Pending

    const snapshot = await governance.proposalSnapshot(prop_Id); // Taking Snapshot
    console.log(`Proposal created on block ${snapshot.toString()}`);

    const deadline = await governance.proposalDeadline(prop_Id); // Setting proposal Deadine
    console.log(`Proposal deadline on block ${deadline.toString()}\n`);

    blockNumber = await provider.getBlockNumber( ) // Getting current Block Number 
    console.log(`Current blocknumber: ${blockNumber}\n`)

    // Voting started 

    console.log(`Voting Started\n`)

    // 0 -> Against, 1 -> For, 2 -> Abstain

    await governance.connect(voter1).castVote(prop_Id, 1);
    await governance.connect(voter2).castVote(prop_Id, 0);
    await governance.connect(voter3).castVote(prop_Id, 1);
    await governance.connect(voter4).castVote(prop_Id, 1);
    await governance.connect(voter5).castVote(prop_Id, 2);

    proposalState = await governance.state(prop_Id); // Checking proposal State
    console.log(`Current proposal state: ${proposalState.toString()} (Active) \n`); // 1 -> Active

    // this transfer serves no purpose, it is just used to fast foward one block after the voting period ends.
    await moonToken.transfer(proposer.address, amount, { from:executor.address}); 

    // Counting all the votes 
    const { againstVotes, forVotes, abstainVotes } = await governance.proposalVotes(prop_Id);
    console.log(`Votes For: ${ethers.utils.formatEther(forVotes)}`);
    console.log(`Votes Against: ${ethers.utils.formatEther(againstVotes)}`);
    console.log(`Votes Neutral: ${ethers.utils.formatEther(abstainVotes)}\n`);

    blockNumber = await provider.getBlockNumber( ); // Getting current Block Number
    console.log(`Current blocknumber: ${blockNumber}\n`);

    proposalState = await governance.state(prop_Id); // Checking proposal State
    console.log(`Current proposal state: ${proposalState.toString()} (Succeeded) \n`); // 4 -> Succeeded

    // Queuing 
    
    // Creating proposal by fetching the tokenTreasury function inside governance function
    await governance.queue([tokenTreasuryAddress],[0],[
        tokenTreasury.interface.encodeFunctionData('releaseFunds', [proposer.address]),
      ],
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Releasing funds from tokenTreasury'))
    );

    proposalState = await governance.state(prop_Id); // Checking proposal State
    console.log(`Current state of proposal: ${proposalState.toString()} (Queued) \n`); // 5 -> Queued
    
    // Executing
    
    // Creating proposal by fetching the tokenTreasury function inside governance function
    const executePropose = await governance.execute([tokenTreasuryAddress],[0],[
        tokenTreasury.interface.encodeFunctionData('releaseFunds', [proposer.address]),
      ],
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Releasing funds from tokenTreasury'))
    );

    await executePropose.wait();

    proposalState = await governance.state(prop_Id); // Checking proposal State
    console.log(`Current state of proposal: ${proposalState.toString()} (Executed) \n`); // 7 -> Executed

    isReleased = await tokenTreasury.isReleased(); // Checking fund release status
    console.log(`Has funds released? ${isReleased}`);

    totalFunds = await tokenTreasury.getBalance(); // Checking total funds
    console.log(`Total funds inside treasury: ${ethers.utils.formatEther(totalFunds)} ETH\n`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });