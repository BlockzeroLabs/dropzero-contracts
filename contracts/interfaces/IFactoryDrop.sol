// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity ^0.8.0;

interface IFactoryDrop {
  function contractList(address account) external view returns (address);

  function createDrop(
    uint256 tokenAmount,
    uint256 startDate,
    uint256 endDate,
    bool feeStatus,
    bytes32 root,
    address tokenAddress
  ) external returns (address dropAddress);

  function addClaimInDrop(
    uint256 tokenAmount,
    uint256 startDate,
    uint256 endDate,
    bool feeStatus,
    bytes32 root,
    address tokenAddress,
    address owner
  ) external;
}
