// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract treasuryTimelock is TimelockController {
    constructor(uint256 _timeDelay, address[] memory _proposers,address[] memory _executors) 
    TimelockController(_timeDelay, _proposers, _executors){}
}