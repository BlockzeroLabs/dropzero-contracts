// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity ^0.7.0;

interface IDrop {
   
    function addClaim(address owner,bytes32 root,uint256 deadline, uint256 tokenAmount) external ;

    function isClaimed(uint256 index, bytes32 rootHash) external view returns (bool);

    function initialize(address tokenAddress) external;

    function withdraw(address account,bytes32 merkleRoot) external;

    
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