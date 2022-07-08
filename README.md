# DAO Smart Contract from Scratch

A DAO, or “Decentralized Autonomous Organization,” is a community-led entity with no central authority. It is fully autonomous and transparent: smart contracts lay the foundational rules, execute the agreed upon decisions, and at any point, proposals, voting, and even the very code itself can be publicly audited.

-We need four Contract.

- MoonToken
- TreasuryTimeLock
- Governance
- Treasury


## How Contracts work together:-

# Initial Deployment :-

1. We deploy the MoonToken first and set the initial supply token supply and transfer tokens to voters for voting.

2. We delegate the voters for voting.

3. Then we deploy the treasuryTimelock and Governance contract.

4. Then we deploy Treasury and tranfer it's ownership to TreasuryTimelock.

5. Assign Proposer and Executor role using treasuryTimelock.

# Now as we have completed all the intial deployment we can start with the proposal process :-

1. Create a proposal using governance contract function propose while using interface.encodeFunctionData inside it for calling releaseFund function from tokenTreasury contract. encodeFunctionData encodes the function so that another function can read it and implement it.

2. 