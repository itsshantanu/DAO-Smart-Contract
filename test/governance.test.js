const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("Governance Contract", function () {

  let MoonToken, moonToken, Governanace, governance, TokenTreasury, tokenTreasury, TreasuryTimelock, treasuryTimelock, initialBalance, funds
  const provider = ethers.getDefaultProvider();

  beforeEach(async () => {
     
    [executor, proposer, voter1, voter2, voter3, voter4, voter5] = await ethers.getSigners();

    // For Deploying MoonToken Deploy

    MoonToken = await hre.ethers.getContractFactory('MoonToken');
    const initialSupply = ethers.utils.parseEther("1000.0");
    moonToken = await MoonToken.deploy(initialSupply);

    await moonToken.deployed();
    initialBalance = await moonToken.balanceOf(executor.address);

    const amount = ethers.utils.parseEther("50.0");
    await moonToken.transfer(voter1.address, amount, { from:executor.address});
    await moonToken.transfer(voter2.address, amount, { from:executor.address});
    await moonToken.transfer(voter3.address, amount, { from:executor.address});
    await moonToken.transfer(voter4.address, amount, { from:executor.address});
    await moonToken.transfer(voter5.address, amount, { from:executor.address});

    await moonToken.connect(voter1).delegate(voter1.address);
    await moonToken.connect(voter2).delegate(voter2.address);
    await moonToken.connect(voter3).delegate(voter3.address);
    await moonToken.connect(voter4).delegate(voter4.address);
    await moonToken.connect(voter5).delegate(voter5.address);

    // For Deploying treasuryTimelock

    const timeDelay = 0;

    TreasuryTimelock = await hre.ethers.getContractFactory('treasuryTimelock');
    treasuryTimelock = await TreasuryTimelock.deploy(timeDelay, [proposer.address], [executor.address]);

    await treasuryTimelock.deployed();

    // For Deploying governanceContract

    const quorom = 5;
    const votingDelay = 0;
    const votingPeriod = 5;

    Governanace = await hre.ethers.getContractFactory('GovernanceContract'); 
    governance = await Governanace.deploy(moonToken.address, treasuryTimelock.address, quorom, votingDelay, votingPeriod);

    await governance.deployed();

    // For Deploying Treasury

    funds = ethers.utils.parseEther("25.0");

    TokenTreasury = await hre.ethers.getContractFactory('tokenTreasury'); 
    tokenTreasury = await TokenTreasury.deploy(executor.address, { value: funds });

    await tokenTreasury.deployed();

    await tokenTreasury.transferOwnership(treasuryTimelock.address, { from: executor.address });

    // Assign roles

    const assignProposerRole = await treasuryTimelock.PROPOSER_ROLE();
    const assignExecutorRole = await treasuryTimelock.EXECUTOR_ROLE();

    await treasuryTimelock.grantRole(assignProposerRole, governance.address, { from: executor.address });
    await treasuryTimelock.grantRole(assignExecutorRole, governance.address, { from: executor.address });

  });

  it("Should return the correct initial balance", async function () {
    const ownerBalance = initialBalance;
    expect(await moonToken.totalSupply()).to.equal(ownerBalance);
    console.log(ownerBalance);
  });

  it("Should send tokens to voters", async function () {
    const amount = ethers.utils.parseEther("50.0");
    await moonToken.transfer(voter1.address, amount, { from:executor.address});
    await moonToken.transfer(voter2.address, amount, { from:executor.address});
    await moonToken.transfer(voter3.address, amount, { from:executor.address});
    await moonToken.transfer(voter4.address, amount, { from:executor.address});
    await moonToken.transfer(voter5.address, amount, { from:executor.address});   
    
    expect(await moonToken.balanceOf(voter1.address)).to.equal(ethers.utils.parseEther("100"));
  });

  it("Should delegate the Voters", async function () {
    await moonToken.connect(voter1).delegate(voter1.address);
    await moonToken.connect(voter2).delegate(voter2.address);
    await moonToken.connect(voter3).delegate(voter3.address);
    await moonToken.connect(voter4).delegate(voter4.address);
    await moonToken.connect(voter5).delegate(voter5.address);
  });

  it("Treasury should have funds", async function () {
    const treasuryBalance = await tokenTreasury.getBalance();
    expect(await treasuryBalance).to.equal(funds);
    console.log(treasuryBalance);
  });

  it("Should grant proposer role", async function () {
    await treasuryTimelock.grantRole(await treasuryTimelock.PROPOSER_ROLE(), governance.address, { from: executor.address });
  });

  it("Should grant executor role", async function () {
    await treasuryTimelock.grantRole(await treasuryTimelock.EXECUTOR_ROLE(), governance.address, { from: executor.address });
  });

  it("Should create a propasal", async function () {
    const createProposal = await governance.propose([tokenTreasury.address],[0],
      [
        tokenTreasury.interface.encodeFunctionData('releaseFunds', [proposer.address])
      ],
      'Releasing funds from tokenTreasury'
    );

    const tx = await createProposal.wait(1);

    const prop_Id = tx.events[0].args.proposalId;
    console.log(`Created Proposal: ${prop_Id.toString()}\n`);
    
    expect(await prop_Id.toString()).to.be.not.equal(0);
  });

  it("Should cast votes", async function () {
    const createProposal = await governance.propose([tokenTreasury.address],[0],
      [
        tokenTreasury.interface.encodeFunctionData('releaseFunds', [proposer.address])
      ],
      'Releasing funds from tokenTreasury'
    );

    const tx = await createProposal.wait(1);

    const prop_Id = tx.events[0].args.proposalId;

    await governance.connect(voter1).castVote(prop_Id, 1);
    await governance.connect(voter2).castVote(prop_Id, 0);
    await governance.connect(voter3).castVote(prop_Id, 1);
    await governance.connect(voter4).castVote(prop_Id, 1);
    await governance.connect(voter5).castVote(prop_Id, 2);

    expect(await governance.proposalVotes(prop_Id)).to.be.not.equal(0);

  });

  it("Should count votes", async function () {
    const createProposal = await governance.propose([tokenTreasury.address],[0],
      [
        tokenTreasury.interface.encodeFunctionData('releaseFunds', [proposer.address])
      ],
      'Releasing funds from tokenTreasury'
    );

    const tx = await createProposal.wait(1);

    const prop_Id = tx.events[0].args.proposalId;

    await governance.connect(voter1).castVote(prop_Id, 1);
    await governance.connect(voter2).castVote(prop_Id, 0);
    await governance.connect(voter3).castVote(prop_Id, 1);
    await governance.connect(voter4).castVote(prop_Id, 1);
    await governance.connect(voter5).castVote(prop_Id, 2);

    const { againstVotes, forVotes, abstainVotes } = await governance.proposalVotes(prop_Id);
    console.log(`Votes For: ${ethers.utils.formatEther(forVotes)}`);
    console.log(`Votes Against: ${ethers.utils.formatEther(againstVotes)}`);
    console.log(`Votes Neutral: ${ethers.utils.formatEther(abstainVotes)}\n`);
  });

  it("Should queue the proposal", async function () {
    const createProposal = await governance.propose([tokenTreasury.address],[0],
      [
        tokenTreasury.interface.encodeFunctionData('releaseFunds', [proposer.address])
      ],
      'Releasing funds from tokenTreasury'
    );

    const tx = await createProposal.wait(1);

    const prop_Id = tx.events[0].args.proposalId;

    await governance.connect(voter1).castVote(prop_Id, 1);
    await governance.connect(voter2).castVote(prop_Id, 0);
    await governance.connect(voter3).castVote(prop_Id, 1);
    await governance.connect(voter4).castVote(prop_Id, 1);
    await governance.connect(voter5).castVote(prop_Id, 2);

    await governance.queue([tokenTreasury.address],[0],[
        tokenTreasury.interface.encodeFunctionData('releaseFunds', [proposer.address]),
      ],
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Releasing funds from tokenTreasury'))
    );

    proposalState = await governance.state(prop_Id);
    console.log(`Current state of proposal: ${proposalState.toString()} (Queued) \n`);

    expect(await governance.state(prop_Id)).to.equal(5);
  });

  it("Should execute the proposal", async function () {
    const createProposal = await governance.propose([tokenTreasury.address],[0],
      [
        tokenTreasury.interface.encodeFunctionData('releaseFunds', [proposer.address])
      ],
      'Releasing funds from tokenTreasury'
    );

    const tx = await createProposal.wait(1);

    const prop_Id = tx.events[0].args.proposalId;

    await governance.connect(voter1).castVote(prop_Id, 1);
    await governance.connect(voter2).castVote(prop_Id, 0);
    await governance.connect(voter3).castVote(prop_Id, 1);
    await governance.connect(voter4).castVote(prop_Id, 1);
    await governance.connect(voter5).castVote(prop_Id, 2);

    await governance.queue([tokenTreasury.address],[0],[
        tokenTreasury.interface.encodeFunctionData('releaseFunds', [proposer.address]),
      ],
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Releasing funds from tokenTreasury'))
    );

    const executePropose = await governance.execute([tokenTreasury.address],[0],[
        tokenTreasury.interface.encodeFunctionData('releaseFunds', [proposer.address]),
      ],
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Releasing funds from tokenTreasury'))
    );

    await executePropose.wait();

    proposalState = await governance.state(prop_Id);
    console.log(`Current state of proposal: ${proposalState.toString()} (Executed) \n`);

    expect(await governance.state(prop_Id)).to.equal(7);

  });

  it("Should release funds", async function () {
    const createProposal = await governance.propose([tokenTreasury.address],[0],
      [
        tokenTreasury.interface.encodeFunctionData('releaseFunds', [proposer.address])
      ],
      'Releasing funds from tokenTreasury'
    );

    const tx = await createProposal.wait(1);

    const prop_Id = tx.events[0].args.proposalId;

    await governance.connect(voter1).castVote(prop_Id, 1);
    await governance.connect(voter2).castVote(prop_Id, 0);
    await governance.connect(voter3).castVote(prop_Id, 1);
    await governance.connect(voter4).castVote(prop_Id, 1);
    await governance.connect(voter5).castVote(prop_Id, 2);

    await governance.queue([tokenTreasury.address],[0],[
        tokenTreasury.interface.encodeFunctionData('releaseFunds', [proposer.address]),
      ],
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Releasing funds from tokenTreasury'))
    );

    const executePropose = await governance.execute([tokenTreasury.address],[0],[
        tokenTreasury.interface.encodeFunctionData('releaseFunds', [proposer.address]),
      ],
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Releasing funds from tokenTreasury'))
    );

    await executePropose.wait();

    isReleased = await tokenTreasury.isReleased(); 
    console.log(`Has funds released? ${isReleased}`);

    expect(await tokenTreasury.isReleased()).to.equal(true);

  });

  it("Should defeat the proposal", async function () {

    const createProposal = await governance.propose([tokenTreasury.address],[0],
      [
        tokenTreasury.interface.encodeFunctionData('releaseFunds', [proposer.address])
      ],
      'Releasing funds from tokenTreasury'
    );

    const tx = await createProposal.wait(1);

    const prop_Id = tx.events[0].args.proposalId;

    await governance.connect(voter1).castVote(prop_Id, 1);
    await governance.connect(voter2).castVote(prop_Id, 0);
    await governance.connect(voter3).castVote(prop_Id, 0);
    await governance.connect(voter4).castVote(prop_Id, 0);
    await governance.connect(voter5).castVote(prop_Id, 2);

    const amount = ethers.utils.parseEther("5");

    await moonToken.transfer(proposer.address, amount, { from:executor.address}); 

    await governance.proposalVotes(prop_Id);

    proposalState = await governance.state(prop_Id);
    console.log(`Current state of proposal: ${proposalState.toString()} (Defeated) \n`);

    expect(await governance.state(prop_Id)).to.equal(3);
  })


});
