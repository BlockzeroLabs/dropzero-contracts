// SPDX-License-Identifier: MIT
pragma solidity 0.8.3;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Drop {
    using MerkleProof for bytes;
    using SafeERC20 for IERC20;

    struct DropData {
        uint256 deadline;
        uint256 tokenAmount;
        address owner;
    }

    address public factory;
    address public token;

    mapping(bytes32 => DropData) public dropData;
    mapping(bytes32 => mapping(uint256 => uint256)) private claimedBitMap;

    constructor() {
        factory = msg.sender;
    }

    modifier onlyFactory {
        require(msg.sender == factory, "DROP_ONLY_FACTORY");
        _;
    }

    function initialize(address tokenAddress) external onlyFactory {
        token = tokenAddress;
    }

    function addDropData(
        address owner,
        bytes32 merkleRoot,
        uint256 deadline,
        uint256 tokenAmount
    ) external onlyFactory {
        require(dropData[merkleRoot].deadline == 0, "DROP_EXISTS");
        require(deadline > block.timestamp, "DROP_INVALID_DEADLINE");
        dropData[merkleRoot] = DropData(deadline, tokenAmount, owner);
    }

    function claim(
        uint256 index,
        address account,
        uint256 amount,
        bytes32 merkleRoot,
        bytes32[] calldata merkleProof
    ) external onlyFactory {
        require(dropData[merkleRoot].deadline > block.timestamp, "DROP_DEADLINE_EXPIRED");
        require(!isClaimed(index, merkleRoot), "DROP_ALREADY_CLAIMED");

        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(index, account, amount));
        require(MerkleProof.verify(merkleProof, merkleRoot, node), "DROP_INVALID_PROOF");

        // Subtract from the drop amount
        dropData[merkleRoot].tokenAmount -= amount;

        // Mark it claimed and send the tokens.
        _setClaimed(index, merkleRoot);
        IERC20(token).safeTransfer(account, amount);
    }

    function withdrawAfterDeadline(address account, bytes32 merkleRoot) external onlyFactory returns (uint256) {
        DropData memory dd = dropData[merkleRoot];
        require(dd.deadline > 0 && dd.deadline < block.timestamp, "DROP_NOT_EXPIRED");
        require(dd.owner == account, "DROP_ONLY_OWNER");

        delete dropData[merkleRoot];

        IERC20(token).safeTransfer(account, dd.tokenAmount);
        return dd.tokenAmount;
    }

    function isClaimed(uint256 index, bytes32 merkleRoot) public view returns (bool) {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        uint256 claimedWord = claimedBitMap[merkleRoot][claimedWordIndex];
        uint256 mask = (1 << claimedBitIndex);
        return claimedWord & mask == mask;
    }

    function _setClaimed(uint256 index, bytes32 merkleRoot) private {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        claimedBitMap[merkleRoot][claimedWordIndex] = claimedBitMap[merkleRoot][claimedWordIndex] | (1 << claimedBitIndex);
    }
}
