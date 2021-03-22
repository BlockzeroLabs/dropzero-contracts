// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;
import "./utils/Ownable.sol";
import "./libraries/MerkleProof.sol";
import "./interfaces/IERC20.sol";
import "./libraries/SafeMath.sol";
import "./interfaces/IDrop.sol";

contract Drop is IDrop {
  using SafeMath for uint256;
  using MerkleProof for bytes;

  struct DropData {
    address owner;
    uint256 deadline;
    uint256 tokenAmount;
  }

  address public FACTORY_ADDRESS;

  modifier onlyFactory {
    require(msg.sender == FACTORY_ADDRESS, "Drop:: Not factory address");
    _;
  }

  address public TOKEN;

  mapping(bytes32 => DropData) public dropData;

  mapping(bytes32 => bool) public merkleRoots;

  mapping(bytes32 => mapping(uint256 => uint256)) private claimedBitMap;

  event Withdrawn(address account, bytes32 root);

  event Claimed(
    uint256 index,
    uint256 amount,
    bytes32 merkleRoot,
    address sender
  );

  constructor() public {
    FACTORY_ADDRESS = msg.sender;
  }

  function initialize(address tokenAddress) external override onlyFactory {
    TOKEN = tokenAddress;
  }

  function addClaim(
    address owner,
    bytes32 root,
    uint256 deadline,
    uint256 tokenAmount
  ) external override onlyFactory {
    require(!merkleRoots[root] == true, "Drop:: Claim already exists");

    dropData[root] = (DropData(owner, deadline, tokenAmount));

    merkleRoots[root] = true;
  }

  function isClaimed(uint256 index, bytes32 rootHash)
    public
    view
    override
    returns (bool)
  {
    uint256 claimedWordIndex = index.div(256);

    uint256 claimedBitIndex = index % 256;

    uint256 claimedWord = claimedBitMap[rootHash][claimedWordIndex];

    uint256 mask = (1 << claimedBitIndex);

    return claimedWord & mask == mask;
  }

  function _setClaimed(uint256 index, bytes32 rootHash) private {
    uint256 claimedWordIndex = index.div(256);

    uint256 claimedBitIndex = index % 256;

    claimedBitMap[rootHash][claimedWordIndex] =
      claimedBitMap[rootHash][claimedWordIndex] |
      (1 << claimedBitIndex);
  }

  function multipleClaim(
    uint256[] calldata index,
    address account,
    uint256[] calldata amount,
    bytes32[][] calldata merkleProof,
    bytes32[] calldata rootHashes
  ) external override returns (uint256 amountClaimed) {
    for (uint256 i = 0; i < rootHashes.length; i++) {
      require(
        merkleRoots[rootHashes[i]] == true,
        "Drop:: Merkle root does not exist"
      );

      bool status = checkDeadline(rootHashes[i]);

      if (!status) {
        continue;
      }

      require(
        !isClaimed(index[i], rootHashes[i]),
        "Drop:: Drop already claimed."
      );

      bytes32 node = keccak256(abi.encodePacked(index[i], account, amount[i]));

      require(MerkleProof.verify(merkleProof[i], rootHashes[i], node));

      _setClaimed(index[i], rootHashes[i]);

      amountClaimed = amountClaimed.add(amount[i]);

      dropData[rootHashes[i]].tokenAmount = dropData[rootHashes[i]]
        .tokenAmount
        .sub(amount[i]);

      emit Claimed(index[i], amount[i], rootHashes[i], account);
    }

    require(
      IERC20(TOKEN).transfer(account, amountClaimed),
      "Drop:: Transfer failed."
    );
  }

  function singleClaim(
    uint256 index,
    address account,
    uint256 amount,
    bytes32[] calldata merkleProof,
    bytes32 rootHash
  ) external override returns (uint256 amountClaimed) {
    require(merkleRoots[rootHash] == true, "Drop:: Merkle root does not exist");
    require(checkDeadline(rootHash) == false, "Drop:: Deadline expired");

    require(!isClaimed(index, rootHash), "Drop:: Drop already claimed.");

    bytes32 node = keccak256(abi.encodePacked(index, account, amount));

    require(
      MerkleProof.verify(merkleProof, rootHash, node),
      "Drop:: Invalid Proof"
    );

    _setClaimed(index, rootHash);

    amountClaimed = amount;

    require(IERC20(TOKEN).transfer(account, amount), "Drop:: Transfer failed");

    dropData[rootHash].tokenAmount = dropData[rootHash].tokenAmount.sub(amount);

    emit Claimed(index, amount, rootHash, account);
  }

  function withdraw(address account, bytes32 merkleRoot) external override {
    require(
      merkleRoots[merkleRoot] == true,
      "Drop:: Merkle root does not exist"
    );
    //require(dropData[merkleRoot].deadline < block.timestamp,"Drop:: Claim not expired yet");
    require(dropData[merkleRoot].owner == msg.sender, "Drop:: Invalid Owner");

    uint256 amount;

    if (dropData[merkleRoot].deadline == 0) {
      amount = dropData[merkleRoot].tokenAmount;
    } else if (
      dropData[merkleRoot].deadline > block.timestamp &&
      dropData[merkleRoot].deadline != type(uint32).max
    ) {
      amount = dropData[merkleRoot].tokenAmount;
    } else if (dropData[merkleRoot].deadline == type(uint32).max) {
      amount = 0;
    }

    if (amount > 0) {
      IERC20(TOKEN).transfer(account, dropData[merkleRoot].tokenAmount);
      delete dropData[merkleRoot];
      emit Withdrawn(account, merkleRoot);
    }
  }

  function checkDeadline(bytes32 rootHash) public returns (bool status) {
    if (dropData[rootHash].deadline < block.timestamp) {
      delete dropData[rootHash];
      return true;
    }
    return false;
  }
}