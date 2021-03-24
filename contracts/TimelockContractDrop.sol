// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "openzeppelin-solidity/contracts/governance/TimelockController.sol"
import "./interfaces/IDrop.sol";
contract TimelockContractDrop is TimelockController{
    constructor(uint256 minDelay, address memory proposers[], address memory executors[]) 
    {
        require(executers[0]==msg.sender)
        TimelockController(minDelay, proposers, executors) public {}
    }
}