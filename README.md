# DAO Smart Contract from Scratch

A DAO, or “Decentralized Autonomous Organization,” is a community-led entity with no central authority. It is fully autonomous and transparent: smart contracts lay the foundational rules, execute the agreed upon decisions, and at any point, proposals, voting, and even the very code itself can be publicly audited.

-We need four Contract.

- MoonToken
- TreasuryTimeLock
- Governance
- Treasury


## How Contracts work together:-

### Initial Deployment :-

1. We deploy the MoonToken first and set the initial supply token supply and transfer tokens to voters for voting.

2. We delegate the voters for voting.

3. Define timeDelay, quorum, votingDelay, votingPeriod.

4. Then we deploy the treasuryTimelock and Governance contract by passing the above apropriate defined parameters.

5. Then we deploy Treasury and tranfer it's ownership to TreasuryTimelock.

6. Assign Proposer and Executor role using treasuryTimelock.

Note - Some minor changes are need to be made to deploy the contracts on ropsten test network or mainnet.

### Now as we have completed all the intial deployment we can start with the proposal process :-

1. Create a proposal using governance contract function propose while using interface.encodeFunctionData inside it for calling releaseFund function from tokenTreasury contract. encodeFunctionData encodes the function so that another function can read it and implement it. ProposalID is created in response to this and proposalState is changed to Active.

2. Take the snapshot of the proposal using governance.proposalSnapshot while passing the proposalID as a paramenter.

3. Set the proposal deadline using governance.proposalDeadline while passing the proposalID as a parameter.

4. Voting is started and votes are casted for each voter using governance.castVote while passing the value of vote in which 0 = Against, 1 = For, 2 =  Abstain.

5. Votes are counted we can access all the votes using governance.proposalVotes passing proposalID as parameter. If proposal is passed then proposalStatus changes to Succeeded else to Defeated. 

6. Then queue the Succeeded proposal by governance contract function governance.queue while using interface.encodeFunctionData inside it for calling releaseFund function from tokenTreasury contract and also a hash string is passed. proposalState is changed to Queued.

7. Then execute the Queued proposal by governance contract function governance.execute while using interface.encodeFunctionData inside it for calling releaseFund function from tokenTreasury contract and also a hash string is passed to match the hash as passed during queuing. proposalState is changed to Executed.

8. If every thing goes well the funds are released from tokenTreasury and transfered to the proposer. And totalFunds are updated.

For detailed infromation one can refer to : -

- [Openzeppelin Governance Docs](https://docs.openzeppelin.com/contracts/4.x/api/governance)

#### Stages of proposal :-

| Sr.No.| Stages      |
| :---- | :---------- |
| `0`   | `Pending`   |
| `1`   | `Active`    |
| `2`   | `Cancelled` |
| `3`   | `Defeated`  |
| `4`   | `Succeeded` |
| `5`   | `Queued`    |
| `6`   | `Expired`   |
| `7`   | `Executed`  |

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

```
    ROPSTEN_API_URL = "https://ropsten.infura.io/v3/YOUR_API_KEY"
    PRIVATE_KEY = "YOUR-METAMASK-PRIVATE_KEY"
```

## NPM Packages:

 - [Openzeppelin](https://docs.openzeppelin.com/)
 - [Hardhat Ethers](https://www.npmjs.com/package/hardhat-ethers)
 - [Chai](https://www.npmjs.com/package/chai)
 - [Ethers](https://www.npmjs.com/package/ethers)
 - [ethereum-waffle](https://www.npmjs.com/package/ethereum-waffle)
 - [dotenv](https://www.npmjs.com/package/dotenv)

## Tech Stack:
 - [Node](https://nodejs.org/en/)
 - [Hardhat](https://hardhat.org/tutorial/)
 - [Solidity](https://docs.soliditylang.org/en/v0.8.13)


## Run Locally:

Clone the github repo:
```
https://github.com/itsshantanu/DAO-Smart-Contract
```

Install Node Modules
```
npm install
```

Compile
```
npx hardhat compile
```

Test
```
npx hardhat test
```

Deploy on Localhost
```
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

Create Proposal on Localhost
```
npx hardhat node
npx hardhat run scripts/create-proposal.js --network localhost
```

Deploy on Ropsten
```
npx hardhat run scripts/deploy.js --network ropsten
```

Help
```
npx hardhat help
```

## Check at Ropsten Test Net:
 - [MoonToken](https://ropsten.etherscan.io/address/0x207473B9aB3A404FA71F510A64F85Aeb51cd99BD)
 - [treasuryTimelock](https://ropsten.etherscan.io/address/0x9Ad1eC8019bd8ca95c810E0F9c535D015e653E4F)
 - [governanceContract](https://ropsten.etherscan.io/address/0x8E61CB35679121f1D91414789a8947fFD8728d49)
 - [tokenTreasury](https://ropsten.etherscan.io/address/0x4FC146Fc8A1bbd729830Ceaba5447A4Fb860BF5D)
