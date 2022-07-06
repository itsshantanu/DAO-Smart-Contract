// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract tokenTreasury is Ownable {
    uint256 public fundsAvailable;
    address public sendTo;
    bool public isReleased;

    constructor(address executorAddress) payable {
        fundsAvailable = msg.value;
        sendTo = executorAddress;
        isReleased = false;
    }

    function releaseFunds(address proposerAddress) public onlyOwner {
        isReleased = true;
        payable(proposerAddress).transfer(fundsAvailable);
    }
}