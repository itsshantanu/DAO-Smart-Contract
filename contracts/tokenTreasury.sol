// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract tokenTreasury is Ownable {
    uint256 public fundsAvailable;
    address public sendTo;
    bool public isReleased;

    constructor(address _sendTo) payable {
        fundsAvailable = msg.value;
        sendTo = _sendTo;
        isReleased = false;
    }

    function releaseFunds() public onlyOwner {
        isReleased = true;
        payable(sendTo).transfer(fundsAvailable);
    }
}