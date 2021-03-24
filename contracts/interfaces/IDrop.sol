// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity ^0.8.0;

interface IDrop {
   
    function addClaim(
    address owner,
    bytes32 root,
    uint256 deadline,
    uint256 tokenAmount,
    bool fees
  ) external;

    function isClaimed(uint256 index, bytes32 rootHash) external view returns (bool);

    function initialize(address tokenAddress) external;

    function withdraw(address account,bytes32 merkleRoot) external;

    function changeFeesPercent(uint256 percent) external;

    function changeIndexFundAddress(address indexFundAddress) external;

    function changeFeeStatus(bytes32 rootHash) external; 

    function multipleClaim(
        uint256[] calldata index,
        address account,
        uint256[] calldata amount,
        bytes32[][] calldata merkleProof,
        bytes32[] calldata rootHashes
    )external returns (uint256 amountClaimed);

    function singleClaim(
        uint256 index,
        address account,
        uint256 amount,
        bytes32[] calldata merkleProof,
        bytes32 rootHash
    )external returns(uint256 amountClaimed);
    
     
         

}