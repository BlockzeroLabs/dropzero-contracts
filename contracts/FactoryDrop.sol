// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/Create2.sol";
import "./interfaces/IDrop.sol";
import "./interfaces/IFactoryDrop.sol";
import "./Drop.sol";

contract FactoryDrop is IFactoryDrop {
  mapping(address => address) public override contractList;

  event ClaimAdded(
    uint256 tokenAmount,
    uint256 startDate,
    uint256 endDate,
    bool fee,
    address indexed owner,
    address indexed tokenAddress
  );

  event DropCreated(address indexed dropAddress, address indexed tokenAddress);

  function createDrop(
    uint256 tokenAmount,
    uint256 startDate,
    uint256 endDate,
    bool feeStatus,
    bytes32 root,
    address tokenAddress
  ) public override returns (address dropAddress) {
    require(
      contractList[tokenAddress] == address(0),
      "Factory:: Contract already exists"
    );

    require(startDate >= block.timestamp, "Factory:: Invalid start date");

    require(tokenAddress != address(0), "Factory:: Invalid token address");

    address owner = msg.sender;

    bytes memory bytecode = type(Drop).creationCode;

    bytes32 salt = keccak256(abi.encodePacked(block.timestamp, owner));

    dropAddress = Create2.deploy(0, salt, bytecode);

    IDrop(dropAddress).initialize(tokenAddress);

    addClaimInDrop(
      tokenAmount,
      startDate,
      endDate,
      feeStatus,
      root,
      tokenAddress,
      owner
    );

    emit ClaimAdded(
      tokenAmount,
      startDate,
      endDate,
      feeStatus,
      owner,
      tokenAddress
    );

    contractList[tokenAddress] = dropAddress;

    emit DropCreated(dropAddress, tokenAddress);
  }

  function addClaimInDrop(
    uint256 tokenAmount,
    uint256 startDate,
    uint256 endDate,
    bool feeStatus,
    bytes32 root,
    address tokenAddress,
    address owner
  ) public override {
    require(
      contractList[tokenAddress] != address(0),
      "Factory:: Drop contract doesn't exist"
    );

    require(endDate > block.timestamp, "Factory:: Invalid endDate");

    IDrop(contractList[tokenAddress]).addClaim(
      owner,
      root,
      startDate,
      endDate,
      tokenAmount,
      feeStatus
    );

    emit ClaimAdded(
      tokenAmount,
      startDate,
      endDate,
      feeStatus,
      msg.sender,
      tokenAddress
    );
  }
}
