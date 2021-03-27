// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IDrop.sol";
import "./libraries/MerkleProof.sol";

contract Drop is IDrop {
  using MerkleProof for bytes;
  using SafeERC20 for IERC20;

  struct DropData {
    address owner;
    uint256 startDate;
    uint256 endDate;
    uint256 tokenAmount;
    bool fees;
    bool status;
  }

  uint256 public feePercent = 1000;

  address public INDEX_FUND_ADDRESS = address(0);

  address public FACTORY_ADDRESS = address(0);

  address public TIMELOCK_ADDRESS = address(0);

  address public TOKEN;

  mapping(bytes32 => DropData) public dropData;

  mapping(bytes32 => bool) public merkleRoots;

  mapping(bytes32 => mapping(uint256 => uint256)) private claimedBitMap;

  modifier onlyFactory {
    require(msg.sender == FACTORY_ADDRESS, "Drop:: Not factory address");
    _;
  }

  modifier onlyTimelockContract {
    require(msg.sender == TIMELOCK_ADDRESS, "Drop:: Not timelock address");
    _;
  }

  event Withdrawn(address account, bytes32 root);

  event Claimed(
    uint256 index,
    uint256 amount,
    bytes32 merkleRoot,
    address sender
  );

  event IndexAddressChanged(
    address indexed previousAddress,
    address indexed newAddress
  );

  event FeesPercentChanged(uint256 previousFeePercent, uint256 newFeePercent);

  event FeeStatusChanged(bool newStatus);

  event ClaimStatusChanged(bytes32 rootHash, bool status);

  event ClaimDeleted(bytes32 rootHash);

  function initialize(address tokenAddress) external override onlyFactory {
    TOKEN = tokenAddress;
  }

  function addClaim(
    address owner,
    bytes32 root,
    uint256 startDate,
    uint256 endDate,
    uint256 tokenAmount,
    bool fees
  ) external override onlyFactory {
    require(!merkleRoots[root], "Drop:: Claim already exists");
    dropData[root] = (
      DropData(owner, startDate, endDate, tokenAmount, fees, true)
    );

    merkleRoots[root] = true;
  }

  function isClaimed(uint256 index, bytes32 rootHash)
    public
    view
    override
    returns (bool status)
  {
    uint256 claimedWordIndex = index / 256;

    uint256 claimedBitIndex = index % 256;

    uint256 claimedWord = claimedBitMap[rootHash][claimedWordIndex];

    uint256 mask = (1 << claimedBitIndex);

    status = claimedWord & mask == mask;
  }

  function _setClaimed(uint256 index, bytes32 rootHash) private {
    uint256 claimedWordIndex = index / 256;

    uint256 claimedBitIndex = index % 256;

    claimedBitMap[rootHash][claimedWordIndex] =
      claimedBitMap[rootHash][claimedWordIndex] |
      (1 << claimedBitIndex);
  }

  function multipleClaim(
    uint256[] calldata index,
    address account,
    uint256[] memory amount,
    bytes32[][] calldata merkleProof,
    bytes32[] calldata rootHashes
  ) external override returns (uint256 amountClaimed) {
    for (uint256 i = 0; i < rootHashes.length; i++) {
      require(merkleRoots[rootHashes[i]], "Drop:: Merkle root does not exist");

      require(dropData[rootHashes[i]].status, "Drop:: Root Hash disabled");

      if (block.timestamp < dropData[rootHashes[i]].startDate) {
        continue;
      }

      bool status = checkEndDate(rootHashes[i]);

      if (!status) {
        continue;
      }

      require(
        !isClaimed(index[i], rootHashes[i]),
        "Drop:: Drop already claimed."
      );

      bytes32 node =
        keccak256(
          abi.encodePacked(
            index[i],
            account,
            amount[i],
            dropData[rootHashes[i]].endDate,
            dropData[rootHashes[i]].startDate
          )
        );

      require(
        MerkleProof.verify(merkleProof[i], rootHashes[i], node),
        "Drop:: Invalid Proof"
      );

      _setClaimed(index[i], rootHashes[i]);

      if (dropData[rootHashes[i]].fees) {
        amount[i] -= calculatePercentage(amount[i]);
      }

      amountClaimed += amount[i];

      dropData[rootHashes[i]].tokenAmount -= amount[i];

      emit Claimed(index[i], amount[i], rootHashes[i], account);
    }

    IERC20(TOKEN).safeTransfer(account, amountClaimed);
  }

  function singleClaim(
    uint256 index,
    address account,
    uint256 amount,
    bytes32[] calldata merkleProof,
    bytes32 rootHash
  ) external override returns (uint256 amountClaimed) {
    require(merkleRoots[rootHash], "Drop:: Merkle root does not exist");

    require(!checkEndDate(rootHash), "Drop:: Drop expired");
    require(
      block.timestamp < dropData[rootHash].startDate,
      "Drop:: Cannot claim before start date"
    );
    require(!isClaimed(index, rootHash), "Drop:: Drop already claimed.");

    bytes32 node =
      keccak256(
        abi.encodePacked(
          index,
          account,
          amount,
          dropData[rootHash].endDate,
          dropData[rootHash].startDate
        )
      );

    require(
      MerkleProof.verify(merkleProof, rootHash, node),
      "Drop:: Invalid Proof"
    );

    require(dropData[rootHash].status, "Drop:: Root Hash disabled");

    _setClaimed(index, rootHash);

    if (dropData[rootHash].fees) {
      amount -= calculatePercentage(amount);
    }

    amountClaimed = amount;

    IERC20(TOKEN).safeTransfer(account, amount);

    dropData[rootHash].tokenAmount = dropData[rootHash].tokenAmount - amount;

    emit Claimed(index, amount, rootHash, account);
  }

  function withdraw(address account, bytes32 merkleRoot) external override {
    require(
      merkleRoots[merkleRoot] == true,
      "Drop:: Merkle root does not exist"
    );
    require(dropData[merkleRoot].owner == msg.sender, "Drop:: Invalid Owner");

    uint256 amount;

    if (dropData[merkleRoot].endDate == 0) {
      amount = dropData[merkleRoot].tokenAmount;
    } else if (
      dropData[merkleRoot].endDate > block.timestamp &&
      dropData[merkleRoot].endDate != type(uint32).max
    ) {
      amount = dropData[merkleRoot].tokenAmount;
    } else if (dropData[merkleRoot].endDate == type(uint32).max) {
      amount = 0;
    }

    if (amount > 0) {
      IERC20(TOKEN).safeTransfer(account, dropData[merkleRoot].tokenAmount);
      delete dropData[merkleRoot];
      emit Withdrawn(account, merkleRoot);
    }
  }

  function checkEndDate(bytes32 rootHash) public returns (bool status) {
    if (dropData[rootHash].endDate < block.timestamp) {
      delete dropData[rootHash];
      status = true;
    }
    status = false;
  }

  function _changeFeesPercent(uint256 newPercent) internal {
    feePercent = newPercent;
  }

  function changeFeesPercent(uint256 percent)
    external
    override
    onlyTimelockContract
  {
    require(percent <= 10000, "Drop :: Invalid fee percent value");
    emit FeesPercentChanged(feePercent, percent);
    _changeFeesPercent(percent);
  }

  function changeClaimStatus(bytes32 rootHash) external override {
    if (msg.sender == dropData[rootHash].owner) {
      dropData[rootHash].status = !dropData[rootHash].status;
      emit ClaimStatusChanged(rootHash, dropData[rootHash].status);
    }
  }

  function deleteClaim(bytes32 rootHash) external override {
    if (msg.sender == dropData[rootHash].owner) {
      delete dropData[rootHash];
      emit ClaimDeleted(rootHash);
    }
  }

  function _changeIndexFundAddress(address newAddress) internal {
    INDEX_FUND_ADDRESS = newAddress;
  }

  function changeIndexFundAddress(address indexFundAddress)
    external
    override
    onlyTimelockContract
  {
    emit IndexAddressChanged(INDEX_FUND_ADDRESS, indexFundAddress);
    _changeIndexFundAddress(indexFundAddress);
  }

  function changeFeeStatus(bytes32 rootHash)
    external
    override
    onlyTimelockContract
  {
    require(merkleRoots[rootHash], "Drop:: Merkle root does not exist");
    emit FeeStatusChanged(!dropData[rootHash].fees);
    dropData[rootHash].fees = !dropData[rootHash].fees;
  }

  function calculatePercentage(uint256 claimAmount)
    public
    returns (uint256 amount)
  {
    amount = (claimAmount * (feePercent)) / 10000;
    IERC20(TOKEN).safeTransfer(INDEX_FUND_ADDRESS, amount);
  }
}
